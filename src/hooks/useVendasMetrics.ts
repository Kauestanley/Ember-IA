import { useState, useEffect, useCallback } from 'react'
import { supabase, type ClientRow } from '@/lib/supabase'

function toMonthlyRevenue(c: ClientRow): number {
  const divisor = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }[c.contract_type]
  return c.revenue / divisor
}

export interface MonthlyMRR {
  month: string
  mrr: number
}

export interface SegmentData {
  segment: string
  value: number // percentage
  count: number
}

export interface StatusCount {
  status: string
  count: number
  color: string
}

export interface VendasMetrics {
  totalClients: number
  activeClients: number
  trialClients: number
  inactiveClients: number
  churnedClients: number
  mrr: number
  arr: number
  avgContractDuration: number
  churnRate: number
  ltv: number
  cac: number
  marketingSpend: number
  adSpend: number
  newClientsThisMonth: number
  revenueGrowthMoM: number
  // computed from real data
  ytd: number
  monthlyMRR: MonthlyMRR[]
  segmentData: SegmentData[]
  statusCounts: StatusCount[]
}

function computeMonthlyMRR(clients: ClientRow[]): MonthlyMRR[] {
  const now = new Date()
  const result: MonthlyMRR[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    const monthMRR = clients
      .filter(c => {
        const start = new Date(c.start_date)
        return start <= monthEnd && (c.status === 'Ativo' || c.status === 'Trial')
      })
      .reduce((s, c) => s + toMonthlyRevenue(c), 0)

    result.push({
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
      mrr: Math.round(monthMRR),
    })
  }

  return result
}

function computeSegmentData(clients: ClientRow[]): SegmentData[] {
  const active = clients.filter(c => c.status === 'Ativo' || c.status === 'Trial')
  if (active.length === 0) return []

  const map = new Map<string, number>()
  for (const c of active) {
    const seg = c.segment?.trim() || 'Outros'
    map.set(seg, (map.get(seg) ?? 0) + 1)
  }

  const total = active.length
  return [...map.entries()]
    .map(([segment, count]) => ({
      segment,
      count,
      value: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

const STATUS_COLORS: Record<string, string> = {
  Ativo:   '#22c55e',
  Trial:   'rgba(255,255,255,0.7)',
  Inativo: '#f59e0b',
  Churned: '#ef4444',
}

function computeMetrics(data: ClientRow[]): VendasMetrics {
  const total   = data.length
  const active  = data.filter(c => c.status === 'Ativo')
  const trial   = data.filter(c => c.status === 'Trial')
  const inactive = data.filter(c => c.status === 'Inativo')
  const churned = data.filter(c => c.status === 'Churned')
  const mrr     = active.reduce((s, c) => s + toMonthlyRevenue(c), 0)

  const durationMap = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }
  const avgDuration = active.length
    ? active.reduce((s, c) => s + durationMap[c.contract_type], 0) / active.length
    : 0

  const churnRate = total > 0 ? (churned.length / total) * 100 : 0

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const newThisMonth = data.filter(c => new Date(c.start_date) >= thisMonth).length

  // YTD: sum of MRR for each month of the current year up to now
  const monthlyMRR = computeMonthlyMRR(data)
  const currentMonth = new Date().getMonth() // 0-based
  const ytd = monthlyMRR
    .slice(Math.max(0, monthlyMRR.length - (currentMonth + 1)))
    .reduce((s, m) => s + m.mrr, 0)

  const statusCounts: StatusCount[] = ['Ativo', 'Trial', 'Inativo', 'Churned'].map(status => ({
    status,
    count: data.filter(c => c.status === status).length,
    color: STATUS_COLORS[status],
  }))

  return {
    totalClients: total,
    activeClients: active.length,
    trialClients: trial.length,
    inactiveClients: inactive.length,
    churnedClients: churned.length,
    mrr: Math.round(mrr),
    arr: Math.round(mrr * 12),
    avgContractDuration: Math.round(avgDuration * 10) / 10,
    churnRate: Math.round(churnRate * 10) / 10,
    ltv: 68400,
    cac: 2150,
    marketingSpend: 45000,
    adSpend: 22000,
    newClientsThisMonth: newThisMonth,
    revenueGrowthMoM: 4.3,
    ytd,
    monthlyMRR,
    segmentData: computeSegmentData(data),
    statusCounts,
  }
}

export function useVendasMetrics() {
  const [metrics, setMetrics] = useState<VendasMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*')
    if (data) setMetrics(computeMetrics(data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    const channel = supabase
      .channel('vendas-metrics-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => load())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { metrics, loading }
}
