import { useState } from 'react'
import { Heart, MessageCircle, Pin, PinOff, Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { PostDialog } from '@/components/newsletter/PostDialog'
import { useNewsletter } from '@/hooks/useNewsletter'
import { type NewsPostRow } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const cardStyle = { background: '#131320', border: '1px solid rgba(255,255,255,0.06)' }

const categoryConfig: Record<NewsPostRow['category'], { label: string; color: string; bg: string }> = {
  Conquista:   { label: '🏆 Conquista',   color: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  Atualização: { label: '📋 Atualização', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  Alerta:      { label: '⚠️ Alerta',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  Novidade:    { label: '✨ Novidade',    color: '#a855f7', bg: 'rgba(168,85,247,0.12)'  },
  Estratégia:  { label: '🎯 Estratégia', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
}

const allFilters = ['Todos', 'Conquista', 'Atualização', 'Alerta', 'Novidade', 'Estratégia'] as const

function PostCard({ post, onLike, onEdit, onDelete, onTogglePin }: {
  post: NewsPostRow
  onLike: () => void; onEdit: () => void; onDelete: () => void; onTogglePin: () => void
}) {
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })
  const cat     = categoryConfig[post.category]

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-200 group"
      style={{
        ...cardStyle,
        borderLeft: post.pinned ? `2px solid ${cat.color}` : undefined,
      }}
    >
      {post.pinned && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold" style={{ color: cat.color }}>
          <Pin className="h-3 w-3" /> Fixado
        </div>
      )}

      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white shadow-md',
          post.author_color
        )}>
          {post.author_initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-[13px] font-bold" style={{ color: 'rgba(255,255,255,0.85)' }}>{post.author}</span>
            <span
              className="rounded-lg px-2 py-0.5 text-[9px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {post.author_role}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: cat.bg, color: cat.color }}
            >
              {cat.label}
            </span>
            <span className="ml-auto text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{timeAgo}</span>
          </div>

          {/* Content */}
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-rose-400"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <Heart className="h-3.5 w-3.5" /> {post.likes}
            </button>
            <button
              className="flex items-center gap-1.5 text-[11px] transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments} comentários
            </button>

            {/* Hover actions */}
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onTogglePin}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = cat.color }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                {post.pinned ? 'Desafixar' : 'Fixar'}
              </button>
              <button
                onClick={onEdit}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-rose-500/15 hover:text-rose-400"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Newsletter() {
  const { posts, loading, createPost, updatePost, deletePost, likePost, togglePin } = useNewsletter()

  const [filter,       setFilter]       = useState<string>('Todos')
  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [editing,      setEditing]      = useState<NewsPostRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<NewsPostRow | null>(null)
  const [deleting,     setDeleting]     = useState(false)

  const filtered = filter === 'Todos' ? posts : posts.filter(p => p.category === filter)

  function openNew()                { setEditing(null); setDialogOpen(true) }
  function openEdit(p: NewsPostRow) { setEditing(p);    setDialogOpen(true) }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deletePost(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
  }

  const stats = {
    total:      posts.length,
    conquistas: posts.filter(p => p.category === 'Conquista').length,
    alertas:    posts.filter(p => p.category === 'Alerta').length,
    totalLikes: posts.reduce((s, p) => s + p.likes, 0),
  }

  // Top authors
  const authors = Object.values(
    posts.reduce<Record<string, { name: string; role: string; initials: string; color: string; count: number }>>((acc, p) => {
      if (!acc[p.author]) acc[p.author] = { name: p.author, role: p.author_role, initials: p.author_initials, color: p.author_color, count: 0 }
      acc[p.author].count++
      return acc
    }, {})
  ).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Comunicação Interna · Equipe
          </p>
          <h1 className="text-2xl font-black tracking-tight text-white">Newsletter Interna</h1>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 18px rgba(99,102,241,0.4)' }}
        >
          <Plus className="h-3.5 w-3.5" /> Nova Publicação
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">

        {/* Feed */}
        <div className="col-span-2 space-y-4">
          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {allFilters.map(cat => {
              const isActive = filter === cat
              const cfg = cat !== 'Todos' ? categoryConfig[cat as NewsPostRow['category']] : null
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className="rounded-full px-3.5 py-1.5 text-[11px] font-bold transition-all duration-150"
                  style={{
                    background: isActive
                      ? cfg ? cfg.bg : 'rgba(255,255,255,0.1)'
                      : 'rgba(255,255,255,0.04)',
                    color: isActive
                      ? cfg ? cfg.color : 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.3)',
                    border: isActive
                      ? `1px solid ${cfg ? cfg.color + '40' : 'rgba(255,255,255,0.15)'}`
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span className="text-[13px]">Carregando posts...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center" style={cardStyle}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhuma publicação encontrada</p>
              <button
                onClick={openNew}
                className="mt-4 flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
              >
                <Plus className="h-3.5 w-3.5" /> Criar publicação
              </button>
            </div>
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
          {/* Stats */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-[13px] font-bold mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>Resumo da Semana</p>
            <div className="space-y-3">
              {[
                { label: 'Publicações', value: stats.total,      color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
                { label: 'Conquistas',  value: stats.conquistas, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
                { label: 'Alertas',     value: stats.alertas,    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                { label: 'Curtidas',    value: stats.totalLikes, color: '#f43f5e', bg: 'rgba(244,63,94,0.12)'  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                  <span
                    className="rounded-lg px-2.5 py-0.5 text-[13px] font-black"
                    style={{ background: item.bg, color: item.color }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-[13px] font-bold mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>Por Categoria</p>
            <div className="space-y-2.5">
              {Object.entries(categoryConfig).map(([cat, cfg]) => {
                const count = posts.filter(p => p.category === cat).length
                const pct   = posts.length ? Math.round((count / posts.length) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cat}</span>
                      <span className="text-[11px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{count}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Authors */}
          {authors.length > 0 && (
            <div className="rounded-2xl p-5" style={cardStyle}>
              <p className="text-[13px] font-bold mb-4" style={{ color: 'rgba(255,255,255,0.75)' }}>Autores</p>
              <div className="space-y-3">
                {authors.map(m => (
                  <div key={m.name} className="flex items-center gap-2.5">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white', m.color)}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{m.name}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{m.role}</p>
                    </div>
                    <span
                      className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
                    >
                      {m.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PostDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={data => editing ? updatePost(editing.id, data) : createPost(data)}
      />

      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: '#131320', border: '1px solid rgba(255,255,255,0.08)' }}>
          <DialogHeader><DialogTitle>Excluir publicação?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Excluir o post de <span className="font-semibold text-foreground">{deleteTarget?.author}</span>?
            Esta ação não pode ser desfeita.
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
