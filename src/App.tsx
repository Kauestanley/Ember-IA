import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Clientes } from '@/pages/Clientes'
import { OKRs } from '@/pages/OKRs'
import { Newsletter } from '@/pages/Newsletter'
import { Vendas } from '@/pages/Vendas'

export default function App() {
  return (
    <BrowserRouter>
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
