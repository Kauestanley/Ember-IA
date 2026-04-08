import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Target, TrendingUp, DollarSign, TrendingDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { okrs, monthlyRevenue } from '@/data/mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { cn } from '@/lib/utils'

function progressColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}

function progressVariant(pct: number): 'success' | 'warning' | 'destructive' {
  if (pct >= 80) return 'success'
  if (pct >= 50) return 'warning'
  return 'destructive'
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-sm">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="font-medium text-foreground">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function OKRs() {
  const totalRevenue = monthlyRevenue[monthlyRevenue.length - 1].faturamento
  const totalExpenses = monthlyRevenue[monthlyRevenue.length - 1].despesas
  const totalProfit = monthlyRevenue[monthlyRevenue.length - 1].lucro
  const profitMargin = (totalProfit / totalRevenue) * 100

  const ytdRevenue = monthlyRevenue.reduce((s, m) => s + m.faturamento, 0)
  const ytdExpenses = monthlyRevenue.reduce((s, m) => s + m.despesas, 0)
  const ytdProfit = monthlyRevenue.reduce((s, m) => s + m.lucro, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">OKRs & Financeiro</h1>
        <p className="mt-1 text-sm text-muted-foreground">Objetivos, metas e evolução financeira — Q4 2024</p>
      </div>

      {/* Financial Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Faturamento (Dez)', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', delta: '+3.9%' },
          { label: 'Despesas (Dez)', value: formatCurrency(totalExpenses), icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10', delta: '+3.4%' },
          { label: 'Lucro (Dez)', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10', delta: '+4.4%' },
          { label: 'Margem Líquida', value: formatPercent(profitMargin), icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10', delta: 'estável' },
        ].map(card => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.bg)}>
                  <card.icon className={cn('h-4 w-4', card.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className={card.delta.startsWith('+') ? 'text-emerald-400' : 'text-muted-foreground'}>
                  {card.delta}
                </span>{' '}
                vs mês anterior
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="col-span-2 border-border/50">
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Faturamento, despesas e lucro ao longo do ano</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLuc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215 27.9% 16.9%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(217.9 10.6% 64.9%)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(217.9 10.6% 64.9%)' }} />
                <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#6366f1" strokeWidth={2} fill="url(#gradFat)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={2} fill="url(#gradDesp)" />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2} fill="url(#gradLuc)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Resumo Anual</CardTitle>
            <CardDescription>Acumulado do ano 2024</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Faturamento YTD', value: formatCurrency(ytdRevenue), color: 'bg-indigo-500', pct: 100 },
              { label: 'Despesas YTD', value: formatCurrency(ytdExpenses), color: 'bg-rose-500', pct: Math.round((ytdExpenses / ytdRevenue) * 100) },
              { label: 'Lucro YTD', value: formatCurrency(ytdProfit), color: 'bg-emerald-500', pct: Math.round((ytdProfit / ytdRevenue) * 100) },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-semibold text-foreground">{item.value}</span>
                </div>
                <Progress value={item.pct} indicatorClassName={item.color} className="h-1.5" />
                <p className="mt-0.5 text-right text-[10px] text-muted-foreground">{item.pct}%</p>
              </div>
            ))}

            <div className="mt-4 rounded-lg bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-1">Margem média 2024</p>
              <p className="text-xl font-bold text-emerald-400">{formatPercent((ytdProfit / ytdRevenue) * 100)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">↑ 2.1pp vs 2023</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* OKR Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Objetivos e Key Results</h2>
          <Badge variant="info">Q4 2024</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {okrs.map(okr => (
            <Card key={okr.id} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base leading-snug">{okr.objective}</CardTitle>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                        {okr.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-xs text-muted-foreground">{okr.owner}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={progressVariant(okr.progress)}>{okr.progress}%</Badge>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso geral</span>
                    <span>{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} indicatorClassName={progressColor(okr.progress)} className="h-2" />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {okr.keyResults.map(kr => {
                    const pct = Math.min(100, Math.round((kr.current / kr.target) * 100))
                    const isReverse = kr.unit === '%' && kr.description.toLowerCase().includes('reduzir')
                    const actualPct = isReverse ? Math.min(100, Math.round((kr.target / kr.current) * 100)) : pct
                    return (
                      <div key={kr.id} className="group">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="text-xs text-muted-foreground truncate">{kr.description}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0 whitespace-nowrap">
                            {kr.current}{kr.unit} / {kr.target}{kr.unit}
                          </span>
                        </div>
                        <div className="ml-5">
                          <Progress value={actualPct} indicatorClassName={progressColor(actualPct)} className="h-1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
