import { NavLink, useNavigate } from 'react-router-dom'
import { Users, Target, Newspaper, TrendingUp, Zap, BarChart3, Settings, Bell, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { supabase, type ClientRow } from '@/lib/supabase'

const navItems = [
  { to: '/vendas',     icon: TrendingUp, label: 'Dashboard' },
  { to: '/clientes',   icon: Users,      label: 'Clientes'  },
  { to: '/okrs',       icon: Target,     label: 'OKRs'      },
  { to: '/newsletter', icon: Newspaper,  label: 'Newsletter', badge: '3' },
]

const systemItems = [
  { to: '/relatorios',    icon: BarChart3, label: 'Relatórios'    },
  { to: '/notificacoes',  icon: Bell,      label: 'Notificações'  },
  { to: '/configuracoes', icon: Settings,  label: 'Configurações' },
]

const AVATAR_COLORS = [
  'bg-red-600', 'bg-green-600', 'bg-blue-600', 'bg-purple-600',
  'bg-amber-600', 'bg-pink-600',
]

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function toMonthlyRevenue(c: ClientRow): number {
  const divisor = { Mensal: 1, Trimestral: 3, Semestral: 6, Anual: 12 }[c.contract_type]
  return c.revenue / divisor
}

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [topClients, setTopClients] = useState<ClientRow[]>([])
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'Ativo')
        .order('revenue', { ascending: false })
        .limit(4)
      if (data) setTopClients(data)
    }

    async function loadCount() {
      const { count } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Ativo')
      setActiveCount(count ?? 0)
    }

    load()
    loadCount()

    const channel = supabase
      .channel('sidebar-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        load()
        loadCount()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const userInitials  = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'
  const displayEmail  = user?.email ?? ''

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}
      style={{ background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: '#ef4444' }}>
          <Zap style={{ height: '14px', width: '14px', color: '#fff' }} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-[13px] font-bold tracking-tight text-white">Ember IA</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Plataforma</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 scrollbar-thin space-y-5">

        {/* Main */}
        <div>
          <p className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Principal
          </p>
          <ul className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose}>
                  {({ isActive }) => (
                    <span
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer',
                        isActive ? 'bg-white text-black' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.35)' }} />
                      <span className="flex-1">{label}</span>
                      {badge && (
                        <span
                          className="flex items-center justify-center rounded-full text-[9px] font-bold leading-none px-1.5"
                          style={{
                            paddingTop: '2px', paddingBottom: '2px',
                            background: isActive ? 'rgba(0,0,0,0.15)' : 'rgba(239,68,68,0.2)',
                            color:      isActive ? '#000'              : '#ef4444',
                          }}
                        >
                          {badge}
                        </span>
                      )}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Top active clients — real data */}
        <div>
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Clientes Ativos
            </p>
            <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold px-1" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {activeCount}
            </span>
          </div>
          {topClients.length === 0 ? (
            <p className="px-2.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>Nenhum cliente ativo</p>
          ) : (
            <ul className="space-y-0.5">
              {topClients.map((c, idx) => (
                <li key={c.id}>
                  <NavLink to="/clientes" onClick={onClose} className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/[0.04] cursor-pointer">
                    <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white', AVATAR_COLORS[idx % AVATAR_COLORS.length])}>
                      {initials(c.company)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{c.company}</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>
                        R$ {Math.round(toMonthlyRevenue(c) / 1000)}k/mês
                      </p>
                    </div>
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* System — functional nav links */}
        <div>
          <p className="px-2.5 mb-1.5 text-[9px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Sistema
          </p>
          <ul className="space-y-0.5">
            {systemItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink to={to} onClick={onClose}>
                  {({ isActive }) => (
                    <span
                      className={cn(
                        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer',
                        isActive ? 'bg-white text-black' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/80'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: isActive ? '#000' : 'rgba(255,255,255,0.35)' }} />
                      <span className="flex-1">{label}</span>
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* User footer */}
      <div className="shrink-0 p-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04] cursor-pointer">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            {userInitials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>{displayEmail}</p>
            <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.28)' }}>Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="h-6 w-6 shrink-0 flex items-center justify-center rounded-lg transition-colors hover:bg-red-500/20"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            title="Sair"
          >
            <LogOut className="h-3 w-3" />
          </button>
        </div>
      </div>
    </aside>
  )
}
