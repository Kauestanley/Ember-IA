import { useState, useEffect, useCallback } from 'react'
import { supabase, type ClientRow } from '@/lib/supabase'

function toMonthlyRevenue(c: ClientRow): number {
  const divisor = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }[c.contract_type]
  return c.revenue / divisor
}

export interface VendasMetrics {
  totalClients: number
  activeClients: number
  trialClients: number
  churnedClients: number
  mrr: number
  arr: number
  avgContractDuration: number
  churnRate: number
  // static values kept from business context
  ltv: number
  cac: number
  marketingSpend: number
  adSpend: number
  newClientsThisMonth: number
  revenueGrowthMoM: number
}

function computeMetrics(data: ClientRow[]): VendasMetrics {
  const clients = data
  const total   = clients.length
  const active  = clients.filter(c => c.status === 'Ativo')
  const churned = clients.filter(c => c.status === 'Churned').length
  const mrr     = active.reduce((s, c) => s + toMonthlyRevenue(c), 0)

  const durationMap = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }
  const avgDuration = active.length
    ? active.reduce((s, c) => s + durationMap[c.contract_type], 0) / active.length
    : 0

  const churnRate = total > 0 ? (churned / total) * 100 : 0

  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  const newThisMonth = clients.filter(c => new Date(c.start_date) >= thisMonth).length

  return {
    totalClients: total,
    activeClients: active.length,
    trialClients: clients.filter(c => c.status === 'Trial').length,
    churnedClients: churned,
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
  }
}

export function useVendasMetrics() {
  const [metrics, setMetrics] = useState<VendasMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('clients').select('*')
    if (data) {
      setMetrics(computeMetrics(data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()

    // Real-time subscription: recalculate KPIs on any client change
    const channel = supabase
      .channel('vendas-metrics-clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => { load() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [load])

  return { metrics, loading }
}
