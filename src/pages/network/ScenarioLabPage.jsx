import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Beaker, GitCompare, Plus, Trash2 } from 'lucide-react'
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
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'

const defaultTypes = ['CLOSE_LINK', 'REDUCE_BY_PERCENT', 'INCREASE_BY_PERCENT', 'SET_CAPACITY']

function defaultScenario(edge) {
  return {
    name: edge ? `Test ${edge.fromCode} to ${edge.toCode}` : 'Capacity scenario',
    type: 'CLOSE_LINK',
    fromCode: edge?.fromCode || '',
    toCode: edge?.toCode || '',
    newCapacityKgPerDay: null,
    percent: null,
  }
}

function normalizeScenario(s) {
  return {
    name: s.name.trim() || `${s.type} ${s.fromCode} to ${s.toCode}`,
    type: s.type,
    fromCode: s.fromCode,
    toCode: s.toCode,
    newCapacityKgPerDay: s.type === 'SET_CAPACITY' ? Number(s.newCapacityKgPerDay) : null,
    percent: ['REDUCE_BY_PERCENT', 'INCREASE_BY_PERCENT'].includes(s.type) ? Number(s.percent) : null,
  }
}

export default function ScenarioLabPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const activeEdges = useMemo(() => graph.edges.filter((e) => e.active), [graph.edges])
  const sourceDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'SOURCE' && n.active)?.code || '', [graph.nodes])
  const sinkDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'FACTORY' && n.active)?.code || '', [graph.nodes])
  const [sourceCode, setSourceCode] = useState('')
  const [sinkCode, setSinkCode] = useState('')
  const [types, setTypes] = useState(defaultTypes)
  const [scenario, setScenario] = useState(defaultScenario())
  const [quickResult, setQuickResult] = useState(null)
  const [queue, setQueue] = useState([])
  const [batchResult, setBatchResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  useEffect(() => { if (!sourceCode && sourceDefault) setSourceCode(sourceDefault) }, [sourceDefault, sourceCode])
  useEffect(() => { if (!sinkCode && sinkDefault) setSinkCode(sinkDefault) }, [sinkDefault, sinkCode])
  useEffect(() => {
    if (activeEdges.length && !scenario.fromCode) setScenario(defaultScenario(activeEdges[0]))
  }, [activeEdges, scenario.fromCode])
  useEffect(() => {
    networkApi.getBottleneckPresets().then((p) => { if (p?.scenarioTypes?.length) setTypes(p.scenarioTypes) }).catch(() => undefined)
  }, [])

  const selectedKey = `${scenario.fromCode}|||${scenario.toCode}`
  const handleEdge = (value) => {
    const [fromCode, toCode] = value.split('|||')
    const edge = activeEdges.find((e) => e.fromCode === fromCode && e.toCode === toCode)
    setScenario((s) => ({ ...s, fromCode, toCode, name: edge ? `${s.type.replaceAll('_', ' ')} · ${fromCode} → ${toCode}` : s.name }))
  }
  const handleType = (type) => setScenario((s) => ({ ...s, type, percent: type.includes('PERCENT') ? (s.percent ?? 25) : null, newCapacityKgPerDay: type === 'SET_CAPACITY' ? (s.newCapacityKgPerDay ?? 500) : null }))

  const validate = (s) => {
    if (!sourceCode || !sinkCode) return 'Select both source and factory nodes.'
    if (!s.fromCode || !s.toCode) return 'Select a network connection.'
    if (s.type.includes('PERCENT') && (s.percent === '' || s.percent == null || Number(s.percent) < 0)) return 'Enter a valid percentage.'
    if (s.type === 'REDUCE_BY_PERCENT' && Number(s.percent) > 100) return 'Reduction percentage must be from 0 to 100.'
    if (s.type === 'SET_CAPACITY' && (s.newCapacityKgPerDay === '' || s.newCapacityKgPerDay == null || Number(s.newCapacityKgPerDay) < 0)) return 'Enter a valid capacity.'
    return ''
  }

  const runQuick = async () => {
    const msg = validate(scenario); if (msg) return setRunError(msg)
    setRunning(true); setRunError('')
    try { setQuickResult(await networkApi.runScenario({ sourceCode, sinkCode, scenario: normalizeScenario(scenario) })) }
    catch (err) { setRunError(apiErrorMessage(err)) }
    finally { setRunning(false) }
  }
  const addToQueue = () => {
    const msg = validate(scenario); if (msg) return setRunError(msg)
    setQueue((q) => [...q, { ...normalizeScenario(scenario), localId: `${Date.now()}-${Math.random()}` }]); setRunError('')
  }
  const runBatch = async () => {
    if (!queue.length) return setRunError('Add at least one scenario to the comparison queue.')
    setRunning(true); setRunError('')
    try { setBatchResult(await networkApi.runScenarios({ sourceCode, sinkCode, scenarios: queue.map(({ localId, ...s }) => s) })) }
    catch (err) { setRunError(apiErrorMessage(err)) }
    finally { setRunning(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  const comparisonData = (batchResult?.scenarios || []).map((r) => ({ name: r.name, flow: r.scenarioMaximumFlowKgPerDay, baseline: r.baselineMaximumFlowKgPerDay }))

  return (
    <>
      <PageHeader engine="FORD–FULKERSON SCENARIO RERUN" title="Capacity Scenario Lab" description="Test a temporary road/handling capacity reduction, closure or upgrade without changing the PostgreSQL graph. Every scenario is applied in memory, then Ford-Fulkerson is rerun against the same baseline network." />

      <div className="grid gap-6 2xl:grid-cols-[.86fr_1.14fr]">
        <Panel className="h-fit overflow-hidden">
          <PanelHeader eyebrow="Scenario builder" title="Modify one active connection" description="Use the backend-supported scenario types only." />
          <div className="space-y-4 p-5">
            <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
            <Field label="Connection">
              <select className={selectClass} value={selectedKey} onChange={(e) => handleEdge(e.target.value)}>
                <option value="|||">Select connection</option>
                {activeEdges.map((edge) => <option key={edge.id} value={`${edge.fromCode}|||${edge.toCode}`}>{edge.fromCode} → {edge.toCode} · {edge.capacityKgPerDay.toLocaleString()} kg/day</option>)}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Scenario type"><select className={selectClass} value={scenario.type} onChange={(e) => handleType(e.target.value)}>{types.map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}</select></Field>
              {scenario.type.includes('PERCENT') && <Field label="Percent"><div className="relative"><input className={`${inputClass} pr-9`} type="number" min="0" max={scenario.type === 'REDUCE_BY_PERCENT' ? 100 : undefined} value={scenario.percent ?? ''} onChange={(e) => setScenario((s) => ({ ...s, percent: e.target.value }))} /><span className="absolute right-3 top-2.5 text-sm text-muted">%</span></div></Field>}
              {scenario.type === 'SET_CAPACITY' && <Field label="New capacity"><div className="relative"><input className={`${inputClass} pr-20`} type="number" min="0" value={scenario.newCapacityKgPerDay ?? ''} onChange={(e) => setScenario((s) => ({ ...s, newCapacityKgPerDay: e.target.value }))} /><span className="absolute right-3 top-2.5 text-xs text-muted">kg/day</span></div></Field>}
            </div>
            <Field label="Scenario name"><input className={inputClass} value={scenario.name} onChange={(e) => setScenario((s) => ({ ...s, name: e.target.value }))} /></Field>
            <InlineError message={runError} />
            <div className="grid gap-2 sm:grid-cols-2"><Button onClick={runQuick} disabled={running}><Beaker size={16} /> {running ? 'Running…' : 'Run Quick Test'}</Button><Button variant="secondary" onClick={addToQueue} disabled={running}><Plus size={16} /> Add to Comparison</Button></div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Quick result" title="Baseline vs Scenario" description="Throughput change and modified-link utilization returned by /api/network/bottlenecks/scenario." />
          {!quickResult ? <EmptyState title="No scenario result yet" description="Run a quick test to see the exact impact on maximum tea throughput." /> : <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Baseline Flow" value={quickResult.baselineMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" />
              <MetricTile label="Scenario Flow" value={quickResult.scenarioMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" />
              <MetricTile label="Throughput Change" value={`${quickResult.throughputChangeKgPerDay > 0 ? '+' : ''}${quickResult.throughputChangeKgPerDay.toLocaleString()}`} suffix="kg/day" tone={quickResult.throughputChangeKgPerDay < 0 ? 'red' : 'green'} icon={quickResult.throughputChangeKgPerDay < 0 ? ArrowDownRight : ArrowUpRight} />
              <MetricTile label="Execution" value={Number(quickResult.executionTimeMs).toFixed(4)} suffix="ms" />
            </div>
            <div className="mt-5 grid gap-4 rounded-2xl border border-tea-950/10 bg-tea-50/55 p-4 sm:grid-cols-2 xl:grid-cols-4"><div><div className="section-kicker">Modified link</div><div className="mt-1 font-mono text-sm font-bold">{quickResult.fromCode} → {quickResult.toCode}</div></div><div><div className="section-kicker">Capacity</div><div className="mt-1 font-mono text-sm font-bold">{quickResult.originalCapacityKgPerDay.toLocaleString()} → {quickResult.scenarioCapacityKgPerDay.toLocaleString()}</div></div><div><div className="section-kicker">Link utilization</div><div className="mt-1 font-mono text-sm font-bold">{Number(quickResult.scenarioUtilizationPercent).toFixed(2)}%</div></div><div><div className="section-kicker">State</div><div className="mt-1"><Badge tone={quickResult.modifiedLinkSaturatedAfterScenario ? 'red' : 'green'}>{quickResult.modifiedLinkSaturatedAfterScenario ? 'Saturated' : 'Not saturated'}</Badge></div></div></div>
          </div>}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[.72fr_1.28fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Batch endpoint" title={`Comparison Queue · ${queue.length}`} description="Run several capacity scenarios against one shared baseline." action={<Button size="sm" onClick={runBatch} disabled={running || !queue.length}><GitCompare size={15} /> Compare All</Button>} />
          {queue.length ? <div className="divide-y divide-tea-950/7">{queue.map((s, i) => <div key={s.localId} className="flex items-start gap-3 px-5 py-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tea-50 font-mono text-xs font-bold text-tea-800">{i + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-graphite">{s.name}</div><div className="mt-1 font-mono text-xs text-muted">{s.fromCode} → {s.toCode} · {s.type}</div></div><button onClick={() => setQueue((q) => q.filter((x) => x.localId !== s.localId))} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" aria-label="Remove scenario"><Trash2 size={16} /></button></div>)}</div> : <EmptyState title="Comparison queue is empty" description="Build a scenario and add it to the queue. The comparison endpoint accepts multiple scenarios in one request." />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Scenario comparison" title="Maximum Throughput by Scenario" description={batchResult ? `Shared baseline: ${batchResult.baselineMaximumFlowKgPerDay.toLocaleString()} kg/day` : 'Run the comparison queue to generate this chart.'} />
          <div className="h-[360px] p-4">{comparisonData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 70 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="name" angle={-24} textAnchor="end" height={85} tick={{ fontSize: 10 }} interval={0} /><YAxis tick={{ fontSize: 11 }} unit=" kg" /><Tooltip formatter={(v, n) => [`${Number(v).toLocaleString()} kg/day`, n === 'flow' ? 'Scenario' : 'Baseline']} /><Bar dataKey="baseline" fill="#b9c6bd" radius={[5,5,0,0]} /><Bar dataKey="flow" fill="#2F6B4F" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer> : <EmptyState />}</div>
        </Panel>
      </div>
    </>
  )
}
