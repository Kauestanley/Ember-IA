import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { Login } from '@/pages/Login'
import { Clientes } from '@/pages/Clientes'
import { OKRs } from '@/pages/OKRs'
import { Newsletter } from '@/pages/Newsletter'
import { Vendas } from '@/pages/Vendas'
import { Notificacoes } from '@/pages/Notificacoes'
import { Configuracoes } from '@/pages/Configuracoes'
import { Relatorios } from '@/pages/Relatorios'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'hsl(224 71.4% 6%)',
              border: '1px solid hsl(215 27.9% 16.9%)',
              color: 'hsl(210 20% 98%)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/vendas" replace />} />
              <Route path="vendas"       element={<Vendas />} />
              <Route path="clientes"     element={<Clientes />} />
              <Route path="okrs"         element={<OKRs />} />
              <Route path="newsletter"   element={<Newsletter />} />
              <Route path="notificacoes" element={<Notificacoes />} />
              <Route path="configuracoes" element={<Configuracoes />} />
              <Route path="relatorios"   element={<Relatorios />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/vendas" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
