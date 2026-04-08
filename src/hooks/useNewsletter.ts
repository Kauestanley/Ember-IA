import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { supabase, type NewsPostRow } from '@/lib/supabase'

export type PostFormData = Omit<NewsPostRow, 'id' | 'created_at' | 'likes' | 'comments'>

export function useNewsletter() {
  const [posts, setPosts] = useState<NewsPostRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('newsletter_posts')
      .select('*')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      toast.error('Erro ao carregar newsletter')
    } else {
      setPosts(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createPost(form: PostFormData) {
    const { error } = await supabase
      .from('newsletter_posts')
      .insert([{ ...form, likes: 0, comments: 0 }])
    if (error) { toast.error('Erro ao publicar'); throw error }
    toast.success('Publicado com sucesso!')
    await fetch()
  }

  async function updatePost(id: string, form: Partial<PostFormData>) {
    const { error } = await supabase.from('newsletter_posts').update(form).eq('id', id)
    if (error) { toast.error('Erro ao atualizar post'); throw error }
    toast.success('Post atualizado!')
    await fetch()
  }

  async function deletePost(id: string) {
    const { error } = await supabase.from('newsletter_posts').delete().eq('id', id)
    if (error) { toast.error('Erro ao excluir post'); throw error }
    toast.success('Post removido')
    await fetch()
  }

  async function likePost(id: string, currentLikes: number) {
    await supabase.from('newsletter_posts').update({ likes: currentLikes + 1 }).eq('id', id)
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  async function togglePin(id: string, pinned: boolean) {
    const { error } = await supabase.from('newsletter_posts').update({ pinned: !pinned }).eq('id', id)
    if (error) { toast.error('Erro ao fixar post'); return }
    await fetch()
  }

  return { posts, loading, error, createPost, updatePost, deletePost, likePost, togglePin, refresh: fetch }
}
