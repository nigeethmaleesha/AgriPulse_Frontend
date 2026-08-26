import { X } from 'lucide-react'
import { Link } from 'react-router-dom'

export function MobileNav({ open, onClose }) {
  if (!open) return null
  const links = [
    ['/', 'Decision Center'], ['/network', 'Flow Analysis'], ['/network/bottlenecks', 'Bottlenecks'], ['/network/scenarios', 'Scenario Lab'], ['/network/graph', 'Graph Data'], ['/network/benchmarks', 'Benchmarks']
  ]
  return <div className="fixed inset-0 z-[90] bg-tea-950/40 backdrop-blur-sm lg:hidden" onClick={onClose}><div className="topographic h-full w-[290px] p-4 text-white" onClick={(e) => e.stopPropagation()}><div className="mb-6 flex items-center justify-between"><div><div className="font-extrabold">AgriPulse</div><div className="text-xs text-white/55">Module 3 frontend</div></div><button className="rounded-lg p-2 hover:bg-white/10" onClick={onClose}><X size={18} /></button></div><div className="space-y-1">{links.map(([to,label]) => <Link key={to} to={to} onClick={onClose} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">{label}</Link>)}</div><div className="mt-8 border-t border-white/10 pt-4 text-xs leading-6 text-white/40">Modules 1, 2, 4 and 5 are shown in the dashboard only and intentionally have no frontend API integration yet.</div></div></div>
}
