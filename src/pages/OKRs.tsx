import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Target, TrendingUp, DollarSign, TrendingDown, ChevronRight, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { OKRDialog } from '@/components/okrs/OKRDialog'
import { useOKRs } from '@/hooks/useOKRs'
import { monthlyRevenue } from '@/data/mockData'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import { type OKRRow } from '@/lib/supabase'

function progressColor(p: number) {
  if (p >= 80) return 'bg-emerald-500'
  if (p >= 50) return 'bg-amber-500'
  return 'bg-rose-500'
}
function progressVariant(p: number): 'success' | 'warning' | 'destructive' {
  if (p >= 80) return 'success'
  if (p >= 50) return 'warning'
  return 'destructive'
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-xl text-sm">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
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
  const { okrs, loading, createOKR, updateOKR, deleteOKR } = useOKRs()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OKRRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OKRRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openNew() { setEditing(null); setDialogOpen(true) }
  function openEdit(okr: OKRRow) { setEditing(okr); setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteOKR(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const totalRevenue = monthlyRevenue[monthlyRevenue.length - 1].faturamento
  const totalExpenses = monthlyRevenue[monthlyRevenue.length - 1].despesas
  const totalProfit = monthlyRevenue[monthlyRevenue.length - 1].lucro
  const profitMargin = (totalProfit / totalRevenue) * 100
  const ytdRevenue = monthlyRevenue.reduce((s, m) => s + m.faturamento, 0)
  const ytdExpenses = monthlyRevenue.reduce((s, m) => s + m.despesas, 0)
  const ytdProfit = monthlyRevenue.reduce((s, m) => s + m.lucro, 0)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">OKRs & Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Objetivos, metas e evolução financeira</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Novo OKR
        </Button>
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
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className={card.delta.startsWith('+') ? 'text-emerald-400' : 'text-muted-foreground'}>{card.delta}</span> vs mês anterior
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
                  {[['gradFat', '#6366f1'], ['gradLuc', '#10b981'], ['gradDesp', '#f43f5e']].map(([id, color]) => (
                    <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
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
                  <span className="text-xs font-semibold">{item.value}</span>
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
          <h2 className="text-lg font-semibold">Objetivos e Key Results</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {!loading && okrs.length === 0 && (
          <Card className="border-dashed border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum OKR cadastrado</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">Crie seu primeiro objetivo para começar a rastrear o progresso</p>
              <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Criar primeiro OKR</Button>
            </CardContent>
          </Card>
        )}

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
                      <Badge variant="outline" className="text-[10px] px-1.5 h-4 ml-1">{okr.quarter}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={progressVariant(okr.progress)}>{okr.progress}%</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(okr)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteTarget(okr)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso geral</span><span>{okr.progress}%</span>
                  </div>
                  <Progress value={okr.progress} indicatorClassName={progressColor(okr.progress)} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {okr.key_results.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum Key Result cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {okr.key_results.map(kr => {
                      const isReverse = kr.description.toLowerCase().includes('reduzir')
                      const rawPct = Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
                      const pct = isReverse ? Math.min(100, Math.round((kr.target_value / kr.current_value) * 100)) : rawPct
                      return (
                        <div key={kr.id}>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground truncate">{kr.description}</span>
                            </div>
                            <span className="text-xs font-semibold shrink-0 whitespace-nowrap">
                              {kr.current_value}{kr.unit} / {kr.target_value}{kr.unit}
                            </span>
                          </div>
                          <div className="ml-5">
                            <Progress value={pct} indicatorClassName={progressColor(pct)} className="h-1" />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <OKRDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={data => editing ? updateOKR(editing.id, data) : createOKR(data)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir OKR?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Excluir <span className="font-semibold text-foreground">"{deleteTarget?.objective}"</span>? Todos os Key Results serão removidos junto.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Excluindo...</> : 'Sim, excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
