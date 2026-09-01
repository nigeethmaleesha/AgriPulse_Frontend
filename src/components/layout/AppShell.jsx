import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { routeMeta } from '../../config/navigation'

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const page = routeMeta[pathname] || { title: 'AgriPulse', section: 'Operations workspace' }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-graphite">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`min-h-screen transition-[margin] duration-300 ease-out ${collapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}>
        <Topbar page={page} onMobileMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1720px] px-4 pb-10 pt-5 sm:px-6 sm:pt-6 xl:px-8">{children}</main>
      </div>
    </div>
  )
}
