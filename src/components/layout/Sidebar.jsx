import { NavLink } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Leaf, ShieldCheck } from 'lucide-react'
import { navigationGroups } from '../../config/navigation'

function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => `relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-all duration-200 ${isActive ? 'bg-white text-tea-950 shadow-[0_8px_24px_rgba(3,26,20,.16)]' : 'text-white/66 hover:bg-white/[.08] hover:text-white'} ${collapsed ? 'justify-center' : ''}`}
    >
      {({ isActive }) => <><Icon size={18} strokeWidth={isActive ? 2.4 : 2} className="shrink-0" />{!collapsed && <span className="truncate">{item.label}</span>}{isActive && !collapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}</>}
    </NavLink>
  )
}

export function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar-panel fixed inset-y-0 left-0 z-40 hidden flex-col text-white transition-all duration-300 ease-out lg:flex ${collapsed ? 'w-[88px]' : 'w-[280px]'}`}>
      <div className={`flex h-[84px] items-center border-b border-white/[.08] ${collapsed ? 'justify-center px-3' : 'px-5'}`}>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-emerald-400 text-tea-950 shadow-[0_8px_20px_rgba(52,211,153,.22)]"><Leaf size={23} strokeWidth={2.4} /></div>
        {!collapsed && <div className="ml-3 min-w-0"><div className="text-[17px] font-extrabold tracking-[-.02em]">AgriPulse</div><div className="truncate text-[10px] font-semibold uppercase tracking-[.16em] text-white/42">Operations Suite</div></div>}
      </div>

      <nav className="sidebar-scroll flex-1 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group, index) => <div key={group.label} className={index ? 'mt-5' : ''}>{!collapsed && <div className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[.19em] text-white/32">{group.label}</div>}<div className="space-y-1">{group.items.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}</div></div>)}
      </nav>

      <div className="border-t border-white/[.08] p-3">
        {!collapsed && <div className="mb-3 rounded-2xl border border-emerald-300/10 bg-emerald-300/[.06] p-3.5"><div className="flex items-center gap-2 text-xs font-bold text-emerald-100"><ShieldCheck size={15} /> Integrated workspace</div><p className="mt-1.5 text-[10px] leading-4 text-white/42">Five operational services connected through one unified dashboard.</p></div>}
        <button onClick={onToggle} className="flex h-10 w-full items-center justify-center rounded-xl border border-white/[.08] bg-white/[.05] text-white/55 transition hover:bg-white/[.1] hover:text-white" aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button>
      </div>
    </aside>
  )
}
