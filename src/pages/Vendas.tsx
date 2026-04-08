import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import {
  TrendingUp, DollarSign, ShoppingCart,
  ArrowUpRight, ArrowDownRight, Loader2,
  ExternalLink, Zap,
} from 'lucide-react'
import { monthlyRevenue, churnTrend, salesBySegment, funnelData } from '@/data/mockData'
import { useVendasMetrics } from '@/hooks/useVendasMetrics'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#6b7280']

// Mini sparkline with no axes/grid
function Spark({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={52}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color.replace('#', '')})`}
          dot={false}
          activeDot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function MiniLine({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={36}>
      <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="mb-1.5 font-semibold text-white/80 text-[11px]">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.name}
          </span>
          <span className="font-semibold text-white/90">
            {p.name === 'Churn' ? `${p.value}%` : p.name === 'Novos' ? p.value : formatCurrency(p.value)}
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
        <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
        <span className="text-sm">Carregando métricas...</span>
      </div>
    )
  }

  const mrrSpark = monthlyRevenue.map(d => ({ v: d.faturamento }))
  const arrSpark = monthlyRevenue.map(d => ({ v: d.faturamento * 12 }))
  const ltvSpark = monthlyRevenue.map((_, i) => ({ v: 62000 + i * 550 }))
  const churnSpark = churnTrend.map(d => ({ v: d.churn }))
  const newClientsSpark = churnTrend.map(d => ({ v: d.newClients }))
  const cacSpark = monthlyRevenue.map((_, i) => ({ v: 3200 - i * 85 }))
  const ratio = m.ltv / m.cac

  // Top 3 metric asset cards (like "Top Staking Assets")
  const topCards = [
    {
      label: 'Receita Recorrente',
      sublabel: 'MRR · Mensal',
      value: formatCurrency(m.mrr),
      change: m.revenueGrowthMoM,
      spark: mrrSpark,
      color: '#6366f1',
      icon: DollarSign,
      iconBg: 'rgba(99,102,241,0.15)',
    },
    {
      label: 'Receita Anual',
      sublabel: 'ARR · Projetado',
      value: formatCurrency(m.arr),
      change: 4.1,
      spark: arrSpark,
      color: '#10b981',
      icon: TrendingUp,
      iconBg: 'rgba(16,185,129,0.15)',
    },
    {
      label: 'LTV Médio',
      sublabel: 'Valor vitalício · Cliente',
      value: formatCurrency(m.ltv),
      change: 6.2,
      spark: ltvSpark,
      color: '#8b5cf6',
      icon: ShoppingCart,
      iconBg: 'rgba(139,92,246,0.15)',
    },
  ]

  const bottomStats = [
    { label: 'Momentum', sublabel: 'Crescimento MoM', value: `+${m.revenueGrowthMoM}%`, change: m.revenueGrowthMoM, spark: newClientsSpark, color: '#6366f1', isPositive: true },
    { label: 'CAC', sublabel: 'Custo de aquisição', value: formatCurrency(m.cac), change: -12.5, spark: cacSpark, color: '#10b981', isPositive: false },
    { label: 'Churn Rate', sublabel: 'Taxa de cancelamento', value: formatPercent(m.churnRate), change: -0.3, spark: churnSpark, color: '#f43f5e', isPositive: false },
    { label: 'Ratio LTV:CAC', sublabel: 'Eficiência', value: `${ratio.toFixed(1)}x`, change: 5.1, spark: ltvSpark, color: '#f59e0b', isPositive: true },
  ]

  return (
    <div className="p-6 space-y-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Recomendados para as últimas 24h &nbsp;·&nbsp;
            <span className="inline-flex items-center gap-1 text-indigo-400">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 inline-block" />
              {topCards.length} Métricas
            </span>
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Visão Geral do Negócio</h1>
        </div>
        <div className="flex items-center gap-2">
          {['24H', 'Ativo', 'Receita'].map((f, i) => (
            <span
              key={f}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer transition-colors hover:bg-white/[0.08]"
              style={{
                background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {i > 0 && <span className="h-1.5 w-1.5 rounded-full bg-white/20" />}
              {f}
              {i > 0 && <span style={{ color: 'rgba(255,255,255,0.25)' }}>×</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Top metric cards + promo card */}
      <div className="grid grid-cols-4 gap-4">
        {topCards.map(card => (
          <div
            key={card.label}
            className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.01] cursor-pointer group"
            style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {card.sublabel}
                </p>
                <p className="text-[12px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {card.label}
                </p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: card.iconBg }}>
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
            </div>

            {/* Value */}
            <div>
              <p className="text-[22px] font-black tracking-tight text-white leading-none">{card.value}</p>
              <div className="flex items-center gap-1 mt-1.5">
                {card.change >= 0
                  ? <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                  : <ArrowDownRight className="h-3 w-3 text-rose-400" />
                }
                <span className={`text-[11px] font-bold ${card.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {card.change >= 0 ? '+' : ''}{card.change}%
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>vs mês ant.</span>
              </div>
            </div>

            {/* Sparkline */}
            <div className="mt-1 -mx-1">
              <Spark data={card.spark} color={card.color} />
            </div>
          </div>
        ))}

        {/* Promo card (purple gradient) */}
        <div
          className="rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:opacity-95 transition-opacity"
          style={{ background: 'linear-gradient(145deg, #3730a3 0%, #6d28d9 40%, #7c3aed 70%, #4c1d95 100%)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
                  <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-[12px] font-bold text-white">AI Agency</span>
              </div>
              <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white/90" style={{ background: 'rgba(255,255,255,0.2)' }}>
                Pro
              </span>
            </div>
            <h3 className="text-[18px] font-black text-white leading-tight mb-2">
              Portfolio de IA Completo
            </h3>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Plataforma all-in-one para agências de inteligência artificial crescerem com dados.
            </p>
          </div>
          <div className="space-y-2 mt-4">
            <button className="w-full rounded-xl py-2 text-[12px] font-bold text-white/90 transition-colors hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              Ver Relatório Completo
            </button>
            <button className="w-full rounded-xl py-2 text-[12px] font-bold transition-colors" style={{ background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Exportar Dados
            </button>
          </div>
        </div>
      </div>

      {/* Featured section — big number + period selector + bottom stats */}
      <div
        className="rounded-2xl p-6"
        style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="grid grid-cols-3 gap-8">
          {/* Left: featured metric */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Última atualização · {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <p className="text-[13px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Faturamento Total Acumulado (2024)
            </p>
            <p className="text-[52px] font-black tracking-tighter text-white leading-none mb-4">
              {formatCurrency(monthlyRevenue.reduce((s, d) => s + d.faturamento, 0))}
            </p>

            <div className="flex items-center gap-3 mb-6">
              <button
                className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
              >
                Ver Detalhes
              </button>
              <button
                className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-white/[0.08]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                Exportar
              </button>
              <button
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors hover:bg-white/[0.08]"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                <ExternalLink className="h-3 w-3" /> Compartilhar
              </button>
            </div>

            {/* Bottom stats row */}
            <div
              className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {bottomStats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-3 flex flex-col gap-1"
                  style={{
                    borderRight: i < bottomStats.length - 1 ? '1px solid rgba(255,255,255,0.07)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        {stat.label}
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{stat.sublabel}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {stat.change >= 0
                        ? <ArrowUpRight className="h-2.5 w-2.5 text-emerald-400" />
                        : <ArrowDownRight className="h-2.5 w-2.5 text-rose-400" />
                      }
                      <span className={`text-[9px] font-bold ${stat.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
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

          {/* Right: period selector + chart */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-white/70">Período de Análise</p>
              <div className="flex gap-1">
                {['1M', '3M', '6M', '12M'].map((p, i) => (
                  <button
                    key={p}
                    className="rounded-lg px-2 py-1 text-[10px] font-bold transition-colors"
                    style={{
                      background: i === 3 ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                      color: i === 3 ? '#818cf8' : 'rgba(255,255,255,0.3)',
                      border: i === 3 ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Mini area chart of MRR */}
            <div className="flex-1 -mx-1">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrFeat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#6366f1" strokeWidth={2} fill="url(#mrrFeat)" dot={false} activeDot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Summary below chart */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                { label: 'Clientes Totais', value: formatNumber(m.totalClients), color: '#6366f1' },
                { label: 'Clientes Ativos', value: formatNumber(m.activeClients), color: '#10b981' },
                { label: 'Novos (mês)', value: m.newClientsThisMonth, color: '#8b5cf6' },
                { label: 'Avg. Contrato', value: `${m.avgContractDuration}m`, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] uppercase tracking-[0.1em] font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{s.label}</p>
                  <p className="text-[18px] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Segmento pie + Funil */}
      <div className="grid grid-cols-3 gap-4">
        {/* Clientes por segmento */}
        <div className="rounded-2xl p-5" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Clientes por Segmento</p>
          <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Distribuição da carteira ativa</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={salesBySegment} cx="50%" cy="50%" innerRadius={38} outerRadius={60} paddingAngle={3} dataKey="value">
                {salesBySegment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />)}
              </Pie>
              <Tooltip
                formatter={v => [`${v}%`, '']}
                contentStyle={{ background: '#131320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {salesBySegment.map((s, i) => (
              <div key={s.segment} className="flex items-center gap-1.5 text-[10px]">
                <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{s.segment}</span>
                <span className="ml-auto font-bold text-white/70">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funil */}
        <div className="col-span-2 rounded-2xl p-5" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Funil de Vendas</p>
          <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Conversão por etapa — mês atual</p>
          <div className="space-y-2.5">
            {funnelData.map((stage, i) => {
              const pct = Math.round((stage.value / funnelData[0].value) * 100)
              const convRate = i > 0 ? Math.round((stage.value / funnelData[i - 1].value) * 100) : 100
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-lg text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                        {i + 1}
                      </span>
                      <span className="text-[12px] font-medium text-white/75">{stage.stage}</span>
                      {i > 0 && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{
                            background: convRate >= 50 ? 'rgba(16,185,129,0.15)' : convRate >= 30 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                            color: convRate >= 50 ? '#10b981' : convRate >= 30 ? '#f59e0b' : '#f43f5e',
                          }}
                        >
                          {convRate}%
                        </span>
                      )}
                    </div>
                    <span className="text-[12px] font-bold text-white/80">{stage.value}</span>
                  </div>
                  <div className="h-5 rounded-lg overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div
                      className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS[i]}99, ${COLORS[i]})` }}
                    >
                      <span className="text-[9px] font-bold text-white">{pct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl px-4 py-2.5" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Taxa de conversão total</span>
            <span className="text-[14px] font-black text-indigo-400">
              {formatPercent((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100)}
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}
