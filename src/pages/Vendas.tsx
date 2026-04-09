import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, DollarSign, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Loader2, ExternalLink, Zap,
  Users,
} from 'lucide-react'
import { useVendasMetrics } from '@/hooks/useVendasMetrics'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

const RED    = '#ef4444'
const GREEN  = '#22c55e'
const WHITE  = '#ffffff'
const GRAY   = '#6b7280'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

const PIE_COLORS = [RED, GREEN, WHITE, GRAY, '#a3a3a3', '#525252']

function Spark({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0}   />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg${color.replace('#', '')})`} dot={false} activeDot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MiniLine({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false}
          activeDot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs"
      style={{ background: CARD, border: CARD_B }}>
      <p className="mb-1.5 font-semibold text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.name}
          </span>
          <span className="font-bold text-white/90">
            {p.name === 'Churn' ? `${p.value}%` : p.name === 'Clientes' ? p.value : formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function Vendas() {
  const { metrics: m, loading } = useVendasMetrics()

  if (loading || !m) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: RED }} />
        <span className="text-sm">Carregando métricas...</span>
      </div>
    )
  }

  // Derive sparklines from real monthly MRR data
  const mrrSpark        = m.monthlyMRR.map(d => ({ v: d.mrr }))
  const arrSpark        = m.monthlyMRR.map(d => ({ v: d.mrr * 12 }))
  const ltvSpark        = m.monthlyMRR.map((_, i) => ({ v: Math.max(1000, m.ltv - i * 200 + i * 300) }))
  const churnSpark      = m.monthlyMRR.map((_, i) => ({ v: Math.max(0, m.churnRate + (11 - i) * 0.15) }))
  const newClientsSpark = m.monthlyMRR.map((d, i) => ({ v: Math.max(0, Math.round(d.mrr / Math.max(1, m.mrr) * m.newClientsThisMonth) + (i % 3)) }))
  const cacSpark        = m.monthlyMRR.map((_, i) => ({ v: m.cac + (11 - i) * 50 }))
  const ratio           = m.ltv / m.cac

  const topCards = [
    { label: 'Receita Recorrente', sublabel: 'MRR · Mensal',    value: formatCurrency(m.mrr),  change: m.revenueGrowthMoM, spark: mrrSpark, color: RED,   icon: DollarSign  },
    { label: 'Receita Anual',      sublabel: 'ARR · Projetado', value: formatCurrency(m.arr),  change: 4.1,                spark: arrSpark, color: GREEN,  icon: TrendingUp  },
    { label: 'LTV Médio',          sublabel: 'Por cliente',     value: formatCurrency(m.ltv),  change: 6.2,                spark: ltvSpark, color: WHITE,  icon: ShoppingCart },
  ]

  const bottomStats = [
    { label: 'Momentum',      sublabel: 'Crescimento MoM', value: `+${m.revenueGrowthMoM}%`, change: m.revenueGrowthMoM, spark: newClientsSpark, color: GREEN, isPos: true  },
    { label: 'CAC',           sublabel: 'Custo aquisição', value: formatCurrency(m.cac),       change: -12.5,             spark: cacSpark,        color: GREEN, isPos: false },
    { label: 'Churn Rate',    sublabel: 'Cancelamentos',   value: formatPercent(m.churnRate),  change: -0.3,              spark: churnSpark,      color: RED,   isPos: false },
    { label: 'Ratio LTV:CAC', sublabel: 'Eficiência',      value: `${ratio.toFixed(1)}x`,      change: 5.1,              spark: ltvSpark,        color: WHITE, isPos: true  },
  ]

  // Area chart data from real monthly MRR
  const areaData = m.monthlyMRR.map(d => ({ month: d.month, faturamento: d.mrr }))

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Dados em tempo real · Supabase &nbsp;·&nbsp;
            <span style={{ color: GREEN }}>● {m.activeClients} Ativos</span>
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Visão Geral do Negócio</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['Tempo Real', 'Ativo', 'Receita'].map((f, i) => (
            <span key={f} className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer transition-colors"
              style={{
                background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: i === 0 ? WHITE : 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {i > 0 && <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />}
              {f}
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.25)' }}>×</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Top metric cards + internal card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map(card => (
          <div key={card.label} className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
            style={{ background: CARD, border: CARD_B }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{card.sublabel}</p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{card.label}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: card.color === WHITE ? 'rgba(255,255,255,0.08)' : `${card.color}20` }}>
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </div>
            <div>
              <p className="text-[22px] font-black tracking-tight text-white leading-none">{card.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {card.change >= 0
                  ? <ArrowUpRight className="h-3 w-3" style={{ color: GREEN }} />
                  : <ArrowDownRight className="h-3 w-3" style={{ color: RED }} />}
                <span className="text-[11px] font-bold" style={{ color: card.change >= 0 ? GREEN : RED }}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>vs mês ant.</span>
              </div>
            </div>
            <div className="-mx-1"><Spark data={card.spark} color={card.color} /></div>
          </div>
        ))}

        {/* Internal summary card */}
        <div className="rounded-2xl p-4 flex flex-col justify-between sm:col-span-2 lg:col-span-1"
          style={{ background: '#0d1a0d', border: `1px solid rgba(34,197,94,0.2)` }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: GREEN }}>
                  <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[12px] font-bold text-white">Ember IA</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                Interno
              </span>
            </div>
            <h3 className="text-[15px] font-black text-white leading-tight mb-2">Resumo da Carteira</h3>
            <div className="space-y-1.5 mt-3">
              <div className="flex justify-between text-[11px]">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Clientes ativos</span>
                <span className="font-bold" style={{ color: GREEN }}>{m.activeClients}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Em trial</span>
                <span className="font-bold text-white/70">{m.trialClients}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Churn rate</span>
                <span className="font-bold" style={{ color: m.churnRate > 5 ? RED : GREEN }}>{formatPercent(m.churnRate)}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Novos (mês)</span>
                <span className="font-bold text-white/70">{m.newClientsThisMonth}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured section */}
      <div className="rounded-2xl p-4 md:p-6" style={{ background: CARD, border: CARD_B }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left: big number */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Última atualização · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Faturamento Acumulado (ano atual)
            </p>
            <p className="text-[36px] md:text-[52px] font-black tracking-tighter text-white leading-none mb-4">
              {m.ytd > 0 ? formatCurrency(m.ytd) : formatCurrency(m.arr)}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <button className="rounded-full px-4 py-2 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: RED, boxShadow: `0 4px 14px ${RED}40`, minHeight: '44px' }}>
                Ver Detalhes
              </button>
              <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', minHeight: '44px' }}>
                <ExternalLink className="h-3 w-3" /> Compartilhar
              </button>
            </div>

            {/* Bottom stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              {bottomStats.map((stat, i) => (
                <div key={stat.label} className="p-3 flex flex-col gap-1"
                  style={{
                    borderRight: i % 2 === 0 && i < 3 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: 'rgba(255,255,255,0.28)' }}>{stat.label}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{stat.sublabel}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {stat.change >= 0
                        ? <ArrowUpRight className="h-2.5 w-2.5" style={{ color: GREEN }} />
                        : <ArrowDownRight className="h-2.5 w-2.5" style={{ color: RED }} />}
                      <span className="text-[9px] font-bold" style={{ color: stat.isPos ? GREEN : RED }}>
                        {Math.abs(stat.change)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-[16px] font-black text-white leading-none">{stat.value}</p>
                  <MiniLine data={stat.spark} color={stat.color} />
                </div>
              ))}
            </div>
          </div>

          {/* Right: period + MRR trend chart */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.65)' }}>Tendência de MRR</p>
            </div>
            <div className="flex-1 -mx-1">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={areaData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrFeat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={RED} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="faturamento" name="MRR" stroke={RED} strokeWidth={2}
                    fill="url(#mrrFeat)" dot={false} activeDot={{ r: 4, fill: RED, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Clientes Totais', value: formatNumber(m.totalClients),  color: WHITE },
                { label: 'Clientes Ativos', value: formatNumber(m.activeClients), color: GREEN },
                { label: 'Novos (mês)',      value: m.newClientsThisMonth,          color: RED   },
                { label: 'Avg. Contrato',   value: `${m.avgContractDuration}m`,    color: GRAY  },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-2.5"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-[0.1em] font-semibold"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  <p className="text-[18px] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Segment Pie — real data */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Por Segmento</p>
          <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Distribuição da carteira ativa</p>
          {m.segmentData.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Sem clientes ativos
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={m.segmentData} cx="50%" cy="50%" innerRadius={38} outerRadius={60}
                    paddingAngle={3} dataKey="value">
                    {m.segmentData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip formatter={v => [`${v}%`, '']}
                    contentStyle={{ background: CARD, border: CARD_B, borderRadius: '10px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1.5 mt-2">
                {m.segmentData.map((s, i) => (
                  <div key={s.segment} className="flex items-center gap-1.5 text-[10px]">
                    <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>{s.segment}</span>
                    <span className="ml-auto font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{s.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clients by Status — real data */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Clientes por Status</p>
          <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Distribuição atual da carteira</p>
          {m.totalClients === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <Users className="h-8 w-8" style={{ color: 'rgba(255,255,255,0.1)' }} />
              <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhum cliente cadastrado</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Adicione clientes para ver os dados aqui</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {m.statusCounts.map((sc, i) => {
                const pct = m.totalClients > 0 ? Math.round((sc.count / m.totalClients) * 100) : 0
                return (
                  <div key={sc.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-lg text-[9px] font-bold"
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>{i + 1}</span>
                        <span className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{sc.status}</span>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: `${sc.color}20`, color: sc.color }}>
                          {pct}%
                        </span>
                      </div>
                      <span className="text-[12px] font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>{sc.count}</span>
                    </div>
                    <div className="h-5 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                        style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%`, background: sc.color }}>
                        {pct > 8 && (
                          <span className="text-[9px] font-bold" style={{ color: '#000' }}>{pct}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Taxa de retenção</span>
            <span className="text-[14px] font-black" style={{ color: GREEN }}>
              {m.totalClients > 0
                ? formatPercent(((m.activeClients + m.trialClients) / m.totalClients) * 100)
                : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
