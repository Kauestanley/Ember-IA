import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Label } from '@/components/ui/label'

export function Login() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : error.message)
      setLoading(false)
      return
    }
    navigate('/vendas', { replace: true })
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ background: '#0a0a0a' }}
    >
      <div className="w-full max-w-sm space-y-8">

        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: '#ef4444', boxShadow: '0 8px 24px rgba(239,68,68,0.4)' }}
          >
            <Zap className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight text-white">Ember IA</h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Dashboard Interno</p>
          </div>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6 space-y-5"
          style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <h2 className="text-[16px] font-bold text-white">Entrar</h2>
            <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Acesso restrito a membros da equipe</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Email
              </Label>
              <input
                id="email"
                type="email"
                placeholder="voce@emberia.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[12px] font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                Senha
              </Label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors disabled:opacity-50"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.9)',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)')}
                onBlur={e  => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </div>

            {error && (
              <p
                className="rounded-xl px-3.5 py-2.5 text-[12px] font-medium"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-2.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: '#ef4444', boxShadow: '0 4px 18px rgba(239,68,68,0.35)', marginTop: '4px' }}
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
