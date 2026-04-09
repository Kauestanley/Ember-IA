import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !key) {
  throw new Error('Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local')
}

export const supabase = createClient(url, key)

// ─── Types that match the database schema ───────────────────

export interface ClientRow {
  id: string
  name: string
  company: string
  email: string
  phone: string
  contract_type: 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'
  revenue: number
  team_size: number
  status: 'Ativo' | 'Inativo' | 'Churned' | 'Trial'
  segment: string
  start_date: string
  created_at: string
}

export interface KeyResultRow {
  id: string
  okr_id: string
  description: string
  current_value: number
  target_value: number
  unit: string
  created_at: string
}

export interface OKRRow {
  id: string
  objective: string
  owner: string
  quarter: string
  progress: number
  created_at: string
  key_results: KeyResultRow[]
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error'

export interface NotificationRow {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  created_at: string
}

export interface NewsPostRow {
  id: string
  author: string
  author_role: string
  author_initials: string
  author_color: string
  content: string
  category: 'Atualização' | 'Conquista' | 'Alerta' | 'Novidade' | 'Estratégia'
  likes: number
  comments: number
  pinned: boolean
  created_at: string
}
