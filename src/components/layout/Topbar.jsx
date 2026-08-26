import { Menu, RefreshCw, Server, Wifi, WifiOff } from 'lucide-react'
import { useNetwork } from '../../context/NetworkContext'

export function Topbar({ title, onMobileMenu }) {
  const { apiOnline, loading, lastUpdated, refreshGraph } = useNetwork()
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-tea-950/10 bg-ivory/92 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button className="rounded-xl border border-tea-950/10 bg-white p-2 text-tea-900 lg:hidden" onClick={onMobileMenu}><Menu size={19} /></button>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[.16em] text-tea-700">AgriPulse / Tea Supply Network</div>
          <h1 className="truncate text-lg font-extrabold tracking-tight text-graphite sm:text-xl">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`hidden items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold sm:flex ${loading ? 'border-stone-200 bg-white text-muted' : apiOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {loading ? <Server size={15} /> : apiOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
          {loading ? 'Checking system' : apiOnline ? 'System connected' : 'System offline'}
        </div>
        <button onClick={() => refreshGraph().catch(() => undefined)} className="rounded-xl border border-tea-950/10 bg-white p-2.5 text-muted transition hover:text-tea-900" title={lastUpdated ? `Last data refresh: ${lastUpdated.toLocaleTimeString()}` : 'Refresh network data'}><RefreshCw size={17} /></button>
      </div>
    </header>
  )
}
