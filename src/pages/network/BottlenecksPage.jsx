import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ListOrdered, Search, ShieldAlert } from 'lucide-react'
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
import { impactAction } from '../../utils/displayLabels'

function friendlyImpact(level, percent) {
  const p = Number(percent)
  if (String(level || '').toUpperCase().includes('CRITICAL') || p >= 25) return { label: 'Very high', tone: 'red' }
  if (String(level || '').toUpperCase().includes('HIGH') || p >= 10) return { label: 'High', tone: 'red' }
  if (p > 0) return { label: 'Moderate', tone: 'amber' }
  return { label: 'Low', tone: 'neutral' }
}

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
    if (!sourceCode || !sinkCode) return setRunError('Select the supply starting point and destination factory.')
    setRunning(true); setRunError('')
    try { setResult(await networkApi.analyzeBottlenecks({ sourceCode, sinkCode, topN: Number(topN) })) }
    catch (err) { setRunError(apiErrorMessage(err)) }
    finally { setRunning(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  const priorityRows = result?.exactClosureImpactRanking || []
  const chartData = priorityRows.slice(0, 8).map((r) => ({ name: `${r.fromCode}→${r.toCode}`, loss: r.throughputLossIfClosedKgPerDay }))
  const topRisk = priorityRows[0]
  const currentFull = result?.linearSaturatedLinks || []

  return (
    <>
      <PageHeader engine="SUPPLY RISK REVIEW" title="Critical Connections" description="Find the transport connections that matter most to factory intake. The system shows which links are currently full and estimates how much daily tea delivery would be lost if a connection became unavailable." />

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Risk check" title="Find Connections That Need Protection" description="This review does not change your saved network. It only assesses operational risk." />
        <div className="grid gap-4 p-5 xl:grid-cols-[1fr_170px_auto] xl:items-end">
          <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
          <Field label="Number of priority results"><input className={inputClass} type="number" min="1" max="100" value={topN} onChange={(e) => setTopN(e.target.value)} /></Field>
          <Button onClick={run} disabled={running}>{running ? 'Reviewing network…' : <><Search size={16} /> Review Critical Connections</>}</Button>
        </div>
        {runError && <div className="px-5 pb-5"><InlineError message={runError} /></div>}
      </Panel>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Current daily throughput" value={result?.baselineMaximumFlowKgPerDay?.toLocaleString?.() ?? '—'} suffix={result ? 'kg/day' : ''} icon={Activity} />
        <MetricTile label="Connections at capacity" value={result?.linearSaturatedLinks?.length ?? '—'} icon={AlertTriangle} tone={(result?.linearSaturatedLinks?.length || 0) > 0 ? 'amber' : 'green'} />
        <MetricTile label="Connections reviewed" value={result?.edgeCount ?? graph.edges.filter((e) => e.active).length} icon={ShieldAlert} />
        <MetricTile label="Priority risks found" value={priorityRows.length || '—'} icon={ListOrdered} />
      </div>

      {!result ? <Panel><EmptyState title="No risk review yet" description="Choose the supply origin and factory, then review critical connections." /></Panel> : <>
        {topRisk && <Panel className="mb-6 overflow-hidden border-red-200/80">
          <div className="grid gap-5 bg-red-50/65 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-[.12em] text-red-700">Highest priority connection</div>
              <div className="mt-2 font-mono text-2xl font-extrabold text-graphite">{topRisk.fromCode} → {topRisk.toCode}</div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-red-800">If this connection becomes unavailable, factory delivery capacity is estimated to fall by <b>{topRisk.throughputLossIfClosedKgPerDay.toLocaleString()} kg/day</b> ({Number(topRisk.throughputImpactPercent).toFixed(2)}%).</p>
              <p className="mt-2 text-sm font-bold text-red-900">Recommended action: {impactAction(topRisk.throughputImpactPercent)}.</p>
            </div>
            <Badge tone="red">Priority #1</Badge>
          </div>
        </Panel>}

        <div className="grid gap-6 2xl:grid-cols-[1.1fr_.9fr]">
          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Potential disruption impact" title="Daily Tea Delivery Lost if a Connection Fails" description="Taller bars represent connections with a larger effect on factory intake." />
            <div className="h-[340px] p-4">
              {chartData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ top: 10, right: 16, left: 8, bottom: 50 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="name" angle={-25} textAnchor="end" height={65} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} unit=" kg" /><Tooltip formatter={(v) => [`${Number(v).toLocaleString()} kg/day`, 'Estimated delivery loss']} /><Bar dataKey="loss" fill="#2F6B4F" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer> : <EmptyState />}
            </div>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader eyebrow="Current pressure" title="Connections Already at Full Daily Limit" description="These routes currently have no spare carrying capacity in the latest network check." />
            {currentFull.length ? <div className="divide-y divide-tea-950/7">{currentFull.map((r) => <div key={`${r.fromCode}-${r.toCode}`} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4"><div><div className="font-mono text-sm font-bold text-graphite">{r.fromCode} → {r.toCode}</div><div className="mt-1 text-xs text-muted">Moving {r.flowKgPerDay.toLocaleString()} of {r.capacityKgPerDay.toLocaleString()} kg/day</div></div><Badge tone="red">At capacity</Badge></div>)}</div> : <EmptyState title="No connection is fully loaded" description="Every active connection currently has some spare daily carrying capacity." />}
          </Panel>
        </div>

        <Panel className="mt-6 overflow-hidden">
          <PanelHeader eyebrow="Management priority" title="Connection Risk Ranking" description="Use this list to decide where backup transport, maintenance or capacity investment is most valuable." />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-tea-50/70 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Connection</th><th className="px-4 py-3">Current use</th><th className="px-4 py-3">Delivery loss if unavailable</th><th className="px-4 py-3">Factory impact</th><th className="px-4 py-3">Suggested action</th></tr></thead>
              <tbody className="divide-y divide-tea-950/7">{priorityRows.map((r) => { const impact = friendlyImpact(r.impactLevel, r.throughputImpactPercent); return <tr key={`${r.rank}-${r.fromCode}-${r.toCode}`}><td className="px-4 py-3 font-mono font-bold">#{r.rank}</td><td className="px-4 py-3 font-mono font-semibold">{r.fromCode} → {r.toCode}</td><td className="px-4 py-3 font-mono">{Number(r.baselineUtilizationPercent ?? 0).toFixed(1)}%</td><td className="px-4 py-3 font-mono font-bold">{r.throughputLossIfClosedKgPerDay.toLocaleString()} kg/day</td><td className="px-4 py-3"><Badge tone={impact.tone}>{impact.label} · {Number(r.throughputImpactPercent).toFixed(1)}%</Badge></td><td className="px-4 py-3 text-sm font-semibold text-graphite">{impactAction(r.throughputImpactPercent)}</td></tr>})}</tbody>
            </table>
          </div>
        </Panel>
      </>}
    </>
  )
}
