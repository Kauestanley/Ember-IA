import { Bell, Search, Settings, ChevronDown, UserPlus, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

const pageActions: Record<string, string | null> = {
  '/clientes':   'Novo Cliente',
  '/okrs':       'Novo OKR',
  '/newsletter': 'Nova Publicação',
  '/vendas':     null,
}

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user }     = useAuth()
  const { pathname } = useLocation()
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const initials    = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'
  const displayName = user?.email?.split('@')[0] ?? 'Usuário'
  const actionLabel = pageActions[pathname]

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between px-4 md:left-[220px] md:px-6"
      style={{
        background: 'rgba(10,10,10,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Left: hamburger (mobile) + user pill */}
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06] md:hidden"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* User pill */}
        <button className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/[0.05]">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: '#ef4444' }}
          >
            {initials}
          </div>
          <p className="hidden text-[13px] font-semibold text-white/90 capitalize sm:block">{displayName}</p>
          <ChevronDown className="hidden h-3.5 w-3.5 text-white/30 sm:block" />
        </button>
      </div>

      {/* Center: action button — hidden on mobile */}
      {actionLabel && (
        <button
          className="hidden items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-bold text-white transition-opacity hover:opacity-85 md:flex"
          style={{ background: '#ef4444', boxShadow: '0 4px 18px rgba(239,68,68,0.35)' }}
        >
          <UserPlus className="h-3.5 w-3.5" />
          {actionLabel}
        </button>
      )}

      {/* Right: search + icons */}
      <div className="flex items-center gap-1.5">
        {/* Search — expandable on mobile, full on desktop */}
        <div className="relative flex items-center">
          {/* Mobile: icon-only button that expands */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06] md:hidden"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onClick={() => setSearchOpen(o => !o)}
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Desktop search input */}
          <div className="hidden md:flex relative items-center">
            <Search className="absolute left-3 h-3.5 w-3.5 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="rounded-full pl-8 pr-4 py-1.5 text-[12px] outline-none w-40 focus:w-52"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.8)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        </div>

        {/* Mobile search overlay input */}
        {searchOpen && (
          <div
            className="absolute left-0 right-0 top-14 z-50 px-4 py-2 md:hidden"
            style={{ background: 'rgba(10,10,10,0.98)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 pointer-events-none" style={{ color: 'rgba(255,255,255,0.25)' }} />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.8)',
                  minHeight: '44px',
                }}
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          </div>
        )}

        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" style={{ boxShadow: '0 0 0 2px #0a0a0a' }} />
        </button>

        <button
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
