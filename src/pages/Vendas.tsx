import {
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Users, TrendingUp, DollarSign, Clock, Target,
  ShoppingCart, AlertTriangle, Megaphone, ArrowUpRight, ArrowDownRight, Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { salesBySegment, funnelData, churnTrend, monthlyRevenue } from '@/data/mockData'
import { useVendasMetrics } from '@/hooks/useVendasMetrics'
import { formatCurrency, formatPercent, formatNumber, cn } from '@/lib/utils'

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#6b7280']

function KpiCard({ label, value, delta, icon: Icon, iconColor, iconBg, deltaLabel }: {
  label: string; value: string | number; delta: number
  icon: React.ElementType; iconColor: string; iconBg: string; deltaLabel?: string
}) {
  const isPos = delta >= 0
  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground leading-tight">{label}</p>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shrink-0', iconBg)}>
            <Icon className={cn('h-4 w-4', iconColor)} />
          </div>
        </div>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <div className="flex items-center gap-1.5">
          {isPos ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> : <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />}
          <span className={cn('text-xs font-medium', isPos ? 'text-emerald-400' : 'text-rose-400')}>{Math.abs(delta)}%</span>
          <span className="text-xs text-muted-foreground">{deltaLabel ?? 'vs mês anterior'}</span>
        </div>
      </CardContent>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-sm min-w-[160px]">
      <p className="mb-2 font-semibold">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />{p.name}
          </span>
          <span className="font-medium">
            {p.name === 'Churn' ? formatPercent(p.value) : p.name === 'Novos Clientes' ? p.value : formatCurrency(p.value)}
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
      <div className="flex items-center justify-center h-full min-h-[60vh] gap-2 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" /> Carregando métricas...
      </div>
    )
  }

  const ratio = m.ltv / m.cac

  const kpis = [
    { label: 'Total de Clientes', value: formatNumber(m.totalClients), delta: 4.2, icon: Users, iconColor: 'text-indigo-400', iconBg: 'bg-indigo-500/10' },
    { label: 'Clientes Ativos', value: formatNumber(m.activeClients), delta: 3.1, icon: Target, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10' },
    { label: 'Tempo Médio de Contrato', value: `${m.avgContractDuration} meses`, delta: 2.8, icon: Clock, iconColor: 'text-blue-400', iconBg: 'bg-blue-500/10' },
    { label: 'MRR', value: formatCurrency(m.mrr), delta: m.revenueGrowthMoM, icon: DollarSign, iconColor: 'text-purple-400', iconBg: 'bg-purple-500/10' },
    { label: 'ARR', value: formatCurrency(m.arr), delta: 4.1, icon: TrendingUp, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
    { label: 'LTV Médio', value: formatCurrency(m.ltv), delta: 6.2, icon: ShoppingCart, iconColor: 'text-sky-400', iconBg: 'bg-sky-500/10' },
    { label: 'CAC', value: formatCurrency(m.cac), delta: -12.5, icon: Megaphone, iconColor: 'text-rose-400', iconBg: 'bg-rose-500/10' },
    { label: 'Churn Rate', value: formatPercent(m.churnRate), delta: -0.3, icon: AlertTriangle, iconColor: 'text-orange-400', iconBg: 'bg-orange-500/10' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Métricas de Vendas</h1>
          <p className="mt-1 text-sm text-muted-foreground">KPIs calculados em tempo real a partir dos dados de clientes</p>
        </div>
        <Badge variant="info" className="text-xs">Ao vivo</Badge>
      </div>

      {/* KPI Grid */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
      </div>

      {/* Highlight Row */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="border-border/50 bg-gradient-to-br from-indigo-500/10 to-purple-500/5">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Ratio LTV:CAC</p>
            <p className="text-4xl font-black">{ratio.toFixed(1)}x</p>
            <p className="mt-1 text-xs">
              {ratio >= 3 ? <span className="text-emerald-400">Excelente — meta: &gt; 3x ✓</span> : <span className="text-amber-400">Abaixo do ideal — meta: &gt; 3x</span>}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Gastos em Marketing</p>
            <p className="text-3xl font-bold">{formatCurrency(m.marketingSpend)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ads: <span className="text-foreground font-medium">{formatCurrency(m.adSpend)}</span>
              {' · '}Orgânico: <span className="text-foreground font-medium">{formatCurrency(m.marketingSpend - m.adSpend)}</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">Novos Clientes (mês)</p>
            <p className="text-3xl font-bold">{m.newClientsThisMonth}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">{m.revenueGrowthMoM}%</span>
              <span className="text-muted-foreground">crescimento MoM</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="mb-4 grid grid-cols-3 gap-4">
        <Card className="col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Evolução do MRR</CardTitle>
            <CardDescription>Receita recorrente mensal — últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 27.9% 16.9%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="faturamento" name="MRR" stroke="#6366f1" strokeWidth={2.5} fill="url(#mrrGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Clientes por Segmento</CardTitle>
            <CardDescription>Distribuição da carteira ativa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={salesBySegment} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {salesBySegment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{ background: 'hsl(224 71.4% 6%)', border: '1px solid hsl(215 27.9% 16.9%)', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {salesBySegment.map((s, i) => (
                <div key={s.segment} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground truncate">{s.segment}</span>
                  <span className="ml-auto font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Churn vs Novos Clientes</CardTitle>
            <CardDescription>Evolução mensal de retenção e aquisição</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={churnTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 27.9% 16.9%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(217.9 10.6% 64.9%)' }} />
                <Line yAxisId="right" type="monotone" dataKey="churn" name="Churn" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} />
                <Line yAxisId="left" type="monotone" dataKey="newClients" name="Novos Clientes" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Conversão por etapa — mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {funnelData.map((stage, i) => {
                const pct = Math.round((stage.value / funnelData[0].value) * 100)
                const convRate = i > 0 ? Math.round((stage.value / funnelData[i - 1].value) * 100) : 100
                return (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold bg-muted text-muted-foreground">{i + 1}</div>
                        <span className="text-sm font-medium">{stage.stage}</span>
                        {i > 0 && (
                          <Badge variant={convRate >= 50 ? 'success' : convRate >= 30 ? 'warning' : 'destructive'} className="text-[10px] px-1.5 h-4">
                            {convRate}% conv.
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm font-bold">{stage.value}</span>
                    </div>
                    <div className="relative h-7 rounded-md overflow-hidden bg-muted/30">
                      <div
                        className="h-full rounded-md transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS[i]} 0%, ${COLORS[i]}cc 100%)` }}
                      >
                        <span className="text-[10px] font-bold text-white">{pct}%</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4 rounded-lg bg-muted/20 p-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Taxa de conversão total</span>
              <span className="text-sm font-bold text-primary">
                {formatPercent((funnelData[funnelData.length - 1].value / funnelData[0].value) * 100)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
