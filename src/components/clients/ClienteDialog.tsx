import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type ClientRow } from '@/lib/supabase'
import { type ClientFormData } from '@/hooks/useClientes'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: ClientRow | null
  onSave: (data: ClientFormData) => Promise<void>
}

const empty: ClientFormData = {
  name: '', company: '', email: '', phone: '',
  contract_type: 'Mensal', revenue: 0, team_size: 1,
  status: 'Trial', segment: '', start_date: new Date().toISOString().split('T')[0],
}

export function ClienteDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [form, setForm] = useState<ClientFormData>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(initial ? { ...initial } : { ...empty })
  }, [open, initial])

  function set<K extends keyof ClientFormData>(key: K, value: ClientFormData[K]) {
    setForm((f: ClientFormData) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({ ...form, revenue: Number(form.revenue), team_size: Number(form.team_size) })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome completo *</Label>
              <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Ana Rodrigues" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Empresa *</Label>
              <Input id="company" value={form.company} onChange={e => set('company', e.target.value)} required placeholder="TechVision SA" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="ana@empresa.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(11) 91234-5678" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de Contrato *</Label>
              <Select value={form.contract_type} onValueChange={v => set('contract_type', v as ClientFormData['contract_type'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Mensal', 'Trimestral', 'Semestral', 'Anual'] as const).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="revenue">Faturamento (R$) *</Label>
              <Input id="revenue" type="number" min={0} value={form.revenue} onChange={e => set('revenue', Number(e.target.value))} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team_size">Tamanho do Time *</Label>
              <Input id="team_size" type="number" min={1} value={form.team_size} onChange={e => set('team_size', Number(e.target.value))} required />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select value={form.status} onValueChange={v => set('status', v as ClientFormData['status'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Ativo', 'Trial', 'Inativo', 'Churned'] as const).map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="segment">Segmento</Label>
              <Input id="segment" value={form.segment} onChange={e => set('segment', e.target.value)} placeholder="SaaS, FinTech..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input id="start_date" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
