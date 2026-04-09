import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, TrendingUp, DollarSign, Users, ChevronRight, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { OKRDialog } from '@/components/okrs/OKRDialog'
import { useOKRs } from '@/hooks/useOKRs'
import { useVendasMetrics } from '@/hooks/useVendasMetrics'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { type OKRRow } from '@/lib/supabase'

const RED   = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

function progressColor(p: number) { return p >= 80 ? GREEN : p >= 50 ? '#f59e0b' : RED }

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs" style={{ background: CARD, border: CARD_B }}>
      <p className="mb-1.5 font-semibold text-[11px] text-white/70">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5 text-white/40">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{p.name}
          </span>
          <span className="font-bold text-white/90">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function OKRs() {
  const { okrs, loading, createOKR, updateOKR, deleteOKR } = useOKRs()
  const { metrics: m } = useVendasMetrics()
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editing,      setEditing]      = useState<OKRRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OKRRow | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  function openNew()           { setEditing(null); setDialogOpen(true) }
  function openEdit(o: OKRRow) { setEditing(o);    setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteOKR(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  // Financial cards from real Supabase data
  const financialCards = m ? [
    { label: 'MRR Atual',        sublabel: 'Mensal recorrente', value: formatCurrency(m.mrr),            icon: DollarSign, color: GREEN, delta: `+${m.revenueGrowthMoM}%`, pos: true  },
    { label: 'ARR Projetado',    sublabel: 'Anual projetado',   value: formatCurrency(m.arr),            icon: TrendingUp, color: RED,   delta: '+4.1%',                    pos: true  },
    { label: 'Clientes Ativos',  sublabel: 'Contratos ativos',  value: String(m.activeClients),          icon: Users,      color: '#fff',delta: `+${m.newClientsThisMonth} mês`, pos: true },
    { label: 'Churn Rate',       sublabel: 'Taxa de cancelamento', value: formatPercent(m.churnRate),    icon: Target,     color: m.churnRate > 5 ? RED : GREEN, delta: 'estável', pos: m.churnRate <= 5 },
  ] : []

  // Monthly MRR trend for chart
  const chartData = m?.monthlyMRR.map(d => ({ month: d.month, mrr: d.mrr })) ?? []

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Objetivos & Métricas Reais · Supabase
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">OKRs & Financeiro</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: RED, boxShadow: `0 4px 18px ${RED}40`, minHeight: '44px' }}>
          <Plus className="h-3.5 w-3.5" /> Novo OKR
        </button>
      </div>

      {/* Financial cards — real data */}
      {!m ? (
        <div className="flex items-center justify-center h-32 gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: RED }} />
          <span className="text-sm">Carregando métricas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {financialCards.map(c => (
            <div key={c.label} className="rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>{c.label}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.sublabel}</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: c.color === '#fff' ? 'rgba(255,255,255,0.08)' : `${c.color}18` }}>
                  <c.icon className="h-4 w-4" style={{ color: c.color }} />
                </div>
              </div>
              <p className="text-[20px] md:text-[26px] font-black leading-none tracking-tight text-white mb-2">{c.value}</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                <span style={{ color: c.pos ? GREEN : RED, fontWeight: 700 }}>{c.delta}</span>
                {' '}vs mês anterior
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {m && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* MRR Trend */}
          <div className="lg:col-span-2 rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
            <p className="text-[13px] font-bold text-white/80 mb-1">Evolução do MRR</p>
            <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Receita mensal recorrente — baseado nos clientes cadastrados
            </p>
            {chartData.every(d => d.mrr === 0) ? (
              <div className="flex items-center justify-center h-60 text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Cadastre clientes para visualizar a evolução do MRR
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={RED} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={RED} stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false}
                    tickFormatter={v => v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke={RED} strokeWidth={2} fill="url(#mrrGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
            <p className="text-[13px] font-bold text-white/80 mb-1">Resumo da Carteira</p>
            <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Dados em tempo real</p>
            <div className="space-y-5">
              {[
                { label: 'Clientes Ativos',   value: String(m.activeClients),          color: RED,   pct: m.totalClients > 0 ? Math.round((m.activeClients / m.totalClients) * 100) : 0 },
                { label: 'Em Trial',           value: String(m.trialClients),           color: '#fff', pct: m.totalClients > 0 ? Math.round((m.trialClients / m.totalClients) * 100) : 0 },
                { label: 'Churned',            value: String(m.churnedClients),         color: GREEN,  pct: m.totalClients > 0 ? Math.round((m.churnedClients / m.totalClients) * 100) : 0 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-[11px] text-white/35">{item.label}</span>
                    <span className="text-[11px] font-bold text-white/75">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.pct}%`, background: item.color }} />
                  </div>
                  <p className="mt-1 text-right text-[9px] text-white/25">{item.pct}%</p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-xl p-4" style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}25` }}>
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold mb-1 text-white/30">LTV:CAC Ratio</p>
              <p className="text-[28px] font-black leading-none" style={{ color: GREEN }}>
                {(m.ltv / m.cac).toFixed(1)}x
              </p>
              <p className="text-[10px] mt-1 text-white/30">Meta: acima de 3x</p>
            </div>
          </div>
        </div>
      )}

      {/* OKR cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-black text-white/80">Objetivos e Key Results</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin" style={{ color: RED }} />}
        </div>

        {!loading && okrs.length === 0 && (
          <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
            style={{ background: CARD, border: CARD_B }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4 bg-white/[0.05]">
              <Target className="h-6 w-6 text-white/30" />
            </div>
            <p className="text-[13px] font-semibold mb-1 text-white/50">Nenhum OKR cadastrado</p>
            <p className="text-[11px] mb-5 text-white/25">Crie seu primeiro objetivo para rastrear o progresso</p>
            <button onClick={openNew}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-bold text-white"
              style={{ background: RED, minHeight: '44px' }}>
              <Plus className="h-3.5 w-3.5" /> Criar primeiro OKR
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {okrs.map(okr => {
            const pc = progressColor(okr.progress)
            return (
              <div key={okr.id} className="rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-[14px] font-bold leading-snug text-white/85">{okr.objective}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold"
                        style={{ background: `${RED}25`, color: RED }}>
                        {okr.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[11px] text-white/40">{okr.owner}</span>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {okr.quarter}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-black"
                      style={{ background: `${pc}20`, color: pc }}>
                      {okr.progress}%
                    </span>
                    <button onClick={() => openEdit(okr)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => setDeleteTarget(okr)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${RED}20`; e.currentTarget.style.color = RED }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-white/30">Progresso geral</span>
                    <span className="font-bold" style={{ color: pc }}>{okr.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.07]">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${okr.progress}%`, background: pc }} />
                  </div>
                </div>

                {okr.key_results.length === 0 ? (
                  <p className="text-[11px] italic text-white/25">Nenhum Key Result cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {okr.key_results.map(kr => {
                      const isRev = kr.description.toLowerCase().includes('reduzir')
                      const raw   = Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
                      const pct   = isRev ? Math.min(100, Math.round((kr.target_value / kr.current_value) * 100)) : raw
                      const kc    = progressColor(pct)
                      return (
                        <div key={kr.id}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="h-3 w-3 shrink-0 text-white/20" />
                              <span className="text-[11px] truncate text-white/45">{kr.description}</span>
                            </div>
                            <span className="text-[10px] font-bold shrink-0 whitespace-nowrap text-white/50">
                              {kr.current_value}{kr.unit} / {kr.target_value}{kr.unit}
                            </span>
                          </div>
                          <div className="ml-5 h-1 rounded-full overflow-hidden bg-white/[0.06]">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: kc }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <OKRDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing}
        onSave={data => editing ? updateOKR(editing.id, data) : createOKR(data)} />

      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: CARD, border: CARD_B }}>
          <DialogHeader><DialogTitle>Excluir OKR?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Excluir <span className="font-semibold text-foreground">"{deleteTarget?.objective}"</span>?
            Todos os Key Results serão removidos.
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
