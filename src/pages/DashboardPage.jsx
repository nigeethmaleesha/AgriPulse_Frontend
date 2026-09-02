import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity, ArrowRight, Boxes, CalendarClock, CheckCircle2, Droplets, GitBranch,
  ShieldAlert, Sparkles, Sprout, ThermometerSun, Truck,
} from 'lucide-react'
import { networkApi } from '../api/networkApi'
import { apiErrorMessage } from '../api/client'
import { useNetwork } from '../context/NetworkContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { MetricTile } from '../components/ui/MetricTile'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { ErrorState, LoadingState } from '../components/ui/Feedback'
import { NetworkGraph } from '../components/network/NetworkGraph'

const workspaces = [
  { title: 'Fertilizer Planning', description: 'Allocate available fertilizer stock to the farms that deliver the strongest operational benefit.', to: '/fertilizer', icon: Sprout, tone: 'emerald' },
  { title: 'Irrigation Planning', description: 'Prioritize limited irrigation pumps using current farm need, land size, and urgency.', to: '/pumps', icon: Droplets, tone: 'sky' },
  { title: 'Dispatch Control', description: 'Coordinate urgent tea collection using live batch priorities and road conditions.', to: '/dispatch', icon: Truck, tone: 'amber' },
  { title: 'Supply Flow Monitoring', description: 'Track daily farm-to-factory capacity and identify connections that need attention.', to: '/network', icon: Activity, tone: 'emerald' },
  { title: 'Quality Protection', description: 'Review spoilage risk and move the most time-sensitive harvest batches first.', to: '/spoilage', icon: ThermometerSun, tone: 'rose' },
  { title: 'Factory Shift Planning', description: 'Create practical worker and machine schedules for the current production workload.', to: '/scheduling', icon: CalendarClock, tone: 'violet' },
]

const toneClasses = {
  emerald: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
  sky: 'bg-sky-50 text-sky-700 ring-sky-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
}

export default function DashboardPage() {
  const { graph, loading, error, refreshGraph, apiOnline } = useNetwork()
  const [recent, setRecent] = useState([])
  const [recentError, setRecentError] = useState('')

  useEffect(() => {
    if (!apiOnline) return
    networkApi.getMaxFlowResults().then((data) => { setRecent(data || []); setRecentError('') }).catch((err) => setRecentError(apiErrorMessage(err)))
  }, [apiOnline])

  const activeEdges = graph.edges.filter((edge) => edge.active)
  const activeNodes = graph.nodes.filter((node) => node.active)
  const latest = recent.find((item) => { const name = String(item.algorithm || '').toLowerCase(); return name.includes('ford') || name.includes('max flow') || name.includes('synthetic') }) || recent[0]

  return (
    <div className="page-enter">
      <section className="topographic relative mb-6 overflow-hidden rounded-[28px] border border-white/10 px-6 py-8 text-white shadow-lift sm:px-8 sm:py-10 xl:px-10">
        <div className="relative z-10 grid items-end gap-8 xl:grid-cols-[1.3fr_.7fr]">
          <div className="max-w-3xl">
            <div className="mb-4 flex flex-wrap items-center gap-2"><Badge className="!bg-white/10 !text-white !ring-white/10">Integrated tea operations</Badge><Badge className="!bg-emerald-300/15 !text-emerald-100 !ring-emerald-300/10">Live workspace</Badge></div>
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-[-.04em] sm:text-4xl xl:text-[44px] xl:leading-[1.08]">One clear view of your entire tea supply operation.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 sm:text-[15px]">Plan resources, coordinate collection, protect harvest quality, monitor transport capacity, and organize factory work from one connected workspace.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link to="/dispatch"><Button className="!bg-white !text-tea-950 hover:!bg-emerald-50">Open Dispatch Control <ArrowRight size={16} /></Button></Link><Link to="/network"><Button variant="secondary" className="!border-white/15 !bg-white/10 !text-white !shadow-none hover:!bg-white/15">Review Supply Flow</Button></Link></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur-sm"><div className="flex items-center gap-2 text-xs font-bold text-emerald-100"><CheckCircle2 size={15} /> Platform status</div><div className="mt-2 text-lg font-extrabold">{apiOnline ? 'Operational' : 'Attention required'}</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-[.15em] text-white/45">Connected services</div><div className="mt-2 text-lg font-extrabold">5 operational areas</div></div>
          </div>
        </div>
        <div className="absolute -bottom-28 -right-16 h-80 w-80 rounded-full border border-emerald-300/10" /><div className="absolute -right-32 top-6 h-64 w-64 rounded-full bg-emerald-300/[.05] blur-2xl" />
      </section>

      {loading ? <Panel><LoadingState label="Loading live operations…" /></Panel> : error ? <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel> : <>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Active locations" value={activeNodes.length} icon={Boxes} caption="Farms, collection centres, supply points, and factories" />
          <MetricTile label="Open connections" value={activeEdges.length} icon={GitBranch} caption="Transport links currently available for planning" />
          <MetricTile label="Live data status" value={apiOnline ? 'CONNECTED' : 'OFFLINE'} icon={CheckCircle2} caption={apiOnline ? 'Operational information is available' : 'Check backend services'} tone={apiOnline ? 'green' : 'red'} />
          <MetricTile label="Latest daily capacity" value={latest?.solutionMetric?.toLocaleString?.() ?? '—'} suffix={latest ? 'kg/day' : ''} icon={Activity} caption={latest ? 'Most recent saved supply-flow review' : 'Run a flow review to create history'} />
        </div>

        <Panel className="mb-6 overflow-hidden">
          <PanelHeader eyebrow="Operational workspaces" title="Choose an area to manage" description="Every workspace uses live backend information while presenting decisions in clear business language." action={<Badge tone="green"><Sparkles size={11} className="mr-1" /> Unified operations</Badge>} />
          <div className="grid gap-4 p-5 sm:grid-cols-2 2xl:grid-cols-3 sm:p-6">
            {workspaces.map(({ title, description, to, icon: Icon, tone }) => <Link key={to} to={to} className="group data-card p-5"><div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}><Icon size={20} /></div><h3 className="mt-4 text-base font-extrabold tracking-tight text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{description}</p><div className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[.08em] text-tea-700">Open workspace <ArrowRight size={14} className="transition group-hover:translate-x-1" /></div></Link>)}
          </div>
        </Panel>

        <div className="grid gap-6 2xl:grid-cols-[1.45fr_.75fr]">
          <Panel className="overflow-hidden"><PanelHeader eyebrow="Live supply view" title="Tea Movement Network" description="A current view of the locations and transport connections used for daily factory intake planning." action={<Link to="/network"><Button variant="secondary" size="sm">View Flow Details <ArrowRight size={15} /></Button></Link>} /><div className="p-4 sm:p-5"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div></Panel>
          <Panel className="overflow-hidden"><PanelHeader eyebrow="Management focus" title="Recommended daily checks" description="A simple routine for informed operational decisions." /><div className="divide-y divide-slate-200/75"><div className="px-5 py-4 sm:px-6"><div className="text-sm font-extrabold text-slate-900">Review supply capacity</div><p className="mt-1 text-xs leading-5 text-muted">Confirm the network can move today&apos;s expected harvest volume.</p></div><div className="px-5 py-4 sm:px-6"><div className="text-sm font-extrabold text-slate-900">Protect critical connections</div><p className="mt-1 text-xs leading-5 text-muted">Identify roads and links where disruption would affect factory intake.</p></div><div className="px-5 py-4 sm:px-6"><div className="text-sm font-extrabold text-slate-900">Prioritize quality-sensitive batches</div><p className="mt-1 text-xs leading-5 text-muted">Move urgent harvested tea before quality deterioration increases.</p></div><div className="px-5 py-4 sm:px-6"><div className="text-sm font-extrabold text-slate-900">Confirm factory readiness</div><p className="mt-1 text-xs leading-5 text-muted">Align workers and machines with the current production workload.</p></div></div>{recentError && <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 text-xs text-amber-800">Recent history is temporarily unavailable: {recentError}</div>}</Panel>
        </div>
      </>}
    </div>
  )
}
