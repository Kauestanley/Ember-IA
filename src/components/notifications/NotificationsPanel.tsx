import { useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type NotificationRow, type NotificationType } from '@/lib/supabase'

const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'
const RED    = '#ef4444'
const GREEN  = '#22c55e'

function typeIcon(type: NotificationType) {
  const cls = 'h-3.5 w-3.5 shrink-0'
  switch (type) {
    case 'success': return <CheckCircle  className={cls} style={{ color: GREEN }} />
    case 'warning': return <AlertTriangle className={cls} style={{ color: '#f59e0b' }} />
    case 'error':   return <AlertCircle  className={cls} style={{ color: RED }} />
    default:        return <Info         className={cls} style={{ color: 'rgba(255,255,255,0.5)' }} />
  }
}

function typeAccent(type: NotificationType): string {
  switch (type) {
    case 'success': return GREEN
    case 'warning': return '#f59e0b'
    case 'error':   return RED
    default:        return 'rgba(255,255,255,0.25)'
  }
}

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  notifications: NotificationRow[]
  loading: boolean
  unreadCount: number
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  loading,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
}: NotificationsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="absolute top-14 right-2 z-50 flex flex-col rounded-2xl shadow-2xl"
      style={{
        width: 'min(380px, calc(100vw - 16px))',
        maxHeight: 'calc(100vh - 80px)',
        background: CARD,
        border: CARD_B,
        boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: CARD_B }}>
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.5)' }} />
          <span className="text-[13px] font-bold text-white/85">Notificações</span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
              style={{ background: `${RED}25`, color: RED }}>
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-white/[0.06]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              title="Marcar todas como lidas"
            >
              <CheckCheck className="h-3 w-3" /> Ler todas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-white/[0.06]"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              title="Limpar todas"
            >
              <Trash2 className="h-3 w-3" /> Limpar
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Carregando...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Bell className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.2)' }} />
            </div>
            <p className="text-[13px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Sem notificações</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Você será notificado quando algo acontecer
            </p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {notifications.map(n => (
              <li
                key={n.id}
                className="group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-white/[0.02]"
                style={{ borderLeft: `2px solid ${n.read ? 'transparent' : typeAccent(n.type)}` }}
              >
                <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] font-semibold leading-snug" style={{ color: n.read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)' }}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: RED }} />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {n.message}
                  </p>
                  <p className="mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.read && (
                    <button
                      onClick={() => onMarkAsRead(n.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/[0.08]"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      title="Marcar como lida"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(n.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-500/10"
                    style={{ color: 'rgba(255,255,255,0.25)' }}
                    title="Remover"
                    onMouseEnter={e => { e.currentTarget.style.color = RED }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
