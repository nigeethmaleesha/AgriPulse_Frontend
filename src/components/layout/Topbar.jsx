import { Menu, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useNetwork } from '../../context/NetworkContext'
import { useSpoilage } from '../../context/SpoilageContext'

export function Topbar({ title, onMobileMenu }) {
  const { pathname } = useLocation()
  const network = useNetwork()
  const spoilage = useSpoilage()
  const isSpoilage = pathname.startsWith('/spoilage')
  const isScheduling = pathname.startsWith('/scheduling')
  const current = isSpoilage ? spoilage : network
  const refresh = isSpoilage ? spoilage.refreshStatus : network.refreshGraph
  const breadcrumb = isScheduling ? 'AgriPulse / Factory Processing' : isSpoilage ? 'AgriPulse / Spoilage Intelligence' : 'AgriPulse / Tea Supply Network'

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-tea-950/10 bg-ivory/92 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-xl border border-tea-950/10 bg-white p-2 text-tea-900 lg:hidden" onClick={onMobileMenu}><Menu size={19} /></button>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[.16em] text-tea-700">{breadcrumb}</div>
          <h1 className="truncate text-lg font-extrabold tracking-tight text-graphite sm:text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        {isScheduling ? (
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 sm:flex"><Wifi size={15} /> Session workspace ready</div>
        ) : (
          <>
            <div className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:flex ${current.loading ? 'border-stone-200 bg-white text-muted' : current.apiOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {current.loading ? <Server size={15} /> : current.apiOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
              {current.loading ? 'Checking system' : current.apiOnline ? 'System connected' : 'System offline'}
            </div>
            <button onClick={() => refresh().catch(() => undefined)} className="rounded-xl border border-tea-950/10 bg-white p-2.5 text-muted transition hover:text-tea-900" title={current.lastUpdated ? `Last data refresh: ${current.lastUpdated.toLocaleTimeString()}` : isSpoilage ? 'Refresh Module 4 status' : 'Refresh network data'}><RefreshCw size={17} /></button>
          </>
        )}
      </div>
    </header>
  )
}
