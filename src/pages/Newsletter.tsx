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

const RED   = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

const categoryConfig: Record<NewsPostRow['category'], { label: string; color: string; bg: string }> = {
  Conquista:   { label: '🏆 Conquista',   color: GREEN,              bg: `${GREEN}15`              },
  Atualização: { label: '📋 Atualização', color: '#ffffff',          bg: 'rgba(255,255,255,0.08)'  },
  Alerta:      { label: '⚠️ Alerta',      color: RED,                bg: `${RED}15`                },
  Novidade:    { label: '✨ Novidade',    color: '#f59e0b',          bg: 'rgba(245,158,11,0.12)'   },
  Estratégia:  { label: '🎯 Estratégia', color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.06)' },
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
      className="rounded-2xl p-4 md:p-5 transition-all duration-200 group"
      style={{
        background: CARD,
        border: post.pinned ? `1px solid ${cat.color}40` : CARD_B,
        borderLeft: post.pinned ? `3px solid ${cat.color}` : undefined,
      }}
    >
      {post.pinned && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] font-bold" style={{ color: cat.color }}>
          <Pin className="h-3 w-3" /> Fixado
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-black text-white', post.author_color)}>
          {post.author_initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-[13px] font-bold text-white/85">{post.author}</span>
            <span className="rounded-lg px-2 py-0.5 text-[9px] font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {post.author_role}
            </span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ background: cat.bg, color: cat.color }}>
              {cat.label}
            </span>
            <span className="ml-auto text-[11px] text-white/25">{timeAgo}</span>
          </div>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap text-white/65">{post.content}</p>
          <div className="flex items-center gap-4 mt-4">
            <button onClick={onLike}
              className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-red-400 min-h-[44px] min-w-[44px]"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              <Heart className="h-3.5 w-3.5" /> {post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-[11px] transition-colors min-h-[44px]"
              style={{ color: 'rgba(255,255,255,0.3)' }}>
              <MessageCircle className="h-3.5 w-3.5" /> {post.comments} comentários
            </button>
            <div className="ml-auto flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button onClick={onTogglePin}
                className="flex items-center gap-1 rounded-lg px-2 py-2 text-[11px] transition-colors hover:bg-white/[0.06] min-h-[44px]"
                style={{ color: 'rgba(255,255,255,0.3)' }}>
                {post.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline ml-1">{post.pinned ? 'Desafixar' : 'Fixar'}</span>
              </button>
              <button onClick={onEdit}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07]"
                style={{ color: 'rgba(255,255,255,0.35)' }}>
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete}
                className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${RED}20`; e.currentTarget.style.color = RED }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}>
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

  const authors = Object.values(
    posts.reduce<Record<string, { name: string; role: string; initials: string; color: string; count: number }>>((acc, p) => {
      if (!acc[p.author]) acc[p.author] = { name: p.author, role: p.author_role, initials: p.author_initials, color: p.author_color, count: 0 }
      acc[p.author].count++
      return acc
    }, {})
  ).sort((a, b) => b.count - a.count).slice(0, 5)

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Comunicação Interna · Equipe
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Newsletter Interna</h1>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: RED, boxShadow: `0 4px 18px ${RED}40`, minHeight: '44px' }}>
          <Plus className="h-3.5 w-3.5" /> Nova Publicação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {allFilters.map(cat => {
              const isActive = filter === cat
              const cfg = cat !== 'Todos' ? categoryConfig[cat as NewsPostRow['category']] : null
              return (
                <button key={cat} onClick={() => setFilter(cat)}
                  className="rounded-full px-3.5 py-2 text-[11px] font-bold transition-all duration-150"
                  style={{
                    background: isActive ? (cfg ? cfg.bg : 'rgba(255,255,255,0.1)') : 'rgba(255,255,255,0.04)',
                    color:      isActive ? (cfg ? cfg.color : '#fff') : 'rgba(255,255,255,0.3)',
                    border:     isActive ? `1px solid ${cfg ? cfg.color + '40' : 'rgba(255,255,255,0.15)'}` : '1px solid rgba(255,255,255,0.06)',
                    minHeight: '36px',
                  }}>
                  {cat}
                </button>
              )
            })}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20 gap-3 text-white/30">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: RED }} />
              <span className="text-[13px]">Carregando posts...</span>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
              style={{ background: CARD, border: CARD_B }}>
              <p className="text-[13px] font-semibold mb-1 text-white/40">Nenhuma publicação encontrada</p>
              <button onClick={openNew}
                className="mt-4 flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[12px] font-bold text-white"
                style={{ background: RED, minHeight: '44px' }}>
                <Plus className="h-3.5 w-3.5" /> Criar publicação
              </button>
            </div>
          )}

          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard key={post.id} post={post}
                onLike={() => likePost(post.id, post.likes)}
                onEdit={() => openEdit(post)}
                onDelete={() => setDeleteTarget(post)}
                onTogglePin={() => togglePin(post.id, post.pinned)} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
            <p className="text-[13px] font-bold mb-4 text-white/75">Resumo da Semana</p>
            <div className="space-y-3">
              {[
                { label: 'Publicações', value: stats.total,      color: '#fff',    bg: 'rgba(255,255,255,0.08)' },
                { label: 'Conquistas',  value: stats.conquistas, color: GREEN,     bg: `${GREEN}15`             },
                { label: 'Alertas',     value: stats.alertas,    color: RED,       bg: `${RED}15`               },
                { label: 'Curtidas',    value: stats.totalLikes, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-white/40">{item.label}</span>
                  <span className="rounded-lg px-2.5 py-0.5 text-[13px] font-black"
                    style={{ background: item.bg, color: item.color }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
            <p className="text-[13px] font-bold mb-4 text-white/75">Por Categoria</p>
            <div className="space-y-2.5">
              {Object.entries(categoryConfig).map(([cat, cfg]) => {
                const count = posts.filter(p => p.category === cat).length
                const pct   = posts.length ? Math.round((count / posts.length) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-semibold" style={{ color: cfg.color }}>{cat}</span>
                      <span className="text-[11px] font-bold text-white/50">{count}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-white/[0.06]">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Authors */}
          {authors.length > 0 && (
            <div className="rounded-2xl p-5" style={{ background: CARD, border: CARD_B }}>
              <p className="text-[13px] font-bold mb-4 text-white/75">Autores</p>
              <div className="space-y-3">
                {authors.map(m => (
                  <div key={m.name} className="flex items-center gap-2.5">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[10px] font-black text-white', m.color)}>
                      {m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold truncate text-white/70">{m.name}</p>
                      <p className="text-[10px] text-white/30">{m.role}</p>
                    </div>
                    <span className="rounded-lg px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: `${RED}15`, color: RED }}>
                      {m.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PostDialog open={dialogOpen} onOpenChange={setDialogOpen} initial={editing}
        onSave={data => editing ? updatePost(editing.id, data) : createPost(data)} />

      <Dialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm" style={{ background: CARD, border: CARD_B }}>
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
