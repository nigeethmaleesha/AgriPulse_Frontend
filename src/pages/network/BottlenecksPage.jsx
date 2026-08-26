import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, Clock3, Gauge, ListOrdered, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { useNetwork } from '../../context/NetworkContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { EndpointSelector } from '../../components/network/EndpointSelector'
import { Field, inputClass } from '../../components/ui/FormControls'

export default function BottlenecksPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const sourceDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'SOURCE' && n.active)?.code || '', [graph.nodes])
  const sinkDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'FACTORY' && n.active)?.code || '', [graph.nodes])
  const [sourceCode, setSourceCode] = useState('')
  const [sinkCode, setSinkCode] = useState('')
  const [topN, setTopN] = useState(10)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  useEffect(() => { if (!sourceCode && sourceDefault) setSourceCode(sourceDefault) }, [sourceDefault, sourceCode])
  useEffect(() => { if (!sinkCode && sinkDefault) setSinkCode(sinkDefault) }, [sinkDefault, sinkCode])

  const run = async () => {
    if (!sourceCode || !sinkCode) return setRunError('Select both source and factory nodes.')
    setRunning(true); setRunError('')
    try { setResult(await networkApi.analyzeBottlenecks({ sourceCode, sinkCode, topN: Number(topN) })) }
    catch (err) { setRunError(apiErrorMessage(err)) }
    finally { setRunning(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  const chartData = (result?.exactClosureImpactRanking || []).slice(0, 8).map((r) => ({ name: `${r.fromCode}→${r.toCode}`, loss: r.throughputLossIfClosedKgPerDay, impact: r.throughputImpactPercent }))

  return (
    <>
      <PageHeader engine="LINEAR SCAN + MAX-HEAP + FLOW RERUNS" title="Bottleneck Analysis" description="Member 6 reuses the Member 5 Ford-Fulkerson engine to detect saturated links, rank utilization with a max-heap, and measure exact throughput impact by temporarily closing each connection in memory." />

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Analysis controls" title="Find the links that constrain factory throughput" description="The graph in PostgreSQL is not modified by this analysis." />
        <div className="grid gap-4 p-5 xl:grid-cols-[1fr_170px_auto] xl:items-end">
          <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
          <Field label="Top ranked links"><input className={inputClass} type="number" min="1" max="100" value={topN} onChange={(e) => setTopN(e.target.value)} /></Field>
          <Button onClick={run} disabled={running}>{running ? 'Analysing…' : <><Search size={16} /> Run Bottleneck Analysis</>}</Button>
        </div>
        {runError && <div className="px-5 pb-5"><InlineError message={runError} /></div>}
      </Panel>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Baseline Max Flow" value={result?.baselineMaximumFlowKgPerDay?.toLocaleString?.() ?? '—'} suffix={result ? 'kg/day' : ''} icon={Activity} />
        <MetricTile label="Saturated Links" value={result?.linearSaturatedLinks?.length ?? '—'} icon={AlertTriangle} tone={(result?.linearSaturatedLinks?.length || 0) > 0 ? 'amber' : 'green'} />
        <MetricTile label="Edges Analysed" value={result?.edgeCount ?? graph.edges.filter((e) => e.active).length} icon={Gauge} />
        <MetricTile label="Ranked Results" value={result?.exactClosureImpactRanking?.length ?? '—'} icon={ListOrdered} />
      </div>

      {!result ? <Panel><EmptyState title="Bottleneck analysis has not been run" description="Choose source/sink nodes and run the analysis to compare all three Member 6 methods." /></Panel> : <>
        <div className="grid gap-6 2xl:grid-cols-[1fr_.9fr]">
          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Exact impact" title="Throughput Loss if Link is Closed" description="Higher loss means the link has a larger direct effect on maximum factory throughput." />
            <div className="h-[340px] p-4">
              {chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 16, left: 8, bottom: 50 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="name" angle={-25} textAnchor="end" height={65} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} unit=" kg" /><Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kg/day`, 'Throughput loss']} /><Bar dataKey="loss" fill="#2F6B4F" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer> : <EmptyState />}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Candidate method 1" title="Linear Saturated-Edge Scan" description="Directly identifies links whose residual capacity is zero in the baseline max-flow result." />
            {result.linearSaturatedLinks?.length ? <div className="divide-y divide-tea-950/7">{result.linearSaturatedLinks.map((r) => <div key={`${r.fromCode}-${r.toCode}`} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4"><div><div className="font-mono text-sm font-bold text-graphite">{r.fromCode} → {r.toCode}</div><div className="mt-1 text-xs text-muted">{r.flowKgPerDay.toLocaleString()} / {r.capacityKgPerDay.toLocaleString()} kg/day</div></div><Badge tone="red">{Number(r.utilizationPercent).toFixed(1)}%</Badge></div>)}</div> : <EmptyState title="No saturated links" description="The baseline result did not return any fully saturated edge." />}
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Candidate method 2" title="Max-Heap Utilization Ranking" description="Ranks the highest-utilization links first." />
            <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-sm"><thead className="bg-tea-50/70 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Link</th><th className="px-4 py-3">Flow / Capacity</th><th className="px-4 py-3">Util.</th><th className="px-4 py-3">State</th></tr></thead><tbody className="divide-y divide-tea-950/7">{result.heapRankedLinks.map((r) => <tr key={`${r.rank}-${r.fromCode}-${r.toCode}`}><td className="px-4 py-3 font-mono font-bold">#{r.rank}</td><td className="px-4 py-3 font-mono font-semibold">{r.fromCode} → {r.toCode}</td><td className="px-4 py-3 font-mono text-xs">{r.flowKgPerDay.toLocaleString()} / {r.capacityKgPerDay.toLocaleString()}</td><td className="px-4 py-3 font-mono font-bold">{Number(r.utilizationPercent).toFixed(1)}%</td><td className="px-4 py-3"><Badge tone={r.saturated ? 'red' : r.utilizationPercent >= 85 ? 'amber' : 'green'}>{r.saturated ? 'Saturated' : 'Open'}</Badge></td></tr>)}</tbody></table></div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Candidate method 3" title="Exact Closure Impact Ranking" description="Reruns Ford-Fulkerson with each candidate link closed and ranks the observed throughput loss." />
            <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-tea-50/70 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Rank</th><th className="px-4 py-3">Link</th><th className="px-4 py-3">Loss</th><th className="px-4 py-3">Impact</th><th className="px-4 py-3">Level</th></tr></thead><tbody className="divide-y divide-tea-950/7">{result.exactClosureImpactRanking.map((r) => <tr key={`${r.rank}-${r.fromCode}-${r.toCode}`}><td className="px-4 py-3 font-mono font-bold">#{r.rank}</td><td className="px-4 py-3 font-mono font-semibold">{r.fromCode} → {r.toCode}</td><td className="px-4 py-3 font-mono font-bold">{r.throughputLossIfClosedKgPerDay.toLocaleString()} kg/day</td><td className="px-4 py-3 font-mono">{Number(r.throughputImpactPercent).toFixed(2)}%</td><td className="px-4 py-3"><Badge tone={r.impactLevel?.toLowerCase().includes('high') || r.throughputImpactPercent >= 20 ? 'red' : r.throughputImpactPercent > 0 ? 'amber' : 'neutral'}>{r.impactLevel}</Badge></td></tr>)}</tbody></table></div>
          </Panel>
        </div>

        <Panel className="mt-6 overflow-hidden">
          <PanelHeader eyebrow="Measured evidence" title="Method Performance" description="Execution time and estimated peak algorithm memory returned by the backend analysis." />
          <div className="grid gap-4 p-5 md:grid-cols-3">{result.methodPerformance.map((m, i) => <div key={m.method || i} className="rounded-2xl border border-tea-950/10 bg-white p-4"><div className="text-sm font-bold text-graphite">{m.method}</div><div className="mt-4 grid grid-cols-2 gap-3"><div><div className="text-[10px] font-bold uppercase tracking-wider text-muted">Execution</div><div className="mt-1 font-mono text-lg font-bold">{Number(m.executionTimeMs).toFixed(4)} ms</div></div><div><div className="text-[10px] font-bold uppercase tracking-wider text-muted">Memory</div><div className="mt-1 font-mono text-lg font-bold">{Number(m.estimatedPeakAlgorithmMemoryMb).toFixed(4)} MB</div></div></div></div>)}</div>
        </Panel>
      </>}
    </>
  )
}
