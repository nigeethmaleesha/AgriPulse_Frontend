import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'

const titles = {
  '/': 'Decision Center',
  '/network': 'Network Flow Analysis',
  '/network/bottlenecks': 'Bottleneck Analysis',
  '/network/scenarios': 'Capacity Scenario Lab',
  '/network/graph': 'Supply Graph Data',
  '/network/benchmarks': 'Algorithm Benchmarks',
}

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  return (
    <div className="min-h-screen bg-ivory">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`min-h-screen transition-[margin] duration-200 ${collapsed ? 'lg:ml-[78px]' : 'lg:ml-[264px]'}`}>
        <Topbar title={titles[pathname] || 'AgriPulse'} onMobileMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1650px] p-4 sm:p-6 xl:p-7">{children}</main>
      </div>
    </div>
  )
}
