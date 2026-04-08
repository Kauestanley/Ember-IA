import { useState, useMemo } from 'react'
import { Search, Filter, Download, UserPlus, Building2, Mail, Phone, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { clients, type Client, type ContractType, type ClientStatus } from '@/data/mockData'
import { formatCurrency } from '@/lib/utils'

type SortField = 'name' | 'company' | 'revenue' | 'teamSize'
type SortDir = 'asc' | 'desc'

const statusVariant: Record<ClientStatus, 'success' | 'info' | 'warning' | 'destructive'> = {
  Ativo: 'success',
  Trial: 'info',
  Inativo: 'warning',
  Churned: 'destructive',
}

const contractColors: Record<ContractType, string> = {
  Mensal: 'text-blue-400',
  Trimestral: 'text-purple-400',
  Semestral: 'text-amber-400',
  Anual: 'text-emerald-400',
}

export function Clientes() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [contractFilter, setContractFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const filtered = useMemo(() => {
    let data: Client[] = [...clients]

    if (search) {
      const q = search.toLowerCase()
      data = data.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.segment.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') data = data.filter(c => c.status === statusFilter)
    if (contractFilter !== 'all') data = data.filter(c => c.contractType === contractFilter)

    data.sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      const cmp = typeof valA === 'string' ? valA.localeCompare(valB as string) : (valA as number) - (valB as number)
      return sortDir === 'asc' ? cmp : -cmp
    })

    return data
  }, [search, statusFilter, contractFilter, sortField, sortDir])

  const totalRevenue = clients.filter(c => c.status === 'Ativo').reduce((s, c) => s + c.revenue, 0)
  const activeCount = clients.filter(c => c.status === 'Ativo').length

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('desc') }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5 text-primary" /> : <ChevronDown className="h-3.5 w-3.5 text-primary" />
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Gerencie sua base de clientes e contratos</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Total de Clientes', value: clients.length, sub: 'carteira completa' },
          { label: 'Clientes Ativos', value: activeCount, sub: `${Math.round((activeCount / clients.length) * 100)}% da base` },
          { label: 'Faturamento Mensal', value: formatCurrency(totalRevenue), sub: 'clientes ativos' },
          { label: 'Ticket Médio', value: formatCurrency(Math.round(totalRevenue / activeCount)), sub: 'por cliente ativo' },
        ].map(card => (
          <Card key={card.label} className="border-border/50">
            <CardContent className="p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{card.label}</p>
              <p className="mt-1.5 text-2xl font-bold text-foreground">{card.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, empresa, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Trial">Trial</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
                <SelectItem value="Churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={setContractFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Contrato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os contratos</SelectItem>
                <SelectItem value="Mensal">Mensal</SelectItem>
                <SelectItem value="Trimestral">Trimestral</SelectItem>
                <SelectItem value="Semestral">Semestral</SelectItem>
                <SelectItem value="Anual">Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cliente <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contrato</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('revenue')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Faturamento <SortIcon field="revenue" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort('teamSize')}
                      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Equipe <SortIcon field="teamSize" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Segmento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      Nenhum cliente encontrado com os filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filtered.map(client => (
                    <tr key={client.id} className="group hover:bg-muted/20 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{client.name}</p>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              {client.company}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />{client.email}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />{client.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm font-medium ${contractColors[client.contractType]}`}>
                          {client.contractType}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-foreground">{formatCurrency(client.revenue)}</span>
                        <span className="block text-xs text-muted-foreground">
                          {client.contractType === 'Anual' ? '/ano' : client.contractType === 'Semestral' ? '/sem.' : client.contractType === 'Trimestral' ? '/trim.' : '/mês'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-foreground">{client.teamSize}</span>
                        <span className="text-xs text-muted-foreground ml-1">pessoas</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                          {client.segment}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant[client.status]}>{client.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-6 py-3 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-medium text-foreground">{filtered.length}</span> de <span className="font-medium text-foreground">{clients.length}</span> clientes
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="outline" size="sm" className="bg-primary/10 text-primary border-primary/30">1</Button>
              <Button variant="outline" size="sm">Próximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
