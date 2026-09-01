import { Leaf, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navigationGroups } from '../../config/navigation'

export function MobileNav({ open, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[90] bg-tea-950/55 backdrop-blur-sm lg:hidden" onClick={onClose}>
      <aside className="sidebar-panel h-full w-[min(88vw,330px)] overflow-y-auto p-4 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between border-b border-white/[.08] pb-4">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-tea-950"><Leaf size={21} /></div><div><div className="font-extrabold">AgriPulse</div><div className="text-[10px] font-semibold uppercase tracking-[.14em] text-white/42">Operations Suite</div></div></div>
          <button className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/10 hover:text-white" onClick={onClose} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="space-y-5">{navigationGroups.map((group) => <div key={group.label}><div className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[.18em] text-white/32">{group.label}</div><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; return <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-white text-tea-950' : 'text-white/68 hover:bg-white/10 hover:text-white'}`}><Icon size={17} />{item.label}</NavLink> })}</div></div>)}</div>
      </aside>
    </div>
  )
}
