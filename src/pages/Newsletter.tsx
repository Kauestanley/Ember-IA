import { useState } from 'react'
import { Heart, MessageCircle, Pin, Send, Filter, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { newsPosts, type NewsPost } from '@/data/mockData'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const categoryConfig: Record<NewsPost['category'], { variant: 'success' | 'info' | 'warning' | 'destructive' | 'purple'; label: string }> = {
  Conquista: { variant: 'success', label: '🏆 Conquista' },
  Atualização: { variant: 'info', label: '📋 Atualização' },
  Alerta: { variant: 'warning', label: '⚠️ Alerta' },
  Novidade: { variant: 'purple', label: '✨ Novidade' },
  Estratégia: { variant: 'info', label: '🎯 Estratégia' },
}

function PostCard({ post, liked, onLike }: { post: NewsPost; liked: boolean; onLike: () => void }) {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true, locale: ptBR })
  const cat = categoryConfig[post.category]

  return (
    <Card className={cn(
      'border-border/50 transition-all duration-200 hover:border-border',
      post.pinned && 'border-l-2 border-l-primary'
    )}>
      <CardContent className="p-5">
        {post.pinned && (
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-primary">
            <Pin className="h-3 w-3" />
            Fixado
          </div>
        )}

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white',
            post.authorColor
          )}>
            {post.authorInitials}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-semibold text-foreground text-sm">{post.author}</span>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                {post.authorRole}
              </span>
              <Badge variant={cat.variant} className="text-[10px] px-1.5 py-0">
                {cat.label}
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={onLike}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  liked ? 'text-rose-400' : 'text-muted-foreground hover:text-rose-400'
                )}
              >
                <Heart className={cn('h-3.5 w-3.5', liked && 'fill-rose-400')} />
                {post.likes + (liked ? 1 : 0)}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.comments} comentários
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Newsletter() {
  const [filter, setFilter] = useState<string>('all')
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [composing, setComposing] = useState(false)
  const [draft, setDraft] = useState('')

  const sorted = [...newsPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  const filtered = filter === 'all' ? sorted : sorted.filter(p => p.category === filter)

  const toggleLike = (id: string) => setLiked(l => ({ ...l, [id]: !l[id] }))

  const stats = {
    total: newsPosts.length,
    conquistas: newsPosts.filter(p => p.category === 'Conquista').length,
    alertas: newsPosts.filter(p => p.category === 'Alerta').length,
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Newsletter Interna</h1>
          <p className="mt-1 text-sm text-muted-foreground">Atualizações, conquistas e comunicados da equipe</p>
        </div>
        <Button className="gap-2" onClick={() => setComposing(c => !c)}>
          <Plus className="h-4 w-4" />
          Nova Publicação
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="col-span-2 space-y-4">
          {/* Compose Box */}
          {composing && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                    FB
                  </div>
                  <div className="flex-1 space-y-3">
                    <textarea
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      placeholder="Compartilhe uma atualização com a equipe..."
                      className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
                    />
                    <div className="flex items-center gap-2">
                      <Select defaultValue="Atualização">
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(categoryConfig).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="ml-auto flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setComposing(false); setDraft('') }}>
                          Cancelar
                        </Button>
                        <Button size="sm" className="gap-1.5" disabled={!draft.trim()}>
                          <Send className="h-3.5 w-3.5" />
                          Publicar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                    filter === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                liked={!!liked[post.id]}
                onLike={() => toggleLike(post.id)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Resumo da Semana</p>
              <div className="space-y-3">
                {[
                  { label: 'Publicações', value: stats.total, color: 'text-indigo-400' },
                  { label: 'Conquistas', value: stats.conquistas, color: 'text-emerald-400' },
                  { label: 'Alertas', value: stats.alertas, color: 'text-amber-400' },
                  { label: 'Engajamento', value: `${newsPosts.reduce((s, p) => s + p.likes, 0)} ❤️`, color: 'text-rose-400' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className={cn('text-sm font-bold', item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Team */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-4">Mais Ativos</p>
              <div className="space-y-3">
                {[
                  { name: 'Felipe Barros', role: 'CEO', initials: 'FB', color: 'bg-indigo-500', posts: 2 },
                  { name: 'Thiago Rocha', role: 'Head CS', initials: 'TR', color: 'bg-amber-500', posts: 1 },
                  { name: 'Marina Costa', role: 'COO', initials: 'MC', color: 'bg-emerald-500', posts: 1 },
                  { name: 'Larissa Nunes', role: 'Marketing', initials: 'LN', color: 'bg-purple-500', posts: 1 },
                ].map(member => (
                  <div key={member.name} className="flex items-center gap-2.5">
                    <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white', member.color)}>
                      {member.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] px-1.5">{member.posts}x</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Search */}
          <Card className="border-border/50">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Buscar Publicações</p>
              <div className="relative">
                <Input placeholder="Pesquisar..." className="text-sm h-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
