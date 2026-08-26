import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ArrowRight, Boxes, CheckCircle2, Factory, GitBranch, Network, Route, Sprout, Waves } from 'lucide-react'
import { networkApi } from '../api/networkApi'
import { apiErrorMessage } from '../api/client'
import { useNetwork } from '../context/NetworkContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { MetricTile } from '../components/ui/MetricTile'
import { Panel, PanelHeader } from '../components/ui/Panel'
import { ErrorState, LoadingState } from '../components/ui/Feedback'
import { NetworkGraph } from '../components/network/NetworkGraph'

const flow = [
  { code: 'M02', title: 'Farm Resources', subtitle: 'Not connected', icon: Sprout, active: false },
  { code: 'M04', title: 'Harvest & Risk', subtitle: 'Not connected', icon: Waves, active: false },
  { code: 'M01', title: 'Collection Dispatch', subtitle: 'Not connected', icon: Route, active: false },
  { code: 'M03', title: 'Network Capacity', subtitle: 'Connected', icon: Network, active: true },
  { code: 'M05', title: 'Factory Processing', subtitle: 'Not connected', icon: Factory, active: false },
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
  const latest = recent[0]

  return (
    <>
      <div className="topographic relative mb-6 overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-soft sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex items-center gap-2"><Badge tone="green" className="!bg-white/12 !text-emerald-100">PDSA · INTEGRATED IDSS</Badge><Badge tone="green" className="!bg-emerald-300/15 !text-emerald-100">MODULE 3 LIVE</Badge></div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Tea supply decisions, not just records.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">This frontend fully connects Module 3 — Tea Supply Network Capacity & Bottleneck Analysis. The other coursework modules remain visible as part of the integrated AgriPulse system, but intentionally have no API links in this build.</p>
          <div className="mt-5 flex flex-wrap gap-3"><Link to="/network"><Button className="!bg-white !text-tea-950 hover:!bg-emerald-50">Open Network Analysis <ArrowRight size={16} /></Button></Link><Link to="/network/bottlenecks"><Button className="!border-white/20 !bg-white/10 !text-white hover:!bg-white/15" variant="secondary">Analyse Bottlenecks</Button></Link></div>
        </div>
        <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full border border-white/10" /><div className="absolute -bottom-10 -right-28 h-72 w-72 rounded-full border border-white/8" />
      </div>

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Integrated workflow" title="AgriPulse Decision Flow" description="All five coursework modules are shown as one operational chain. Only Module 3 is connected in this frontend package." />
        <div className="overflow-x-auto p-5">
          <div className="flex min-w-[920px] items-center">
            {flow.map((item, index) => {
              const Icon = item.icon
              return <div key={item.code} className="contents">
                <div className={`min-w-[155px] rounded-2xl border p-4 ${item.active ? 'border-tea-700/25 bg-tea-50 shadow-sm' : 'border-tea-950/8 bg-white opacity-65'}`}>
                  <div className="flex items-center justify-between"><span className={`rounded-xl p-2 ${item.active ? 'bg-tea-950 text-white' : 'bg-stoneui text-muted'}`}><Icon size={18} /></span><span className="font-mono text-[10px] font-bold text-muted">{item.code}</span></div>
                  <div className="mt-3 text-sm font-bold text-graphite">{item.title}</div>
                  <div className={`mt-1 text-xs font-semibold ${item.active ? 'text-tea-700' : 'text-muted'}`}>{item.subtitle}</div>
                </div>
                {index < flow.length - 1 && <div className="mx-2 h-px min-w-7 flex-1 bg-tea-950/15"><ArrowRight size={14} className="-mt-[7px] ml-auto text-tea-700/45" /></div>}
              </div>
            })}
          </div>
        </div>
      </Panel>

      {loading ? <Panel><LoadingState /></Panel> : error ? <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel> : <>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Active Nodes" value={activeNodes.length} icon={Boxes} caption="SOURCE · FARM · HUB · FACTORY" />
          <MetricTile label="Active Connections" value={activeEdges.length} icon={GitBranch} caption="Directed capacity links" />
          <MetricTile label="API State" value="LIVE" icon={CheckCircle2} caption="Spring Boot /api/network connected" />
          <MetricTile label="Latest Saved Flow" value={latest?.solutionMetric?.toLocaleString?.() ?? '—'} suffix={latest ? 'kg/day' : ''} icon={Activity} caption={latest ? `${latest.algorithm} · ${Number(latest.executionTimeMs).toFixed(3)} ms` : 'Run max flow with Save benchmark enabled'} />
        </div>

        <div className="grid gap-6 2xl:grid-cols-[1.5fr_.75fr]">
          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Live graph" title="Current Tea Supply Network" description="Loaded directly from GET /api/network/graph. No route or flow value is fabricated by the frontend." action={<Link to="/network"><Button variant="secondary" size="sm">Run Ford-Fulkerson <ArrowRight size={15} /></Button></Link>} />
            <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Scope" title="Frontend connection status" description="Dashboard visibility is not the same as API integration." />
            <div className="divide-y divide-tea-950/7">
              {[
                ['M01', 'Collection Dispatch', false], ['M02', 'Resource Allocation', false], ['M03', 'Network Capacity', true], ['M04', 'Spoilage Intelligence', false], ['M05', 'Factory Operations', false]
              ].map(([code, name, connected]) => <div key={code} className="flex items-center gap-3 px-5 py-3.5"><span className="w-9 font-mono text-xs font-bold text-muted">{code}</span><span className="flex-1 text-sm font-semibold text-graphite">{name}</span><Badge tone={connected ? 'green' : 'neutral'}>{connected ? 'Connected' : 'UI only'}</Badge></div>)}
            </div>
            {recentError && <div className="border-t border-tea-950/8 px-5 py-3 text-xs text-amber-700">Saved results could not be loaded: {recentError}</div>}
          </Panel>
        </div>
      </>}
    </>
  )
}
