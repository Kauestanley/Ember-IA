import { useState, useMemo } from 'react'
import { Search, Filter, Download, UserPlus, Building2, Mail, Phone, ChevronUp, ChevronDown, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ClienteDialog } from '@/components/clients/ClienteDialog'
import { useClientes } from '@/hooks/useClientes'
import { type ClientRow } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

type SortField = 'name' | 'company' | 'revenue' | 'team_size'
type SortDir = 'asc' | 'desc'
type Status = ClientRow['status']
type ContractType = ClientRow['contract_type']

const statusVariant: Record<Status, 'success' | 'info' | 'warning' | 'destructive'> = {
  Ativo: 'success', Trial: 'info', Inativo: 'warning', Churned: 'destructive',
}
const contractColors: Record<ContractType, string> = {
  Mensal: 'text-blue-400', Trimestral: 'text-purple-400', Semestral: 'text-amber-400', Anual: 'text-emerald-400',
}

export function Clientes() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClientes()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [contractFilter, setContractFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ClientRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null)
  const [deleting, setDeleting] = useState(false)

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
    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter)
    if (contractFilter !== 'all') data = data.filter(c => c.contract_type === contractFilter)
    data.sort((a, b) => {
      const va = a[sortField], vb = b[sortField]
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [clients, search, statusFilter, contractFilter, sortField, sortDir])

  const activeClients = clients.filter(c => c.status === 'Ativo')
  const totalRevenue = activeClients.reduce((s, c) => s + c.revenue, 0)

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />
  }

  function openNew() { setEditing(null); setDialogOpen(true) }
  function openEdit(c: ClientRow) { setEditing(c); setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteClient(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie sua base de clientes e contratos</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <UserPlus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Clientes', value: clients.length, sub: 'carteira completa' },
          { label: 'Clientes Ativos', value: activeClients.length, sub: `${clients.length ? Math.round((activeClients.length / clients.length) * 100) : 0}% da base` },
          { label: 'Faturamento Mensal', value: formatCurrency(totalRevenue), sub: 'clientes ativos' },
          { label: 'Ticket Médio', value: activeClients.length ? formatCurrency(Math.round(totalRevenue / activeClients.length)) : '—', sub: 'por cliente ativo' },
        ].map(c => (
          <Card key={c.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</p>
              <p className="mt-1.5 text-2xl font-bold">{c.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por nome, empresa, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {(['Ativo', 'Trial', 'Inativo', 'Churned'] as const).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={setContractFilter}>
              <SelectTrigger className="w-44"><SelectValue placeholder="Contrato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os contratos</SelectItem>
                {(['Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Download className="h-3.5 w-3.5" /> Exportar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando clientes...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {[
                      { label: 'Cliente', field: 'name' as SortField },
                      { label: 'Contato', field: null },
                      { label: 'Contrato', field: null },
                      { label: 'Faturamento', field: 'revenue' as SortField },
                      { label: 'Equipe', field: 'team_size' as SortField },
                      { label: 'Segmento', field: null },
                      { label: 'Status', field: null },
                      { label: '', field: null },
                    ].map(({ label, field }) => (
                      <th key={label} className="px-4 py-3 text-left first:px-6">
                        {field ? (
                          <button onClick={() => handleSort(field)} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                            {label} <SortIcon field={field} />
                          </button>
                        ) : (
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Nenhum cliente encontrado</td></tr>
                  ) : filtered.map(c => (
                    <tr key={c.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />{c.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{c.email}</div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{c.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${contractColors[c.contract_type]}`}>{c.contract_type}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold">{formatCurrency(c.revenue)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {c.contract_type === 'Anual' ? '/ano' : c.contract_type === 'Semestral' ? '/sem.' : c.contract_type === 'Trimestral' ? '/trim.' : '/mês'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium">{c.team_size}</span>
                        <span className="text-xs text-muted-foreground ml-1">pessoas</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{c.segment}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="border-t border-border px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de <span className="font-medium text-foreground">{clients.length}</span> clientes
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <ClienteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={data => editing ? updateClient(editing.id, data) : createClient(data)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir cliente?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir <span className="font-semibold text-foreground">{deleteTarget?.name}</span> ({deleteTarget?.company})? Esta ação não pode ser desfeita.
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
