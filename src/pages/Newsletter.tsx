import { useState } from 'react'
import { Heart, MessageCircle, Pin, PinOff, Filter, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PostDialog } from '@/components/newsletter/PostDialog'
import { useNewsletter } from '@/hooks/useNewsletter'
import { type NewsPostRow } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const categoryConfig: Record<NewsPostRow['category'], { variant: 'success' | 'info' | 'warning' | 'destructive' | 'purple'; label: string }> = {
  Conquista:  { variant: 'success',     label: '🏆 Conquista' },
  Atualização:{ variant: 'info',        label: '📋 Atualização' },
  Alerta:     { variant: 'warning',     label: '⚠️ Alerta' },
  Novidade:   { variant: 'purple',      label: '✨ Novidade' },
  Estratégia: { variant: 'info',        label: '🎯 Estratégia' },
}

function PostCard({
  post, onLike, onEdit, onDelete, onTogglePin,
}: {
  post: NewsPostRow
  onLike: () => void
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })
  const cat = categoryConfig[post.category]

  return (
    <Card className={cn('border-border/50 transition-all duration-200 hover:border-border group', post.pinned && 'border-l-2 border-l-primary')}>
      <CardContent className="p-5">
        {post.pinned && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Pin className="h-3 w-3" /> Fixado
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white', post.author_color)}>
            {post.author_initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{post.author}</span>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{post.author_role}</span>
              <Badge variant={cat.variant} className="text-[10px] px-1.5 py-0">{cat.label}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <div className="mt-4 flex items-center gap-4">
              <button onClick={onLike} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors">
                <Heart className="h-3.5 w-3.5" /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3.5 w-3.5" /> {post.comments} comentários
              </button>
              {/* Actions — visible on hover */}
              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onTogglePin} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted">
                  {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {post.pinned ? 'Desafixar' : 'Fixar'}
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Newsletter() {
  const { posts, loading, createPost, updatePost, deletePost, likePost, togglePin } = useNewsletter()

  const [filter, setFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<NewsPostRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsPostRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  function openNew() { setEditing(null); setDialogOpen(true) }
  function openEdit(p: NewsPostRow) { setEditing(p); setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deletePost(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const stats = {
    total: posts.length,
    conquistas: posts.filter(p => p.category === 'Conquista').length,
    alertas: posts.filter(p => p.category === 'Alerta').length,
    totalLikes: posts.reduce((s, p) => s + p.likes, 0),
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Newsletter Interna</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atualizações, conquistas e comunicados da equipe</p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Nova Publicação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'Conquista', 'Atualização', 'Alerta', 'Novidade', 'Estratégia'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    filter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Carregando posts...
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <Card className="border-dashed border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-medium text-muted-foreground">Nenhuma publicação encontrada</p>
                <Button size="sm" onClick={openNew} className="mt-4 gap-1.5"><Plus className="h-3.5 w-3.5" />Criar primeira publicação</Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onLike={() => likePost(post.id, post.likes)}
                onEdit={() => openEdit(post)}
                onDelete={() => setDeleteTarget(post)}
                onTogglePin={() => togglePin(post.id, post.pinned)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-4">Resumo da Semana</p>
              <div className="space-y-3">
                {[
                  { label: 'Publicações', value: stats.total, color: 'text-indigo-400' },
                  { label: 'Conquistas', value: stats.conquistas, color: 'text-emerald-400' },
                  { label: 'Alertas', value: stats.alertas, color: 'text-amber-400' },
                  { label: 'Engajamento', value: `${stats.totalLikes} ❤️`, color: 'text-rose-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={cn('text-sm font-bold', item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top authors */}
          {posts.length > 0 && (
            <Card className="border-border/50">
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-4">Autores</p>
                <div className="space-y-3">
                  {Object.values(
                    posts.reduce<Record<string, { name: string; role: string; initials: string; color: string; count: number }>>((acc, p) => {
                      if (!acc[p.author]) acc[p.author] = { name: p.author, role: p.author_role, initials: p.author_initials, color: p.author_color, count: 0 }
                      acc[p.author].count++
                      return acc
                    }, {})
                  )
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map(m => (
                      <div key={m.name} className="flex items-center gap-2.5">
                        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white', m.color)}>
                          {m.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.role}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5">{m.count}x</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={data => editing ? updatePost(editing.id, data) : createPost(data)}
      />

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir publicação?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Excluir o post de <span className="font-semibold text-foreground">{deleteTarget?.author}</span>? Esta ação não pode ser desfeita.
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
