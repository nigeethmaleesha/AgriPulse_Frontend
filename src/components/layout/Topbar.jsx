import { Bell, Menu, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useNetwork } from '../../context/NetworkContext'
import { useSpoilage } from '../../context/SpoilageContext'

export function Topbar({ page, onMobileMenu }) {
  const { pathname } = useLocation()
  const network = useNetwork()
  const spoilage = useSpoilage()
  const isSpoilage = pathname.startsWith('/spoilage')
  const isScheduling = pathname.startsWith('/scheduling')
  const current = isSpoilage ? spoilage : network
  const refresh = isSpoilage ? spoilage.refreshStatus : network.refreshGraph

  return (
    <header className="sticky top-0 z-30 flex h-[84px] items-center justify-between border-b border-slate-200/80 bg-[#f8faf9]/90 px-4 backdrop-blur-xl sm:px-6 xl:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-xl border border-slate-200 bg-white p-2.5 text-tea-900 shadow-sm lg:hidden" onClick={onMobileMenu} aria-label="Open navigation"><Menu size={19} /></button>
        <div className="min-w-0"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.15em] text-tea-700"><span>AgriPulse</span><span className="text-slate-300">/</span><span className="truncate text-muted">{page.section}</span></div><h1 className="mt-0.5 truncate text-xl font-extrabold tracking-[-.025em] text-slate-900 sm:text-[22px]">{page.title}</h1></div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isScheduling ? <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 sm:flex"><Wifi size={14} /> Workspace ready</div> : <><div className={`hidden items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold sm:flex ${current.loading ? 'border-slate-200 bg-white text-muted' : current.apiOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>{current.loading ? <Server size={14} /> : current.apiOnline ? <Wifi size={14} /> : <WifiOff size={14} />}{current.loading ? 'Checking services' : current.apiOnline ? 'Live data connected' : 'Service unavailable'}</div><button onClick={() => refresh().catch(() => undefined)} className="icon-button" title="Refresh live data"><RefreshCw size={17} /></button></>}
        <button className="icon-button hidden sm:inline-flex" aria-label="Notifications"><Bell size={17} /></button>
        <div className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-tea-950 text-xs font-extrabold text-white shadow-sm" title="Operations user">AP</div>
      </div>
    </header>
  )
}
