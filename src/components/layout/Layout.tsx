import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64 flex flex-1 flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto pt-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
