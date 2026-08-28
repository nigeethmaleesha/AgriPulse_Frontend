import { NavLink } from 'react-router-dom'
import {
  Activity, Boxes, Calculator, ChevronLeft, ChevronRight, Gauge, GitBranch,
  LayoutDashboard, Leaf, ListOrdered, Network, ShieldAlert, TestTube2, ThermometerSun, Truck
} from 'lucide-react'

const networkLinks = [
  { to: '/network', label: 'Daily Throughput', icon: Network },
  { to: '/network/bottlenecks', label: 'Critical Connections', icon: Activity },
  { to: '/network/scenarios', label: 'What-If Planning', icon: GitBranch },
  { to: '/network/graph', label: 'Network Setup', icon: Boxes },
  { to: '/network/benchmarks', label: 'System Performance', icon: TestTube2 },
]

const spoilageLinks = [
  { to: '/spoilage', label: 'Risk Ranking', icon: ThermometerSun },
  { to: '/spoilage/priority', label: 'Live Priority Queue', icon: ListOrdered },
  { to: '/spoilage/benchmarks', label: 'Algorithm Comparison', icon: TestTube2 },
]

const dispatchLinks = [
  { to: '/dispatch', label: 'Live Dispatch Center', icon: Truck },
  { to: '/dispatch/calculator', label: 'Route Playground', icon: Calculator },
  { to: '/dispatch/roads', label: 'Road Hazard Control', icon: ShieldAlert },
]

function NavItem({ to, icon: Icon, children, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/' || to === '/network' || to === '/spoilage' || to === '/dispatch'}
      className={({ isActive }) => `group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition ${isActive ? 'bg-white text-tea-950 shadow-sm' : 'text-white/72 hover:bg-white/8 hover:text-white'}`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{children}</span>}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`topographic fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/8 text-white transition-all duration-200 lg:flex ${collapsed ? 'w-[78px]' : 'w-[264px]'}`}>
      <div className={`flex h-[76px] items-center border-b border-white/10 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10">
          <Leaf size={21} strokeWidth={2.2} />
        </div>
        {!collapsed && <div className="ml-3 min-w-0"><div className="text-base font-extrabold tracking-tight">AgriPulse</div><div className="truncate text-[11px] font-medium text-white/55">Tea Supply Operations</div></div>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Operations</div>}
        <NavItem to="/" icon={LayoutDashboard} collapsed={collapsed}>Operations Overview</NavItem>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.06] p-2">
          {!collapsed && <div className="mb-1 flex items-center justify-between px-2 py-1.5"><span className="text-xs font-bold text-white">Dispatch & Route Engine</span><span className="rounded bg-amber-300/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">PORT 8082 · LIVE</span></div>}
          <div className="space-y-1">{dispatchLinks.map((item) => <NavItem key={item.to} {...item} collapsed={collapsed}>{item.label}</NavItem>)}</div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.06] p-2">
          {!collapsed && <div className="mb-1 flex items-center justify-between px-2 py-1.5"><span className="text-xs font-bold text-white">Tea Supply Network</span><span className="rounded bg-emerald-300/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">M03 · LIVE</span></div>}
          <div className="space-y-1">{networkLinks.map((item) => <NavItem key={item.to} {...item} collapsed={collapsed}>{item.label}</NavItem>)}</div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.06] p-2">
          {!collapsed && <div className="mb-1 flex items-center justify-between px-2 py-1.5"><span className="text-xs font-bold text-white">Spoilage Intelligence</span><span className="rounded bg-emerald-300/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">M04 · LIVE</span></div>}
          <div className="space-y-1">{spoilageLinks.map((item) => <NavItem key={item.to} {...item} collapsed={collapsed}>{item.label}</NavItem>)}</div>
        </div>

        <div className="mt-6">
          {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Status</div>}
          <div className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/55"><Gauge size={18} />{!collapsed && <span>Decision modules active</span>}</div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && <div className="mb-3 rounded-xl border border-white/10 bg-black/10 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-white/80"><span className="h-2 w-2 rounded-full bg-emerald-300" />All 3 Modules Connected</div><div className="mt-1 text-[10px] leading-4 text-white/45">Module 3 (8080), Module 4 (8081), and Dispatch Engine (8082) connected.</div></div>}
        <button onClick={onToggle} className="flex h-9 w-full items-center justify-center rounded-xl bg-white/[.07] text-white/65 hover:bg-white/10 hover:text-white" aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </aside>
  )
}

