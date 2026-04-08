import { NavLink, useNavigate } from 'react-router-dom'
import {
  Users,
  Target,
  Newspaper,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
  { to: '/vendas', icon: TrendingUp, label: 'Vendas' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/okrs', icon: Target, label: 'OKRs' },
  { to: '/newsletter', icon: Newspaper, label: 'Newsletter', badge: '3' },
]

const systemItems = [
  { icon: BarChart3, label: 'Relatórios' },
  { icon: Bell, label: 'Notificações' },
  { icon: Settings, label: 'Configurações' },
]

export function Sidebar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'
  const displayEmail = user?.email ?? ''

  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col"
      style={{ background: 'hsl(222,60%,3%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div
        className="flex h-16 shrink-0 items-center gap-3 px-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
          <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} style={{ height: '18px', width: '18px' }} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-white">AI Agency</p>
          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Dashboard Interno</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 scrollbar-thin">
        {/* Main section */}
        <p
          className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Principal
        </p>
        <ul className="space-y-0.5 mb-8">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'hover:bg-white/[0.06]'
                  )
                }
                style={({ isActive }) => ({
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                  boxShadow: isActive ? '0 4px 20px rgba(99,102,241,0.3)' : undefined,
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className="h-4 w-4 shrink-0 transition-colors"
                      style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.4)' }}
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <span
                        className={cn(
                          'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-indigo-500/15 text-indigo-400'
                        )}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* System section */}
        <p
          className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Sistema
        </p>
        <ul className="space-y-0.5">
          {systemItems.map(({ icon: Icon, label }) => (
            <li key={label}>
              <button
                className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-white/[0.06]"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                <Icon
                  className="h-4 w-4 shrink-0 transition-colors"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                />
                <span className="flex-1 text-left">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User footer */}
      <div
        className="shrink-0 p-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-white/[0.04] cursor-pointer group"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-md shadow-indigo-500/20">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
              {displayEmail}
            </p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Membro da equipe
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7 shrink-0 hover:bg-transparent hover:text-rose-400 transition-colors"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
