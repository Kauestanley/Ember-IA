import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type OKRRow } from '@/lib/supabase'
import { type OKRFormData, type KRFormData } from '@/hooks/useOKRs'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: OKRRow | null
  onSave: (data: OKRFormData) => Promise<void>
}

const emptyKR: KRFormData = { description: '', current_value: 0, target_value: 100, unit: '%' }

function emptyForm(): OKRFormData {
  return { objective: '', owner: '', quarter: 'Q1 2025', progress: 0, key_results: [{ ...emptyKR }] }
}

export function OKRDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [form, setForm] = useState<OKRFormData>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setForm({
        objective: initial.objective,
        owner: initial.owner,
        quarter: initial.quarter,
        progress: initial.progress,
        key_results: initial.key_results.map(kr => ({
          description: kr.description,
          current_value: kr.current_value,
          target_value: kr.target_value,
          unit: kr.unit,
        })),
      })
    } else {
      setForm(emptyForm())
    }
  }, [open, initial])

  function setField<K extends keyof Omit<OKRFormData, 'key_results'>>(key: K, value: OKRFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function updateKR(index: number, field: keyof KRFormData, value: string | number) {
    setForm(f => ({
      ...f,
      key_results: f.key_results.map((kr, i) => i === index ? { ...kr, [field]: value } : kr),
    }))
  }

  function addKR() {
    setForm(f => ({ ...f, key_results: [...f.key_results, { ...emptyKR }] }))
  }

  function removeKR(index: number) {
    setForm(f => ({ ...f, key_results: f.key_results.filter((_, i) => i !== index) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        progress: Number(form.progress),
        key_results: form.key_results.map(kr => ({
          ...kr,
          current_value: Number(kr.current_value),
          target_value: Number(kr.target_value),
        })),
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar OKR' : 'Novo OKR'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Objective */}
          <div className="space-y-1.5">
            <Label htmlFor="objective">Objetivo *</Label>
            <Input
              id="objective"
              value={form.objective}
              onChange={e => setField('objective', e.target.value)}
              required
              placeholder="Atingir R$ 500k de MRR até Q4 2024"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="owner">Responsável *</Label>
              <Input id="owner" value={form.owner} onChange={e => setField('owner', e.target.value)} required placeholder="Felipe Barros" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quarter">Período *</Label>
              <Input id="quarter" value={form.quarter} onChange={e => setField('quarter', e.target.value)} required placeholder="Q1 2025" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="progress">Progresso geral: <span className="text-primary font-bold">{form.progress}%</span></Label>
            <input
              id="progress"
              type="range"
              min={0}
              max={100}
              value={form.progress}
              onChange={e => setField('progress', Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Key Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Key Results</Label>
              <Button type="button" variant="outline" size="sm" onClick={addKR} className="gap-1.5 h-7 text-xs">
                <Plus className="h-3 w-3" />
                Adicionar KR
              </Button>
            </div>
            <div className="space-y-3">
              {form.key_results.map((kr, i) => (
                <div key={i} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">KR {i + 1}</span>
                    {form.key_results.length > 1 && (
                      <button type="button" onClick={() => removeKR(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <Input
                    value={kr.description}
                    onChange={e => updateKR(i, 'description', e.target.value)}
                    required
                    placeholder="Descrição do Key Result"
                    className="text-sm"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Atual</Label>
                      <Input type="number" value={kr.current_value} onChange={e => updateKR(i, 'current_value', e.target.value)} className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Meta</Label>
                      <Input type="number" value={kr.target_value} onChange={e => updateKR(i, 'target_value', e.target.value)} required className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Unidade</Label>
                      <Input value={kr.unit} onChange={e => updateKR(i, 'unit', e.target.value)} required placeholder="%, k, pessoas…" className="h-8 text-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : initial ? 'Salvar alterações' : 'Criar OKR'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
