import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase, type OKRRow, type KeyResultRow } from '@/lib/supabase'

export type KRFormData = Omit<KeyResultRow, 'id' | 'okr_id' | 'created_at'>
export interface OKRFormData {
  objective: string
  owner: string
  quarter: string
  progress: number
  key_results: KRFormData[]
}

async function notify(title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') {
  await supabase.from('notifications').insert([{ title, message, type, read: false }])
}

export function useOKRs() {
  const [okrs, setOkrs] = useState<OKRRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('okrs')
      .select('*, key_results(*)')
      .order('created_at', { ascending: true })
    if (error) {
      setError(error.message)
      toast.error('Erro ao carregar OKRs')
    } else {
      setOkrs(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createOKR(form: OKRFormData) {
    const { data: okr, error: okrErr } = await supabase
      .from('okrs')
      .insert([{ objective: form.objective, owner: form.owner, quarter: form.quarter, progress: form.progress }])
      .select()
      .single()
    if (okrErr || !okr) { toast.error('Erro ao criar OKR'); throw okrErr }

    if (form.key_results.length > 0) {
      const krs = form.key_results.map(kr => ({ ...kr, okr_id: okr.id }))
      const { error: krErr } = await supabase.from('key_results').insert(krs)
      if (krErr) { toast.error('Erro ao salvar Key Results'); throw krErr }
    }
    toast.success('OKR criado com sucesso!')
    await Promise.all([
      fetch(),
      notify(
        'Novo OKR criado',
        `"${form.objective}" foi adicionado para ${form.quarter} (${form.owner}).`,
        'success'
      ),
    ])
  }

  async function updateOKR(id: string, form: OKRFormData) {
    const { error: okrErr } = await supabase
      .from('okrs')
      .update({ objective: form.objective, owner: form.owner, quarter: form.quarter, progress: form.progress })
      .eq('id', id)
    if (okrErr) { toast.error('Erro ao atualizar OKR'); throw okrErr }

    // Replace key results: delete all then re-insert
    await supabase.from('key_results').delete().eq('okr_id', id)
    if (form.key_results.length > 0) {
      const krs = form.key_results.map(kr => ({ ...kr, okr_id: id }))
      const { error: krErr } = await supabase.from('key_results').insert(krs)
      if (krErr) { toast.error('Erro ao salvar Key Results'); throw krErr }
    }
    toast.success('OKR atualizado!')
    await Promise.all([
      fetch(),
      notify(
        'OKR atualizado',
        `"${form.objective}" foi atualizado — progresso: ${form.progress}%.`,
        'info'
      ),
    ])
  }

  async function deleteOKR(id: string) {
    const okr = okrs.find(o => o.id === id)
    // key_results deleted by cascade
    const { error } = await supabase.from('okrs').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir OKR'); throw error }
    toast.success('OKR removido')
    await Promise.all([
      fetch(),
      okr
        ? notify('OKR removido', `"${okr.objective}" foi excluído.`, 'warning')
        : Promise.resolve(),
    ])
  }

  return { okrs, loading, error, createOKR, updateOKR, deleteOKR, refresh: fetch }
}
