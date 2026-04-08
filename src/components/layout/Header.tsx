import { Bell, Search, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user } = useAuth()

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??'
  const displayName = user?.email?.split('@')[0] ?? 'Usuário'

  return (
    <header className="fixed top-0 left-64 right-0 z-40 flex h-16 items-center justify-between border-b border-white/[0.06] bg-[hsl(224,71%,4%)]/90 px-8 backdrop-blur-md">
      {/* Left: live pulse */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs text-muted-foreground font-medium">Sistema operacional</span>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
        >
          <Search className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[hsl(224,71%,4%)]" />
        </Button>

        <div className="ml-2 h-5 w-px bg-white/[0.08]" />

        <button className="ml-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.06] transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/30">
            {initials}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-foreground leading-none mb-0.5 capitalize">{displayName}</p>
            <p className="text-[10px] text-muted-foreground leading-none">Admin</p>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}
