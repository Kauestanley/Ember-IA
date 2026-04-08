import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import { Clientes } from '@/pages/Clientes'
import { OKRs } from '@/pages/OKRs'
import { Newsletter } from '@/pages/Newsletter'
import { Vendas } from '@/pages/Vendas'

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/vendas" replace />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="okrs" element={<OKRs />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="vendas" element={<Vendas />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
