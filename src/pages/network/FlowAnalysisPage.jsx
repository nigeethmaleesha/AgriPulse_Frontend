import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, CheckCircle2, GitBranch, Network, ShieldAlert } from 'lucide-react'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { useNetwork } from '../../context/NetworkContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { EndpointSelector } from '../../components/network/EndpointSelector'
import { NetworkGraph } from '../../components/network/NetworkGraph'
import { EdgeFlowTable } from '../../components/network/EdgeFlowTable'

export default function FlowAnalysisPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const sourceDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'SOURCE' && n.active)?.code || '', [graph.nodes])
  const sinkDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'FACTORY' && n.active)?.code || '', [graph.nodes])
  const [sourceCode, setSourceCode] = useState('')
  const [sinkCode, setSinkCode] = useState('')
  const [saveBenchmark, setSaveBenchmark] = useState(true)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  useEffect(() => { if (!sourceCode && sourceDefault) setSourceCode(sourceDefault) }, [sourceDefault, sourceCode])
  useEffect(() => { if (!sinkCode && sinkDefault) setSinkCode(sinkDefault) }, [sinkDefault, sinkCode])

  const run = async () => {
    if (!sourceCode || !sinkCode) return setRunError('Select the supply starting point and destination factory.')
    setRunning(true); setRunError('')
    try {
      setResult(await networkApi.runMaxFlow({ sourceCode, sinkCode, saveBenchmark }))
    } catch (err) { setRunError(apiErrorMessage(err)) } finally { setRunning(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  const rows = result?.edgeFlows || []
  const atCapacityCount = rows.filter((r) => r.residualCapacityKgPerDay === 0 && r.capacityKgPerDay > 0).length
  const nearCapacityCount = rows.filter((r) => r.residualCapacityKgPerDay > 0 && Number(r.utilizationPercent) >= 85).length
  const busiest = rows.slice().sort((a, b) => Number(b.utilizationPercent) - Number(a.utilizationPercent))[0]

  return (
    <>
      <PageHeader engine="DAILY CAPACITY CHECK" title="Daily Tea Throughput" description="Check how much tea the current farm-to-factory transport network can deliver in one day and see which connections still have spare carrying capacity." />

      <div className="grid gap-6 2xl:grid-cols-[1.55fr_.75fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Current network" title="Tea Movement Map" description="Before the check, labels show each connection's daily limit. After the check, they show tea assigned / daily limit." />
          <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} edgeFlows={rows} /></div>
        </Panel>

        <Panel className="h-fit overflow-hidden">
          <PanelHeader eyebrow="Capacity check" title="Check Factory Delivery Capacity" description="Choose the start of the supply network and the factory receiving the tea." />
          <div className="space-y-4 p-5">
            <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-tea-800" checked={saveBenchmark} onChange={(e) => setSaveBenchmark(e.target.checked)} /><span><b className="text-graphite">Save this capacity check</b><span className="block text-xs text-muted">Keep a history of the result for later comparison.</span></span></label>
            <InlineError message={runError} />
            <Button className="w-full" onClick={run} disabled={running || !sourceCode || !sinkCode}>{running ? 'Checking network…' : <>Check Daily Capacity <ArrowRight size={16} /></>}</Button>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Maximum deliverable tea" value={result?.maximumFlowKgPerDay?.toLocaleString?.() ?? '—'} suffix={result ? 'kg/day' : ''} icon={Activity} caption="Highest daily factory intake supported by the current network" />
        <MetricTile label="Active locations" value={result?.performance?.nodeCount ?? graph.nodes.filter((n) => n.active).length} icon={Network} />
        <MetricTile label="Transport connections" value={result?.performance?.edgeCount ?? graph.edges.filter((e) => e.active).length} icon={GitBranch} />
        <MetricTile label="At capacity" value={result ? atCapacityCount : '—'} icon={ShieldAlert} tone={atCapacityCount > 0 ? 'red' : 'green'} caption="Connections with no spare carrying room" />
        <MetricTile label="Near capacity" value={result ? nearCapacityCount : '—'} icon={CheckCircle2} tone={nearCapacityCount > 0 ? 'amber' : 'green'} caption="Connections using 85% or more of their limit" />
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.4fr_.8fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Connection status" title="Tea Movement by Connection" description="Use this table to see how much tea is assigned to each transport connection and how much daily capacity remains." />
          {rows.length ? <EdgeFlowTable rows={rows} /> : <EmptyState title="No capacity check yet" description="Run the daily capacity check to see connection-level usage." />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Manager summary" title="What does this result mean?" description="A simple operational interpretation of the current capacity check." />
          {!result ? <EmptyState title="Run a capacity check first" description="The system will summarize factory delivery capacity and connections that need attention." /> : <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-tea-950/10 bg-tea-50/60 p-4">
              <div className="text-xs font-bold uppercase tracking-[.1em] text-muted">Factory delivery capability</div>
              <div className="mt-2 text-2xl font-extrabold text-graphite">{result.maximumFlowKgPerDay.toLocaleString()} kg/day</div>
              <p className="mt-2 text-sm leading-6 text-muted">Under the current connection limits, this is the highest amount of tea the network can deliver to the selected factory in one day.</p>
            </div>
            <div className={`rounded-2xl border p-4 ${atCapacityCount ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className={`text-sm font-bold ${atCapacityCount ? 'text-red-800' : 'text-emerald-800'}`}>{atCapacityCount ? `${atCapacityCount} connection${atCapacityCount === 1 ? '' : 's'} currently at capacity` : 'No connection is currently fully loaded'}</div>
              <p className={`mt-1 text-xs leading-5 ${atCapacityCount ? 'text-red-700' : 'text-emerald-700'}`}>{atCapacityCount ? 'Review Critical Connections to understand which of these routes would have the largest factory impact if disrupted.' : 'The current network has spare carrying room on every connection.'}</p>
            </div>
            {busiest && <div className="rounded-2xl border border-tea-950/10 bg-white p-4"><div className="text-xs font-bold uppercase tracking-[.1em] text-muted">Busiest connection</div><div className="mt-2 font-mono text-base font-extrabold text-graphite">{busiest.fromCode} → {busiest.toCode}</div><p className="mt-1 text-sm text-muted">Currently using <b className="text-graphite">{Number(busiest.utilizationPercent).toFixed(1)}%</b> of its daily carrying limit.</p></div>}
          </div>}
        </Panel>
      </div>
    </>
  )
}
