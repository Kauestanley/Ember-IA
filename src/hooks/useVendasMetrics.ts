import { useState, useEffect } from 'react'
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

export function useVendasMetrics() {
  const [metrics, setMetrics] = useState<VendasMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('clients').select('*')
      if (!data) { setLoading(false); return }

      const clients: ClientRow[] = data
      const total = clients.length
      const active = clients.filter(c => c.status === 'Ativo')
      const churned = clients.filter(c => c.status === 'Churned').length
      const mrr = active.reduce((s, c) => s + toMonthlyRevenue(c), 0)

      // avg contract duration in months based on contract type
      const durationMap = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }
      const avgDuration = active.length
        ? active.reduce((s, c) => s + durationMap[c.contract_type], 0) / active.length
        : 0

      const churnRate = total > 0 ? (churned / total) * 100 : 0

      // new clients this month
      const thisMonth = new Date()
      thisMonth.setDate(1)
      const newThisMonth = clients.filter(c => new Date(c.start_date) >= thisMonth).length

      setMetrics({
        totalClients: total,
        activeClients: active.length,
        trialClients: clients.filter(c => c.status === 'Trial').length,
        churnedClients: churned,
        mrr: Math.round(mrr),
        arr: Math.round(mrr * 12),
        avgContractDuration: Math.round(avgDuration * 10) / 10,
        churnRate: Math.round(churnRate * 10) / 10,
        // business constants (would come from a config table in production)
        ltv: 68400,
        cac: 2150,
        marketingSpend: 45000,
        adSpend: 22000,
        newClientsThisMonth: newThisMonth,
        revenueGrowthMoM: 4.3,
      })
      setLoading(false)
    }
    load()
  }, [])

  return { metrics, loading }
}
