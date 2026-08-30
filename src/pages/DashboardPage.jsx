import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Boxes, CheckCircle2, Droplets, GitBranch, ShieldAlert, SlidersHorizontal, Sprout, Truck } from 'lucide-react'
import { networkApi } from '../api/networkApi'
import { apiErrorMessage } from '../api/client'
import { useNetwork } from '../context/NetworkContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { MetricTile } from '../components/ui/MetricTile'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { ErrorState, LoadingState } from '../components/ui/Feedback'
import { NetworkGraph } from '../components/network/NetworkGraph'

const actions = [
  {
    title: 'Fertilizer Knapsack DP Allocation (Port 8080)',
    description: 'Optimize fertilizer bag distribution across tea farms using 0/1 Knapsack Dynamic Programming.',
    to: '/fertilizer',
    icon: Sprout,
  },
  {
    title: 'Irrigation Pump Max-Heap Queue (Port 8080)',
    description: 'Priority queue pump resource allocation for farms during dry seasons.',
    to: '/pumps',
    icon: Droplets,
  },
  {
    title: 'Urgent Tea Collection Dispatch (Port 8082)',
    description: 'Calculate real-time shortest paths to high-priority harvest batches using Dijkstra + Max-Heap.',
    to: '/dispatch',
    icon: Truck,
  },
  {
    title: 'Check daily delivery capacity',
    description: 'See how much tea the current transport network can deliver to the factory today.',
    to: '/network',
    icon: Activity,
  },
  {
    title: 'Review vulnerable connections',
    description: 'Identify roads or handling links that could cause the largest production impact if unavailable.',
    to: '/network/bottlenecks',
    icon: ShieldAlert,
  },
  {
    title: 'Compare improvement plans',
    description: 'Test road closures, reduced capacity or upgrades before changing the real operating network.',
    to: '/network/scenarios',
    icon: SlidersHorizontal,
  },
]


export default function DashboardPage() {
  const { graph, loading, error, refreshGraph, apiOnline } = useNetwork()
  const [recent, setRecent] = useState([])
  const [recentError, setRecentError] = useState('')

  useEffect(() => {
    if (!apiOnline) return
    networkApi.getMaxFlowResults().then((data) => { setRecent(data || []); setRecentError('') }).catch((err) => setRecentError(apiErrorMessage(err)))
  }, [apiOnline])

  const activeEdges = graph.edges.filter((e) => e.active)
  const activeNodes = graph.nodes.filter((n) => n.active)
  const latest = recent.find((r) => { const name = String(r.algorithm || '').toLowerCase(); return name.includes('ford') || name.includes('max flow') || name.includes('synthetic') }) || recent[0]

  return (
    <>
      <div className="topographic relative mb-6 overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-soft sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex items-center gap-2"><Badge tone="green" className="!bg-white/12 !text-emerald-100">TEA SUPPLY OPERATIONS</Badge><Badge tone="green" className="!bg-emerald-300/15 !text-emerald-100">LIVE NETWORK</Badge></div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Keep tea moving to the factory.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">Monitor how much tea the current supply network can carry, identify critical transport connections, and test improvement plans before making operational changes.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/network"><Button className="!bg-white !text-tea-950 hover:!bg-emerald-50">Check Today&apos;s Capacity <ArrowRight size={16} /></Button></Link>
            <Link to="/network/bottlenecks"><Button className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/15" variant="secondary">Review Critical Connections</Button></Link>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full border border-white/10" /><div className="absolute -bottom-10 -right-28 h-72 w-72 rounded-full border border-white/8" />
      </div>

      {loading ? <Panel><LoadingState /></Panel> : error ? <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel> : <>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Active locations" value={activeNodes.length} icon={Boxes} caption="Supply points, farms, collection centres and factory" />
          <MetricTile label="Transport connections" value={activeEdges.length} icon={GitBranch} caption="Connections currently included in planning" />
          <MetricTile label="System status" value={apiOnline ? 'READY' : 'OFFLINE'} icon={CheckCircle2} caption={apiOnline ? 'Live network information is available' : 'Backend connection is unavailable'} tone={apiOnline ? 'green' : 'red'} />
          <MetricTile label="Latest checked capacity" value={latest?.solutionMetric?.toLocaleString?.() ?? '—'} suffix={latest ? 'kg/day' : ''} icon={Activity} caption={latest ? 'Most recently saved daily throughput check' : 'Run a capacity check to create history'} />
        </div>

        <Panel className="mb-6 overflow-hidden">
          <PanelHeader eyebrow="Daily decision tools" title="What would you like to check?" description="These views translate the network calculation into operational information for factory and logistics teams." />
          <div className="grid gap-4 p-5 lg:grid-cols-3">
            {actions.map(({ title, description, to, icon: Icon }) => <Link key={to} to={to} className="group rounded-2xl border border-tea-950/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-tea-700/25 hover:shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-tea-50 text-tea-800"><Icon size={19} /></div><h3 className="mt-4 text-base font-extrabold text-graphite">{title}</h3><p className="mt-2 text-sm leading-6 text-muted">{description}</p><div className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-tea-800">Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></div></Link>)}
          </div>
        </Panel>

        <div className="grid gap-6 2xl:grid-cols-[1.5fr_.75fr]">
          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Current supply network" title="Tea Movement Network" description="Each connection shows its planned daily carrying limit. Run a daily capacity check to see the amount of tea assigned to each connection." action={<Link to="/network"><Button variant="secondary" size="sm">Check Capacity <ArrowRight size={15} /></Button></Link>} />
            <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Manager guidance" title="How to read the results" description="Use the system as a decision aid for transport and factory intake planning." />
            <div className="divide-y divide-tea-950/7">
              <div className="px-5 py-4"><div className="text-sm font-bold text-graphite">Daily Throughput</div><p className="mt-1 text-xs leading-5 text-muted">Shows the maximum amount of tea the current network can deliver to the factory per day.</p></div>
              <div className="px-5 py-4"><div className="text-sm font-bold text-graphite">Critical Connections</div><p className="mt-1 text-xs leading-5 text-muted">Highlights connections where a disruption could cause the largest reduction in factory intake.</p></div>
              <div className="px-5 py-4"><div className="text-sm font-bold text-graphite">What-If Planning</div><p className="mt-1 text-xs leading-5 text-muted">Tests closures, reduced capacity and upgrades without changing the real network data.</p></div>
            </div>
            {recentError && <div className="border-t border-tea-950/8 px-5 py-3 text-xs text-amber-700">Recent capacity history could not be loaded: {recentError}</div>}
          </Panel>
        </div>
      </>}
    </>
  )
}
