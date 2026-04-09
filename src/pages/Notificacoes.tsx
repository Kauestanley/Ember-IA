import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNotifications } from '@/hooks/useNotifications'
import { type NotificationType } from '@/lib/supabase'

const RED   = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

function typeIcon(type: NotificationType) {
  const cls = 'h-4 w-4 shrink-0'
  switch (type) {
    case 'success': return <CheckCircle   className={cls} style={{ color: GREEN }} />
    case 'warning': return <AlertTriangle className={cls} style={{ color: '#f59e0b' }} />
    case 'error':   return <AlertCircle   className={cls} style={{ color: RED }} />
    default:        return <Info          className={cls} style={{ color: 'rgba(255,255,255,0.5)' }} />
  }
}

function typeLabel(type: NotificationType) {
  switch (type) {
    case 'success': return { label: 'Sucesso',   bg: `${GREEN}20`, color: GREEN }
    case 'warning': return { label: 'Aviso',     bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' }
    case 'error':   return { label: 'Erro',      bg: `${RED}20`, color: RED }
    default:        return { label: 'Info',      bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
  }
}

function typeAccent(type: NotificationType): string {
  switch (type) {
    case 'success': return GREEN
    case 'warning': return '#f59e0b'
    case 'error':   return RED
    default:        return 'rgba(255,255,255,0.2)'
  }
}

export function Notificacoes() {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications()

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Central de Alertas · Supabase
          </p>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Notificações</h1>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors hover:bg-white/[0.07]"
              style={{ background: 'rgba(255,255,255,0.05)', border: CARD_B, color: 'rgba(255,255,255,0.6)', minHeight: '44px' }}
            >
              <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como lidas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold transition-colors"
              style={{ background: `${RED}15`, border: `1px solid ${RED}30`, color: RED, minHeight: '44px' }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar tudo
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total',     value: notifications.length, color: 'rgba(255,255,255,0.7)' },
          { label: 'Não lidas', value: unreadCount,          color: RED  },
          { label: 'Lidas',     value: notifications.length - unreadCount, color: GREEN },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: CARD, border: CARD_B }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {s.label}
            </p>
            <p className="text-[28px] font-black leading-none" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: CARD, border: CARD_B }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: RED }} />
            <span className="text-sm">Carregando notificações...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Bell className="h-7 w-7" style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p className="text-[14px] font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Nenhuma notificação
            </p>
            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              As notificações aparecerão aqui quando você adicionar ou editar clientes e OKRs
            </p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {notifications.map(n => {
              const { label, bg, color } = typeLabel(n.type)
              return (
                <li
                  key={n.id}
                  className="group relative flex gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                  style={{ borderLeft: `3px solid ${n.read ? 'transparent' : typeAccent(n.type)}` }}
                >
                  <div className="mt-0.5 shrink-0">{typeIcon(n.type)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <p className="text-[13px] font-semibold leading-snug flex-1"
                        style={{ color: n.read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.9)' }}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                          style={{ background: bg, color }}>
                          {label}
                        </span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: RED }} />
                        )}
                      </div>
                    </div>

                    <p className="text-[12px] leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {n.message}
                    </p>

                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.08]"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                        title="Marcar como lida"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                      title="Remover"
                      onMouseEnter={e => { e.currentTarget.style.color = RED }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
