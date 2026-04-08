import { useState, useMemo } from 'react'
import {
  Search, Filter, Download, UserPlus, Building2,
  Mail, Phone, ChevronUp, ChevronDown, Pencil, Trash2, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ClienteDialog } from '@/components/clients/ClienteDialog'
import { useClientes } from '@/hooks/useClientes'
import { type ClientRow } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

type SortField    = 'name' | 'company' | 'revenue' | 'team_size'
type SortDir      = 'asc' | 'desc'
type Status       = ClientRow['status']
type ContractType = ClientRow['contract_type']

const RED   = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

const statusStyle: Record<Status, { bg: string; color: string }> = {
  Ativo:   { bg: `${GREEN}18`, color: GREEN },
  Trial:   { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' },
  Inativo: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  Churned: { bg: `${RED}18`,   color: RED   },
}

const contractColor: Record<ContractType, string> = {
  Mensal:     'rgba(255,255,255,0.5)',
  Trimestral: 'rgba(255,255,255,0.65)',
  Semestral:  '#f59e0b',
  Anual:      GREEN,
}

export function Clientes() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClientes()

  const [search,         setSearch]         = useState('')
  const [statusFilter,   setStatusFilter]   = useState('all')
  const [contractFilter, setContractFilter] = useState('all')
  const [sortField,      setSortField]      = useState<SortField>('revenue')
  const [sortDir,        setSortDir]        = useState<SortDir>('desc')
  const [dialogOpen,     setDialogOpen]     = useState(false)
  const [editing,        setEditing]        = useState<ClientRow | null>(null)
  const [deleteTarget,   setDeleteTarget]   = useState<ClientRow | null>(null)
  const [deleting,       setDeleting]       = useState(false)

  const filtered = useMemo(() => {
    let data = [...clients]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q)
      )
    }
    if (statusFilter   !== 'all') data = data.filter(c => c.status        === statusFilter)
    if (contractFilter !== 'all') data = data.filter(c => c.contract_type === contractFilter)
    data.sort((a, b) => {
      const va = a[sortField], vb = b[sortField]
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [clients, search, statusFilter, contractFilter, sortField, sortDir])

  const active       = clients.filter(c => c.status === 'Ativo')
  const totalRevenue = active.reduce((s, c) => s + c.revenue, 0)
  const ticket       = active.length ? Math.round(totalRevenue / active.length) : 0

  function handleSort(f: SortField) {
    if (sortField === f) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(f); setSortDir('desc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 opacity-20" />
    return sortDir === 'asc'
      ? <ChevronUp   className="h-3 w-3" style={{ color: RED }} />
      : <ChevronDown className="h-3 w-3" style={{ color: RED }} />
  }

  function openNew()              { setEditing(null); setDialogOpen(true) }
  function openEdit(c: ClientRow) { setEditing(c);    setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteClient(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const summaryCards = [
    { label: 'Total',              value: clients.length,              color: '#ffffff' },
    { label: 'Clientes Ativos',    value: active.length,               color: GREEN     },
    { label: 'Faturamento Mensal', value: formatCurrency(totalRevenue), color: RED       },
    { label: 'Ticket Médio',       value: ticket ? formatCurrency(ticket) : '—', color: '#9ca3af' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Gestão de Clientes · Contratos e Receita
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Clientes</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: RED, boxShadow: `0 4px 18px ${RED}40`, minHeight: '44px' }}>
          <UserPlus className="h-3.5 w-3.5" /> Novo Cliente
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <div key={c.label} className="rounded-2xl p-4 md:p-5" style={{ background: CARD, border: CARD_B }}>
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]"
                style={{ color: 'rgba(255,255,255,0.3)' }}>{c.label}</p>
              <div className="h-2 w-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
            </div>
            <p className="text-[24px] md:text-[32px] font-black leading-none tracking-tight" style={{ color: c.color }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: CARD_B }}>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 md:p-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              placeholder="Buscar por nome, empresa, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-[12px] outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.8)',
                minHeight: '44px',
              }}
              onFocus={e  => (e.currentTarget.style.borderColor = `${RED}50`)}
              onBlur={e   => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 rounded-xl text-[12px] border-white/[0.07] bg-white/[0.05] text-white/70" style={{ minHeight: '44px' }}>
                <Filter className="h-3 w-3 mr-1.5 opacity-40" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {(['Ativo','Trial','Inativo','Churned'] as const).map(s =>
                  <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={contractFilter} onValueChange={setContractFilter}>
              <SelectTrigger className="w-full sm:w-44 rounded-xl text-[12px] border-white/[0.07] bg-white/[0.05] text-white/70" style={{ minHeight: '44px' }}>
                <SelectValue placeholder="Contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os contratos</SelectItem>
                {(['Mensal','Trimestral','Semestral','Anual'] as const).map(c =>
                  <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <button className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-colors hover:bg-white/[0.07] sm:ml-auto"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', minHeight: '44px' }}>
              <Download className="h-3.5 w-3.5" /> Exportar
            </button>
          </div>
        </div>

        {/* Table — horizontal scroll on mobile */}
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: RED }} />
            <span className="text-[13px]">Carregando clientes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: '700px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {[
                    { label: 'Cliente',     field: 'name'      as SortField },
                    { label: 'Contato',     field: null },
                    { label: 'Contrato',    field: null },
                    { label: 'Faturamento', field: 'revenue'   as SortField },
                    { label: 'Equipe',      field: 'team_size' as SortField },
                    { label: 'Segmento',    field: null },
                    { label: 'Status',      field: null },
                    { label: '',            field: null },
                  ].map(({ label, field }) => (
                    <th key={label} className="px-4 py-3 text-left first:px-6">
                      {field ? (
                        <button onClick={() => handleSort(field)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] transition-colors hover:text-white/60"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {label} <SortIcon field={field} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em]"
                          style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[13px]"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>Nenhum cliente encontrado</td>
                  </tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="group transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold"
                          style={{ background: 'rgba(239,68,68,0.15)', color: RED, border: `1px solid ${RED}30` }}>
                          {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{c.name}</p>
                          <div className="flex items-center gap-1 mt-0.5 text-[10px]"
                            style={{ color: 'rgba(255,255,255,0.3)' }}>
                            <Building2 className="h-2.5 w-2.5" />{c.company}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <Mail className="h-2.5 w-2.5" />{c.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          <Phone className="h-2.5 w-2.5" />{c.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[12px] font-bold" style={{ color: contractColor[c.contract_type] }}>
                        {c.contract_type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-bold text-white/85">{formatCurrency(c.revenue)}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {c.contract_type === 'Anual' ? '/ano' : c.contract_type === 'Semestral' ? '/sem.' : c.contract_type === 'Trimestral' ? '/trim.' : '/mês'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[13px] font-bold text-white/75">{c.team_size}</span>
                      <span className="text-[10px] ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>pess.</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-lg px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: statusStyle[c.status].bg, color: statusStyle[c.status].color }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.08]"
                          style={{ color: 'rgba(255,255,255,0.4)' }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteTarget(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                          style={{ color: 'rgba(255,255,255,0.4)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = `${RED}20`; e.currentTarget.style.color = RED }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between px-4 md:px-6 py-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Mostrando <span className="font-bold text-white/60">{filtered.length}</span> de <span className="font-bold text-white/60">{clients.length}</span> clientes
          </p>
        </div>
      </div>

      <ClienteDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing}
        onSave={data => editing ? updateClient(editing.id, data) : createClient(data)} />

      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: CARD, border: CARD_B }}>
          <DialogHeader><DialogTitle>Excluir cliente?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span className="font-semibold text-foreground">{deleteTarget?.name}</span> ({deleteTarget?.company})?
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
