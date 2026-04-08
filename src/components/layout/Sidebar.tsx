import { NavLink } from 'react-router-dom'
import {
  Users,
  Target,
  Newspaper,
  TrendingUp,
  Zap,
  BarChart3,
  Settings,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/okrs', icon: Target, label: 'OKRs' },
  { to: '/newsletter', icon: Newspaper, label: 'Newsletter', badge: '3' },
  { to: '/vendas', icon: TrendingUp, label: 'Vendas' },
]

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-foreground">AI Agency</p>
          <p className="text-xs text-muted-foreground">Dashboard Interno</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
        <div className="px-3 pb-2">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Principal
          </p>
        </div>
        <ul className="space-y-0.5 px-3">
          {navItems.map(({ to, icon: Icon, label, badge }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    {badge && (
                      <Badge variant="info" className="h-5 px-1.5 text-[10px]">
                        {badge}
                      </Badge>
                    )}
                    {isActive && (
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 px-3 pb-2">
          <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sistema
          </p>
        </div>
        <ul className="space-y-0.5 px-3">
          {[
            { icon: BarChart3, label: 'Relatórios' },
            { icon: Bell, label: 'Notificações' },
            { icon: Settings, label: 'Configurações' },
          ].map(({ icon: Icon, label }) => (
            <li key={label}>
              <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground">
                <Icon className="h-4 w-4 shrink-0 transition-colors group-hover:text-foreground" />
                <span className="flex-1 text-left">{label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
            FB
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Felipe Barros</p>
            <p className="truncate text-xs text-muted-foreground">CEO & Founder</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-emerald-400" title="Online" />
        </div>
      </div>
    </aside>
  )
}
