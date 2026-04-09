import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { BarChart3, Users, TrendingUp, DollarSign, Loader2 } from 'lucide-react'
import { useClientes } from '@/hooks/useClientes'
import { formatCurrency, formatPercent } from '@/lib/utils'

const RED    = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'
const WHITE  = '#ffffff'

const CONTRACT_COLORS: Record<string, string> = {
  Anual:      GREEN,
  Semestral:  '#f59e0b',
  Trimestral: WHITE,
  Mensal:     'rgba(255,255,255,0.5)',
}

const STATUS_COLORS: Record<string, string> = {
  Ativo:   GREEN,
  Trial:   WHITE,
  Inativo: '#f59e0b',
  Churned: RED,
}

function toMRR(revenue: number, contractType: string): number {
  const div = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }[contractType] ?? 1
  return revenue / div
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { value: number; name: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 shadow-2xl text-xs" style={{ background: '#1a1a1a', border: CARD_B }}>
      <p className="font-semibold text-white/70 mb-1">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="text-white/60">
          {typeof p.value === 'number' && p.value > 100
            ? formatCurrency(p.value)
            : `${p.value} clientes`}
        </div>
      ))}
    </div>
  )
}

export function Relatorios() {
  const { clients, loading } = useClientes()

  const stats = useMemo(() => {
    if (clients.length === 0) return null

    const active  = clients.filter(c => c.status === 'Ativo')
    const mrr     = active.reduce((s, c) => s + toMRR(c.revenue, c.contract_type), 0)
    const arr     = mrr * 12
    const churned = clients.filter(c => c.status === 'Churned').length
    const churnRate = clients.length > 0 ? (churned / clients.length) * 100 : 0

    // By segment
    const segMap = new Map<string, { count: number; mrr: number }>()
    for (const c of clients) {
      const seg = c.segment || 'Outros'
      const cur = segMap.get(seg) ?? { count: 0, mrr: 0 }
      segMap.set(seg, {
        count: cur.count + 1,
        mrr: cur.mrr + (c.status === 'Ativo' ? toMRR(c.revenue, c.contract_type) : 0),
      })
    }
    const bySegment = [...segMap.entries()]
      .map(([segment, v]) => ({ segment, count: v.count, mrr: Math.round(v.mrr) }))
      .sort((a, b) => b.mrr - a.mrr)

    // By contract type
    const ctMap = new Map<string, number>()
    for (const c of clients) {
      ctMap.set(c.contract_type, (ctMap.get(c.contract_type) ?? 0) + 1)
    }
    const byContract = ['Anual', 'Semestral', 'Trimestral', 'Mensal'].map(ct => ({
      type: ct, count: ctMap.get(ct) ?? 0,
    }))

    // By status
    const byStatus = ['Ativo', 'Trial', 'Inativo', 'Churned'].map(s => ({
      status: s, count: clients.filter(c => c.status === s).length,
    }))

    // Top 10 by MRR
    const topClients = [...clients]
      .filter(c => c.status === 'Ativo')
      .map(c => ({ ...c, mrr: toMRR(c.revenue, c.contract_type) }))
      .sort((a, b) => b.mrr - a.mrr)
      .slice(0, 10)

    return { mrr, arr, churnRate, bySegment, byContract, byStatus, topClients, active: active.length, total: clients.length }
  }, [clients])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: RED }} />
        <span className="text-sm">Carregando relatórios...</span>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Dados reais · Supabase
        </p>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Relatórios</h1>
      </div>

      {/* No data */}
      {!stats ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-20 text-center"
          style={{ background: CARD, border: CARD_B }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <BarChart3 className="h-7 w-7" style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
          <p className="text-[14px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Sem dados para exibir</p>
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Cadastre clientes para gerar relatórios com dados reais
          </p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'MRR', sublabel: 'Mensal recorrente',  value: formatCurrency(stats.mrr),          color: RED,   icon: DollarSign },
              { label: 'ARR', sublabel: 'Anual projetado',    value: formatCurrency(stats.arr),          color: GREEN,  icon: TrendingUp },
              { label: 'Clientes Ativos', sublabel: `de ${stats.total} total`, value: String(stats.active), color: WHITE, icon: Users },
              { label: 'Churn Rate', sublabel: 'Taxa de cancelamento', value: formatPercent(stats.churnRate), color: stats.churnRate > 5 ? RED : GREEN, icon: BarChart3 },
            ].map(c => (
              <div key={c.label} className="rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.sublabel}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                    style={{ background: c.color === WHITE ? 'rgba(255,255,255,0.08)' : `${c.color}18` }}>
                    <c.icon className="h-4 w-4" style={{ color: c.color }} />
                  </div>
                </div>
                <p className="text-[22px] md:text-[26px] font-black leading-none tracking-tight text-white">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* MRR por Segmento */}
            <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
              <p className="text-[13px] font-bold text-white/80 mb-1">MRR por Segmento</p>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Receita mensal por área de atuação</p>
              {stats.bySegment.every(s => s.mrr === 0) ? (
                <div className="flex items-center justify-center h-40 text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Sem clientes ativos
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.bySegment} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="segment" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false}
                      tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                      {stats.bySegment.map((_, i) => (
                        <Cell key={i} fill={[RED, GREEN, WHITE, '#f59e0b', '#a3a3a3', '#525252'][i % 6]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Clientes por tipo de contrato */}
            <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
              <p className="text-[13px] font-bold text-white/80 mb-1">Tipo de Contrato</p>
              <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Distribuição por periodicidade</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.byContract} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.byContract.map((d, i) => (
                      <Cell key={i} fill={CONTRACT_COLORS[d.type] ?? 'rgba(255,255,255,0.3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.byStatus.map(s => (
              <div key={s.status} className="rounded-2xl p-4" style={{ background: CARD, border: CARD_B }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.status}</span>
                  <div className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[s.status] ?? WHITE }} />
                </div>
                <p className="text-[28px] font-black leading-none" style={{ color: STATUS_COLORS[s.status] ?? WHITE }}>
                  {s.count}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {stats.total > 0 ? formatPercent((s.count / stats.total) * 100) : '0%'} do total
                </p>
              </div>
            ))}
          </div>

          {/* Top clients table */}
          {stats.topClients.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: CARD_B }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[13px] font-bold text-white/80">Top Clientes por MRR</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Clientes ativos ordenados por receita mensal</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {['#', 'Cliente', 'Empresa', 'Segmento', 'Contrato', 'MRR'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em]"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topClients.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                        className="transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-bold"
                            style={{ background: i === 0 ? `${RED}25` : 'rgba(255,255,255,0.06)', color: i === 0 ? RED : 'rgba(255,255,255,0.4)' }}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>{c.name}</td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.company}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}>
                            {c.segment || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-bold"
                          style={{ color: CONTRACT_COLORS[c.contract_type] ?? WHITE }}>
                          {c.contract_type}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-black" style={{ color: GREEN }}>
                          {formatCurrency(c.mrr)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
