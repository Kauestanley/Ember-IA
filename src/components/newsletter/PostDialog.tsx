import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type NewsPostRow } from '@/lib/supabase'
import { type PostFormData } from '@/hooks/useNewsletter'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  initial?: NewsPostRow | null
  onSave: (data: PostFormData) => Promise<void>
}

const AUTHOR_COLORS = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500',
  'bg-amber-500', 'bg-blue-500', 'bg-rose-500', 'bg-teal-500',
]

const empty: PostFormData = {
  author: '', author_role: '', author_initials: '',
  author_color: 'bg-indigo-500', content: '',
  category: 'Atualização', pinned: false,
}

export function PostDialog({ open, onOpenChange, initial, onSave }: Props) {
  const [form, setForm] = useState<PostFormData>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(initial ? {
      author: initial.author,
      author_role: initial.author_role,
      author_initials: initial.author_initials,
      author_color: initial.author_color,
      content: initial.content,
      category: initial.category,
      pinned: initial.pinned,
    } : { ...empty })
  }, [open, initial])

  function set<K extends keyof PostFormData>(key: K, value: PostFormData[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function handleNameChange(name: string) {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0].toUpperCase())
      .join('')
      .slice(0, 2)
    setForm(f => ({ ...f, author: name, author_initials: initials }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(form)
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Editar Publicação' : 'Nova Publicação'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="author">Autor *</Label>
              <Input
                id="author"
                value={form.author}
                onChange={e => handleNameChange(e.target.value)}
                required
                placeholder="Felipe Barros"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author_role">Cargo *</Label>
              <Input
                id="author_role"
                value={form.author_role}
                onChange={e => set('author_role', e.target.value)}
                required
                placeholder="CEO"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={form.category} onValueChange={v => set('category', v as PostFormData['category'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['Atualização', 'Conquista', 'Alerta', 'Novidade', 'Estratégia'] as const).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cor do avatar</Label>
              <div className="flex gap-1.5 pt-1">
                {AUTHOR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => set('author_color', color)}
                    className={`h-6 w-6 rounded-full ${color} ${form.author_color === color ? 'ring-2 ring-offset-2 ring-primary ring-offset-card' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">Conteúdo *</Label>
            <Textarea
              id="content"
              value={form.content}
              onChange={e => set('content', e.target.value)}
              required
              placeholder="Escreva sua atualização para a equipe..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pinned"
              checked={form.pinned}
              onChange={e => set('pinned', e.target.checked)}
              className="accent-primary h-4 w-4"
            />
            <Label htmlFor="pinned" className="cursor-pointer font-normal text-muted-foreground">
              Fixar este post no topo
            </Label>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Publicando...' : initial ? 'Salvar alterações' : 'Publicar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
