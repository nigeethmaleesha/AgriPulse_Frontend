import { NavLink } from 'react-router-dom'
import {
  Activity, Boxes, ChevronLeft, ChevronRight, Factory, Gauge, GitBranch,
  LayoutDashboard, Leaf, Network, Route, Sprout, TestTube2, Waves
} from 'lucide-react'

const disabledModules = [
  { label: 'Collection Dispatch', icon: Route, code: 'M01' },
  { label: 'Resource Allocation', icon: Sprout, code: 'M02' },
  { label: 'Spoilage Intelligence', icon: Waves, code: 'M04' },
  { label: 'Factory Operations', icon: Factory, code: 'M05' },
]

const networkLinks = [
  { to: '/network', label: 'Flow Analysis', icon: Network },
  { to: '/network/bottlenecks', label: 'Bottlenecks', icon: Activity },
  { to: '/network/scenarios', label: 'Scenario Lab', icon: GitBranch },
  { to: '/network/graph', label: 'Graph Data', icon: Boxes },
  { to: '/network/benchmarks', label: 'Benchmarks', icon: TestTube2 },
]

function NavItem({ to, icon: Icon, children, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
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
        {!collapsed && <div className="ml-3 min-w-0"><div className="text-base font-extrabold tracking-tight">AgriPulse</div><div className="truncate text-[11px] font-medium text-white/55">Tea Supply Intelligence</div></div>}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Overview</div>}
        <NavItem to="/" icon={LayoutDashboard} collapsed={collapsed}>Decision Center</NavItem>

        <div className="mt-6">
          {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Integrated modules</div>}
          <div className="space-y-1">
            {disabledModules.slice(0, 2).map(({ label, icon: Icon, code }) => (
              <div key={label} title={`${label} — not connected in this frontend`} className="flex h-10 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/35">
                <Icon size={18} className="shrink-0" />
                {!collapsed && <><span className="min-w-0 flex-1 truncate">{label}</span><span className="font-mono text-[9px]">{code}</span></>}
              </div>
            ))}

            <div className={`my-2 rounded-2xl border border-white/10 bg-white/[.06] ${collapsed ? 'p-1.5' : 'p-2'}`}>
              {!collapsed && <div className="mb-1 flex items-center justify-between px-2 py-1.5"><span className="text-xs font-bold text-white">Network Capacity</span><span className="rounded bg-emerald-300/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-200">M03 LIVE</span></div>}
              <div className="space-y-1">{networkLinks.map((item) => <NavItem key={item.to} {...item} collapsed={collapsed}>{item.label}</NavItem>)}</div>
            </div>

            {disabledModules.slice(2).map(({ label, icon: Icon, code }) => (
              <div key={label} title={`${label} — not connected in this frontend`} className="flex h-10 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/35">
                <Icon size={18} className="shrink-0" />
                {!collapsed && <><span className="min-w-0 flex-1 truncate">{label}</span><span className="font-mono text-[9px]">{code}</span></>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {!collapsed && <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Evidence</div>}
          <div title="Module 3 benchmarks are available inside Benchmarks" className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-white/45"><Gauge size={18} />{!collapsed && <span>Algorithm Performance</span>}</div>
        </div>
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && <div className="mb-3 rounded-xl border border-white/10 bg-black/10 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-white/80"><span className="h-2 w-2 rounded-full bg-emerald-300" />Module 3 frontend</div><div className="mt-1 text-[10px] leading-4 text-white/45">Members 5 & 6 · Ford-Fulkerson + Bottleneck Analysis</div></div>}
        <button onClick={onToggle} className="flex h-9 w-full items-center justify-center rounded-xl bg-white/[.07] text-white/65 hover:bg-white/10 hover:text-white" aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
        </button>
      </div>
    </aside>
  )
}
