import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase, type ClientRow } from '@/lib/supabase'

export type ClientFormData = Omit<ClientRow, 'id' | 'created_at'>

export function useClientes() {
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      toast.error('Erro ao carregar clientes')
    } else {
      setClients(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createClient(form: ClientFormData) {
    const { error } = await supabase.from('clients').insert([form])
    if (error) { toast.error('Erro ao criar cliente'); throw error }
    toast.success('Cliente criado com sucesso!')
    await fetch()
  }

  async function updateClient(id: string, form: ClientFormData) {
    const { error } = await supabase.from('clients').update(form).eq('id', id)
    if (error) { toast.error('Erro ao atualizar cliente'); throw error }
    toast.success('Cliente atualizado!')
    await fetch()
  }

  async function deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir cliente'); throw error }
    toast.success('Cliente removido')
    await fetch()
  }

  return { clients, loading, error, createClient, updateClient, deleteClient, refresh: fetch }
}
