import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, GitCompare, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
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
import { scenarioTypeLabel } from '../../utils/displayLabels'

const defaultTypes = ['CLOSE_LINK', 'REDUCE_BY_PERCENT', 'INCREASE_BY_PERCENT', 'SET_CAPACITY']

function defaultScenario(edge) {
  return {
    name: edge ? `Plan for ${edge.fromCode} to ${edge.toCode}` : 'Capacity plan',
    type: 'CLOSE_LINK',
    fromCode: edge?.fromCode || '',
    toCode: edge?.toCode || '',
    newCapacityKgPerDay: null,
    percent: null,
  }
}

function normalizeScenario(s) {
  return {
    name: s.name.trim() || `${scenarioTypeLabel(s.type)} ${s.fromCode} to ${s.toCode}`,
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
    setScenario((s) => ({ ...s, fromCode, toCode, name: edge ? `${scenarioTypeLabel(s.type)} · ${fromCode} → ${toCode}` : s.name }))
  }
  const handleType = (type) => setScenario((s) => ({ ...s, type, name: s.fromCode ? `${scenarioTypeLabel(type)} · ${s.fromCode} → ${s.toCode}` : s.name, percent: type.includes('PERCENT') ? (s.percent ?? 25) : null, newCapacityKgPerDay: type === 'SET_CAPACITY' ? (s.newCapacityKgPerDay ?? 500) : null }))

  const validate = (s) => {
    if (!sourceCode || !sinkCode) return 'Select the supply starting point and destination factory.'
    if (!s.fromCode || !s.toCode) return 'Select a transport connection.'
    if (s.type.includes('PERCENT') && (s.percent === '' || s.percent == null || Number(s.percent) < 0)) return 'Enter a valid percentage.'
    if (s.type === 'REDUCE_BY_PERCENT' && Number(s.percent) > 100) return 'The reduction must be between 0% and 100%.'
    if (s.type === 'SET_CAPACITY' && (s.newCapacityKgPerDay === '' || s.newCapacityKgPerDay == null || Number(s.newCapacityKgPerDay) < 0)) return 'Enter a valid planned daily capacity.'
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
    if (!queue.length) return setRunError('Add at least one plan to compare.')
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
      <PageHeader engine="WHAT-IF PLANNING" title="What-If Capacity Planning" description="Compare possible disruptions or upgrades before making real changes. The saved network stays unchanged while the system estimates how each plan would affect daily factory intake." />

      <div className="grid gap-6 2xl:grid-cols-[.86fr_1.14fr]">
        <Panel className="h-fit overflow-hidden">
          <PanelHeader eyebrow="Plan builder" title="Test a Change to One Transport Connection" description="Choose the connection and describe the situation you want to evaluate." />
          <div className="space-y-4 p-5">
            <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
            <Field label="Transport connection">
              <select className={selectClass} value={selectedKey} onChange={(e) => handleEdge(e.target.value)}>
                <option value="|||">Select connection</option>
                {activeEdges.map((edge) => <option key={edge.id} value={`${edge.fromCode}|||${edge.toCode}`}>{edge.fromCode} → {edge.toCode} · current limit {edge.capacityKgPerDay.toLocaleString()} kg/day</option>)}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Planned situation"><select className={selectClass} value={scenario.type} onChange={(e) => handleType(e.target.value)}>{types.map((type) => <option key={type} value={type}>{scenarioTypeLabel(type)}</option>)}</select></Field>
              {scenario.type.includes('PERCENT') && <Field label="Change amount"><div className="relative"><input className={`${inputClass} pr-9`} type="number" min="0" max={scenario.type === 'REDUCE_BY_PERCENT' ? 100 : undefined} value={scenario.percent ?? ''} onChange={(e) => setScenario((s) => ({ ...s, percent: e.target.value }))} /><span className="absolute right-3 top-2.5 text-sm text-muted">%</span></div></Field>}
              {scenario.type === 'SET_CAPACITY' && <Field label="Planned daily limit"><div className="relative"><input className={`${inputClass} pr-20`} type="number" min="0" value={scenario.newCapacityKgPerDay ?? ''} onChange={(e) => setScenario((s) => ({ ...s, newCapacityKgPerDay: e.target.value }))} /><span className="absolute right-3 top-2.5 text-xs text-muted">kg/day</span></div></Field>}
            </div>
            <Field label="Plan name"><input className={inputClass} value={scenario.name} onChange={(e) => setScenario((s) => ({ ...s, name: e.target.value }))} /></Field>
            <InlineError message={runError} />
            <div className="grid gap-2 sm:grid-cols-2"><Button onClick={runQuick} disabled={running}><SlidersHorizontal size={16} /> {running ? 'Calculating…' : 'Check This Plan'}</Button><Button variant="secondary" onClick={addToQueue} disabled={running}><Plus size={16} /> Add to Comparison</Button></div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Plan result" title="Current Operation vs Planned Change" description="See the estimated effect on daily factory intake before making a real operational change." />
          {!quickResult ? <EmptyState title="No plan checked yet" description="Choose a connection and planned change to see the expected factory impact." /> : <div className="p-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile label="Current daily throughput" value={quickResult.baselineMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" />
              <MetricTile label="Expected daily throughput" value={quickResult.scenarioMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" />
              <MetricTile label="Daily impact" value={`${quickResult.throughputChangeKgPerDay > 0 ? '+' : ''}${quickResult.throughputChangeKgPerDay.toLocaleString()}`} suffix="kg/day" tone={quickResult.throughputChangeKgPerDay < 0 ? 'red' : 'green'} icon={quickResult.throughputChangeKgPerDay < 0 ? ArrowDownRight : ArrowUpRight} />
              <MetricTile label="Impact direction" value={quickResult.throughputChangeKgPerDay < 0 ? 'LOSS' : quickResult.throughputChangeKgPerDay > 0 ? 'GAIN' : 'NO CHANGE'} tone={quickResult.throughputChangeKgPerDay < 0 ? 'red' : 'green'} />
            </div>
            <div className="mt-5 grid gap-4 rounded-2xl border border-tea-950/10 bg-tea-50/55 p-4 sm:grid-cols-2 xl:grid-cols-4">
              <div><div className="section-kicker">Connection</div><div className="mt-1 font-mono text-sm font-bold">{quickResult.fromCode} → {quickResult.toCode}</div></div>
              <div><div className="section-kicker">Daily limit</div><div className="mt-1 font-mono text-sm font-bold">{quickResult.originalCapacityKgPerDay.toLocaleString()} → {quickResult.scenarioCapacityKgPerDay.toLocaleString()} kg/day</div></div>
              <div><div className="section-kicker">Expected connection use</div><div className="mt-1 font-mono text-sm font-bold">{Number(quickResult.scenarioUtilizationPercent).toFixed(2)}%</div></div>
              <div><div className="section-kicker">Expected status</div><div className="mt-1"><Badge tone={quickResult.modifiedLinkSaturatedAfterScenario ? 'red' : 'green'}>{quickResult.modifiedLinkSaturatedAfterScenario ? 'At capacity' : 'Capacity available'}</Badge></div></div>
            </div>
            <div className={`mt-4 rounded-2xl border p-4 ${quickResult.throughputChangeKgPerDay < 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}><div className={`text-sm font-bold ${quickResult.throughputChangeKgPerDay < 0 ? 'text-red-800' : 'text-emerald-800'}`}>{quickResult.throughputChangeKgPerDay < 0 ? 'This plan reduces factory intake capacity.' : quickResult.throughputChangeKgPerDay > 0 ? 'This plan increases factory intake capacity.' : 'This plan does not change total factory intake capacity.'}</div><p className={`mt-1 text-xs leading-5 ${quickResult.throughputChangeKgPerDay < 0 ? 'text-red-700' : 'text-emerald-700'}`}>Use this result together with cost, maintenance and transport availability before approving the change.</p></div>
          </div>}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[.72fr_1.28fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Plan comparison" title={`Plans to Compare · ${queue.length}`} description="Add multiple disruption or improvement plans and compare them against the same current operation." action={<Button size="sm" onClick={runBatch} disabled={running || !queue.length}><GitCompare size={15} /> Compare Plans</Button>} />
          {queue.length ? <div className="divide-y divide-tea-950/7">{queue.map((s, i) => <div key={s.localId} className="flex items-start gap-3 px-5 py-4"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-tea-50 font-mono text-xs font-bold text-tea-800">{i + 1}</span><div className="min-w-0 flex-1"><div className="truncate text-sm font-bold text-graphite">{s.name}</div><div className="mt-1 text-xs text-muted">{s.fromCode} → {s.toCode} · {scenarioTypeLabel(s.type)}</div></div><button onClick={() => setQueue((q) => q.filter((x) => x.localId !== s.localId))} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" aria-label="Remove plan"><Trash2 size={16} /></button></div>)}</div> : <EmptyState title="No plans added yet" description="Build a plan and add it here to compare several options side by side." />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Expected factory intake" title="Daily Throughput by Plan" description={batchResult ? `Current operation: ${batchResult.baselineMaximumFlowKgPerDay.toLocaleString()} kg/day` : 'Compare your saved plans to generate this chart.'} />
          <div className="h-[360px] p-4">{comparisonData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 70 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="name" angle={-24} textAnchor="end" height={85} tick={{ fontSize: 10 }} interval={0} /><YAxis tick={{ fontSize: 11 }} unit=" kg" /><Tooltip formatter={(v, n) => [`${Number(v).toLocaleString()} kg/day`, n === 'flow' ? 'Planned result' : 'Current operation']} /><Bar dataKey="baseline" fill="#b9c6bd" radius={[5,5,0,0]} /><Bar dataKey="flow" fill="#2F6B4F" radius={[5,5,0,0]} /></BarChart></ResponsiveContainer> : <EmptyState />}</div>
        </Panel>
      </div>
    </>
  )
}
