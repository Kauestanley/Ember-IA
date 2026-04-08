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

const categoryConfig: Record<NewsPostRow['category'], { variant: 'success' | 'info' | 'warning' | 'destructive' | 'purple'; label: string; dot: string }> = {
  Conquista:   { variant: 'success',     label: '🏆 Conquista',    dot: 'bg-emerald-500' },
  Atualização: { variant: 'info',        label: '📋 Atualização',  dot: 'bg-blue-500' },
  Alerta:      { variant: 'warning',     label: '⚠️ Alerta',       dot: 'bg-amber-500' },
  Novidade:    { variant: 'purple',      label: '✨ Novidade',     dot: 'bg-purple-500' },
  Estratégia:  { variant: 'info',        label: '🎯 Estratégia',   dot: 'bg-sky-500' },
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
    <Card
      className={cn(
        'card-glow border-white/[0.06] transition-all duration-200 hover:border-white/[0.1] group',
        post.pinned && 'border-l-2 border-l-indigo-500'
      )}
    >
      <CardContent className="p-5">
        {post.pinned && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Pin className="h-3 w-3" /> Fixado
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md',
            post.author_color
          )}>
            {post.author_initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="font-semibold text-sm text-foreground/90">{post.author}</span>
              <span className="text-xs text-muted-foreground bg-white/[0.05] px-2 py-0.5 rounded-lg border border-white/[0.06]">
                {post.author_role}
              </span>
              <Badge variant={cat.variant} className="text-[10px] px-2 py-0.5">{cat.label}</Badge>
              <span className="ml-auto text-xs text-muted-foreground">{timeAgo}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={onLike}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-400 transition-colors"
              >
                <Heart className="h-3.5 w-3.5" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{post.comments} comentários</span>
              </button>
              {/* Hover actions */}
              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={onTogglePin}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-400 transition-colors px-2 py-1 rounded-lg hover:bg-indigo-500/10"
                >
                  {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                  {post.pinned ? 'Desafixar' : 'Fixar'}
                </button>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/[0.06]" onClick={onEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 hover:bg-rose-500/10 hover:text-rose-400"
                  onClick={onDelete}
                >
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
    <div className="p-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Newsletter Interna</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atualizações, conquistas e comunicados da equipe</p>
        </div>
        <Button
          className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-0"
          onClick={openNew}
        >
          <Plus className="h-4 w-4" /> Nova Publicação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="col-span-2 space-y-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'Conquista', 'Atualização', 'Alerta', 'Novidade', 'Estratégia'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                    filter === cat
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-white/[0.05] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground border border-white/[0.06]'
                  )}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Carregando posts...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <Card className="border-dashed border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.01)' }}>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm font-semibold text-foreground/60 mb-1">Nenhuma publicação encontrada</p>
                <Button
                  size="sm"
                  onClick={openNew}
                  className="mt-4 gap-1.5 bg-indigo-600 hover:bg-indigo-500 border-0"
                >
                  <Plus className="h-3.5 w-3.5" />Criar primeira publicação
                </Button>
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

        {/* Sidebar panels */}
        <div className="space-y-4">
          {/* Stats card */}
          <Card className="card-glow border-white/[0.06]">
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-4 text-foreground/90">Resumo da Semana</p>
              <div className="space-y-3">
                {[
                  { label: 'Publicações', value: stats.total, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                  { label: 'Conquistas', value: stats.conquistas, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Alertas', value: stats.alertas, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                  { label: 'Engajamento', value: `${stats.totalLikes} ❤️`, color: 'text-rose-400', bg: 'bg-rose-500/10' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={cn(
                      'text-sm font-black px-2.5 py-0.5 rounded-lg',
                      item.color, item.bg
                    )}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top authors */}
          {posts.length > 0 && (
            <Card className="card-glow border-white/[0.06]">
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-4 text-foreground/90">Autores</p>
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
                        <div className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold text-white shadow-md',
                          m.color
                        )}>
                          {m.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate text-foreground/80">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.role}</p>
                        </div>
                        <Badge variant="secondary" className="text-[10px] px-1.5 bg-white/[0.06] border-0">
                          {m.count}x
                        </Badge>
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
        <DialogContent className="max-w-sm border-white/[0.08]">
          <DialogHeader>
            <DialogTitle>Excluir publicação?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Excluir o post de{' '}
            <span className="font-semibold text-foreground">{deleteTarget?.author}</span>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="border-white/[0.08]">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Excluindo...</> : 'Sim, excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
