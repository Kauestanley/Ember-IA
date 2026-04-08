import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Target, TrendingUp, DollarSign, TrendingDown,
  ChevronRight, Plus, Pencil, Trash2, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { OKRDialog } from '@/components/okrs/OKRDialog'
import { useOKRs } from '@/hooks/useOKRs'
import { monthlyRevenue } from '@/data/mockData'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { type OKRRow } from '@/lib/supabase'

function progressColor(p: number)                             { return p >= 80 ? '#10b981' : p >= 50 ? '#f59e0b' : '#f43f5e' }


const cardStyle = { background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 shadow-2xl text-xs" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.08)' }}>
      <p className="mb-1.5 font-semibold text-[11px]" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-3 mt-1">
          <span className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editing,      setEditing]      = useState<OKRRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OKRRow | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  function openNew()               { setEditing(null); setDialogOpen(true) }
  function openEdit(o: OKRRow)     { setEditing(o);    setDialogOpen(true) }
  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteOKR(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const last       = monthlyRevenue[monthlyRevenue.length - 1]
  const margin     = (last.lucro / last.faturamento) * 100
  const ytdRev     = monthlyRevenue.reduce((s, m) => s + m.faturamento, 0)
  const ytdExp     = monthlyRevenue.reduce((s, m) => s + m.despesas, 0)
  const ytdProfit  = monthlyRevenue.reduce((s, m) => s + m.lucro, 0)

  const financialCards = [
    { label: 'Faturamento',  sublabel: 'Dez 2024', value: formatCurrency(last.faturamento), icon: DollarSign,  color: '#10b981', bg: 'rgba(16,185,129,0.12)',  delta: '+3.9%', pos: true  },
    { label: 'Despesas',     sublabel: 'Dez 2024', value: formatCurrency(last.despesas),    icon: TrendingDown, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   delta: '+3.4%', pos: false },
    { label: 'Lucro',        sublabel: 'Dez 2024', value: formatCurrency(last.lucro),       icon: TrendingUp,  color: '#818cf8', bg: 'rgba(129,140,248,0.12)', delta: '+4.4%', pos: true  },
    { label: 'Margem Líq.',  sublabel: 'Estimada', value: formatPercent(margin),            icon: Target,      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  delta: 'estável', pos: true },
  ]

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Objetivos & Financeiro · 2024
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">OKRs & Financeiro</h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 18px rgba(99,102,241,0.4)' }}
        >
          <Plus className="h-3.5 w-3.5" /> Novo OKR
        </button>
      </div>

      {/* Financial cards */}
      <div className="grid grid-cols-4 gap-4">
        {financialCards.map(c => (
          <div key={c.label} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{c.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{c.sublabel}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: c.bg }}>
                <c.icon className="h-4 w-4" style={{ color: c.color }} />
              </div>
            </div>
            <p className="text-[26px] font-black leading-none tracking-tight text-white mb-2">{c.value}</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ color: c.pos ? '#10b981' : '#f43f5e', fontWeight: 700 }}>{c.delta}</span>
              {' '}vs mês anterior
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="col-span-2 rounded-2xl p-5" style={cardStyle}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Evolução Mensal</p>
          <p className="text-[11px] mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Faturamento, despesas e lucro ao longo do ano</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <defs>
                {[['gF','#6366f1'],['gL','#10b981'],['gD','#f43f5e']].map(([id, c]) => (
                  <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={c} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }} />
              <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#6366f1" strokeWidth={2} fill="url(#gF)" dot={false} />
              <Area type="monotone" dataKey="despesas"    name="Despesas"    stroke="#f43f5e" strokeWidth={2} fill="url(#gD)" dot={false} />
              <Area type="monotone" dataKey="lucro"       name="Lucro"       stroke="#10b981" strokeWidth={2} fill="url(#gL)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Annual summary */}
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-[13px] font-bold text-white/80 mb-1">Resumo Anual</p>
          <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.3)' }}>Acumulado 2024</p>

          <div className="space-y-5">
            {[
              { label: 'Faturamento YTD', value: formatCurrency(ytdRev),    color: '#6366f1', pct: 100 },
              { label: 'Despesas YTD',    value: formatCurrency(ytdExp),    color: '#f43f5e', pct: Math.round((ytdExp    / ytdRev) * 100) },
              { label: 'Lucro YTD',       value: formatCurrency(ytdProfit), color: '#10b981', pct: Math.round((ytdProfit / ytdRev) * 100) },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.value}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.pct}%`, background: item.color }} />
                </div>
                <p className="mt-1 text-right text-[9px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{item.pct}%</p>
              </div>
            ))}
          </div>

          {/* Margin highlight */}
          <div className="mt-5 rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-[10px] uppercase tracking-[0.1em] font-bold mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Margem média 2024</p>
            <p className="text-[28px] font-black text-emerald-400 leading-none">{formatPercent((ytdProfit / ytdRev) * 100)}</p>
            <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>↑ 2.1pp vs 2023</p>
          </div>
        </div>
      </div>

      {/* OKR cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-black text-white/80">Objetivos e Key Results</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />}
        </div>

        {!loading && okrs.length === 0 && (
          <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={cardStyle}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Target className="h-6 w-6" style={{ color: 'rgba(255,255,255,0.3)' }} />
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Nenhum OKR cadastrado</p>
            <p className="text-[11px] mb-5" style={{ color: 'rgba(255,255,255,0.25)' }}>Crie seu primeiro objetivo para rastrear o progresso</p>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
            >
              <Plus className="h-3.5 w-3.5" /> Criar primeiro OKR
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {okrs.map(okr => {
            const pc = progressColor(okr.progress)
            return (
              <div key={okr.id} className="rounded-2xl p-5 transition-all duration-200 hover:border-indigo-500/20" style={cardStyle}>
                {/* OKR header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-[14px] font-bold leading-snug text-white/85">{okr.objective}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                        style={{ background: 'rgba(99,102,241,0.3)' }}
                      >
                        {okr.owner.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{okr.owner}</span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        {okr.quarter}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-black"
                      style={{
                        background: okr.progress >= 80 ? 'rgba(16,185,129,0.15)' : okr.progress >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(244,63,94,0.15)',
                        color: pc,
                      }}
                    >
                      {okr.progress}%
                    </span>
                    <button
                      onClick={() => openEdit(okr)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(okr)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/15"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Overall progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    <span>Progresso geral</span><span className="font-bold" style={{ color: pc }}>{okr.progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${okr.progress}%`, background: pc }} />
                  </div>
                </div>

                {/* Key results */}
                {okr.key_results.length === 0 ? (
                  <p className="text-[11px] italic" style={{ color: 'rgba(255,255,255,0.25)' }}>Nenhum Key Result cadastrado</p>
                ) : (
                  <div className="space-y-3">
                    {okr.key_results.map(kr => {
                      const isReverse = kr.description.toLowerCase().includes('reduzir')
                      const rawPct    = Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
                      const pct       = isReverse ? Math.min(100, Math.round((kr.target_value / kr.current_value) * 100)) : rawPct
                      const kc        = progressColor(pct)
                      return (
                        <div key={kr.id}>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                              <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{kr.description}</span>
                            </div>
                            <span className="text-[10px] font-bold shrink-0 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              {kr.current_value}{kr.unit} / {kr.target_value}{kr.unit}
                            </span>
                          </div>
                          <div className="ml-5 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
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

      {/* Dialogs */}
      <OKRDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={data => editing ? updateOKR(editing.id, data) : createOKR(data)}
      />

      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.08)' }}>
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
