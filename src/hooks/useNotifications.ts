import { useState, useEffect, useCallback } from 'react'
import { supabase, type NotificationRow, type NotificationType } from '@/lib/supabase'

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()

    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        fetch()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  async function createNotification(title: string, message: string, type: NotificationType = 'info') {
    await supabase.from('notifications').insert([{ title, message, type, read: false }])
    // real-time subscription will trigger a re-fetch
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('read', false)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  async function clearAll() {
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    loading,
    unreadCount,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh: fetch,
  }
}
