import { Bell, Search, Settings, ChevronDown, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

// Map routes to action buttons context
const pageActions: Record<string, { label: string; to: string } | null> = {
  '/clientes':   { label: 'Novo Cliente', to: '/clientes' },
  '/okrs':       { label: 'Novo OKR', to: '/okrs' },
  '/newsletter': { label: 'Nova Publicação', to: '/newsletter' },
  '/vendas':     null,
}

export function Header() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const [search, setSearch] = useState('')

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'
  const displayName = user?.email?.split('@')[0] ?? 'Usuário'

  return (
    <header
      className="fixed top-0 left-[220px] right-0 z-40 flex h-14 items-center justify-between px-6"
      style={{
        background: 'rgba(13,13,23,0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: User pill */}
      <button className="flex items-center gap-2.5 rounded-xl px-3 py-1.5 transition-colors hover:bg-white/[0.06]">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
        >
          {initials}
        </div>
        <div className="text-left">
          <p className="text-[13px] font-semibold text-white/90 leading-none capitalize">{displayName}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-white/30 ml-0.5" />
      </button>

      {/* Center: action button */}
      {pageActions[pathname] && (
        <button
          className="flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)', boxShadow: '0 4px 18px rgba(99,102,241,0.4)' }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {pageActions[pathname]!.label}
        </button>
      )}

      {/* Right: search + icons */}
      <div className="flex items-center gap-2">
        {/* Search pill */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="rounded-full pl-8 pr-4 py-1.5 text-[12px] outline-none transition-colors w-40 focus:w-56"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              transition: 'width 0.2s ease',
            }}
          />
        </div>

        {/* Bell */}
        <button
          className="relative flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500"
            style={{ boxShadow: '0 0 0 2px #0d0d17' }}
          />
        </button>

        {/* Settings */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
