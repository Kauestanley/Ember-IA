import { useState } from 'react'
import { User, Mail, Key, Save, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const RED   = '#ef4444'
const GREEN  = '#22c55e'
const CARD   = '#141414'
const CARD_B = '1px solid rgba(255,255,255,0.07)'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-colors disabled:opacity-40"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.85)',
        minHeight: '44px',
      }}
      onFocus={e => { e.currentTarget.style.borderColor = `${RED}60` }}
      onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
    />
  )
}

export function Configuracoes() {
  const { user } = useAuth()

  const currentEmail    = user?.email ?? ''
  const currentName     = (user?.user_metadata?.full_name as string) ?? ''

  const [displayName, setDisplayName]       = useState(currentName)
  const [newEmail,    setNewEmail]           = useState('')
  const [currentPwd,  setCurrentPwd]        = useState('')
  const [newPwd,      setNewPwd]            = useState('')
  const [confirmPwd,  setConfirmPwd]        = useState('')
  const [savingProfile, setSavingProfile]   = useState(false)
  const [savingPwd,     setSavingPwd]       = useState(false)
  const [profileSaved,  setProfileSaved]    = useState(false)

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updates: Record<string, unknown> = {
        data: { full_name: displayName },
      }
      if (newEmail && newEmail !== currentEmail) {
        updates.email = newEmail
      }
      const { error } = await supabase.auth.updateUser(updates as Parameters<typeof supabase.auth.updateUser>[0])
      if (error) throw error
      toast.success('Perfil atualizado!')
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
      setNewEmail('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      toast.error(msg)
    } finally {
      setSavingProfile(false)
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { toast.error('As senhas não coincidem'); return }
    if (newPwd.length < 6)    { toast.error('A senha deve ter pelo menos 6 caracteres'); return }
    setSavingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      toast.success('Senha alterada com sucesso!')
      setCurrentPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha'
      toast.error(msg)
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-2xl">

      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-1"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Conta e Preferências
        </p>
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Configurações</h1>
      </div>

      {/* Profile */}
      <div className="rounded-2xl p-5 md:p-6" style={{ background: CARD, border: CARD_B }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <User className="h-4 w-4" style={{ color: RED }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/85">Informações do Perfil</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Nome de exibição e endereço de email</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          {/* Current email — read only */}
          <Field label="Email atual">
            <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', minHeight: '44px' }}>
              <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
              {currentEmail}
            </div>
          </Field>

          <Field label="Nome de exibição">
            <TextInput
              value={displayName}
              onChange={setDisplayName}
              placeholder="Seu nome completo"
            />
          </Field>

          <Field label="Novo email (opcional)">
            <TextInput
              type="email"
              value={newEmail}
              onChange={setNewEmail}
              placeholder={`Deixe em branco para manter ${currentEmail}`}
            />
          </Field>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: profileSaved ? GREEN : RED, boxShadow: `0 4px 14px ${profileSaved ? GREEN : RED}40`, minHeight: '44px' }}
            >
              {savingProfile
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...</>
                : profileSaved
                ? <><CheckCircle className="h-3.5 w-3.5" /> Salvo!</>
                : <><Save className="h-3.5 w-3.5" /> Salvar perfil</>}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="rounded-2xl p-5 md:p-6" style={{ background: CARD, border: CARD_B }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: 'rgba(239,68,68,0.15)' }}>
            <Key className="h-4 w-4" style={{ color: RED }} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white/85">Alterar Senha</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Defina uma nova senha de acesso</p>
          </div>
        </div>

        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Senha atual (não obrigatório via magic link)">
            <TextInput
              type="password"
              value={currentPwd}
              onChange={setCurrentPwd}
              placeholder="••••••••"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nova senha">
              <TextInput
                type="password"
                value={newPwd}
                onChange={setNewPwd}
                placeholder="Mín. 6 caracteres"
              />
            </Field>
            <Field label="Confirmar nova senha">
              <TextInput
                type="password"
                value={confirmPwd}
                onChange={setConfirmPwd}
                placeholder="Repita a nova senha"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPwd || !newPwd}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: RED, boxShadow: `0 4px 14px ${RED}40`, minHeight: '44px' }}
            >
              {savingPwd
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Alterando...</>
                : <><Key className="h-3.5 w-3.5" /> Alterar senha</>}
            </button>
          </div>
        </form>
      </div>

      {/* Info card */}
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: CARD_B }}>
        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Alterações de email exigem confirmação no novo endereço.
          Dados de autenticação são gerenciados pelo Supabase Auth.
        </p>
      </div>
    </div>
  )
}
