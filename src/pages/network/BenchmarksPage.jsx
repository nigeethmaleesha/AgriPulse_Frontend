import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Clock3, Database, MemoryStick, Play, RefreshCw } from 'lucide-react'
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { Field, inputClass } from '../../components/ui/FormControls'
import { methodDisplayName } from '../../utils/displayLabels'

const defaultForm = { nodeCount: 20, edgeCount: 30, seed: 42, minCapacityKgPerDay: 100, maxCapacityKgPerDay: 2000, saveResult: true, topN: 10 }

export default function BenchmarksPage() {
  const [presets, setPresets] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [maxResult, setMaxResult] = useState(null)
  const [bottleneckResult, setBottleneckResult] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [p, r] = await Promise.all([networkApi.getBenchmarkPresets(), networkApi.getMaxFlowResults()])
      setPresets(p || []); setRecent(r || [])
    } catch (err) { setError(apiErrorMessage(err)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const payload = () => ({
    nodeCount: Number(form.nodeCount), edgeCount: Number(form.edgeCount), seed: Number(form.seed),
    minCapacityKgPerDay: Number(form.minCapacityKgPerDay), maxCapacityKgPerDay: Number(form.maxCapacityKgPerDay),
    saveResult: Boolean(form.saveResult), topN: Number(form.topN),
  })
  const runMax = async () => { setRunning('max'); setError(''); try { setMaxResult(await networkApi.runMaxFlowBenchmark(payload())); if (form.saveResult) await loadRecentOnly() } catch (err) { setError(apiErrorMessage(err)) } finally { setRunning('') } }
  const runBottleneck = async () => { setRunning('bottleneck'); setError(''); try { setBottleneckResult(await networkApi.runBottleneckBenchmark(payload())); if (form.saveResult) await loadRecentOnly() } catch (err) { setError(apiErrorMessage(err)) } finally { setRunning('') } }
  const loadRecentOnly = async () => { try { setRecent(await networkApi.getMaxFlowResults()) } catch { /* test already succeeded */ } }
  const setPreset = (p) => setForm((f) => ({ ...f, nodeCount: p.nodeCount, edgeCount: p.edgeCount }))

  const chartData = useMemo(() => {
    const groups = new Map()
    recent.slice().reverse().forEach((r) => {
      const key = `${r.inputSize}/${r.edgeCount}`
      const row = groups.get(key) || { dataset: key, inputSize: r.inputSize }
      row[methodDisplayName(r.algorithm)] = r.executionTimeMs
      groups.set(key, row)
    })
    return [...groups.values()].sort((a,b) => a.inputSize - b.inputSize)
  }, [recent])
  const checkNames = useMemo(() => [...new Set(chartData.flatMap((r) => Object.keys(r).filter((k) => !['dataset','inputSize'].includes(k))))], [chartData])
  const lineStrokes = ['#123D32', '#C58A2C', '#2F6B4F', '#7b6f8d']

  if (loading) return <Panel><LoadingState label="Loading system test settings and saved history…" /></Panel>

  return <>
    <PageHeader engine="ADMINISTRATOR VIEW" title="System Performance" description="Internal reliability testing for larger supply networks. This page is intended for administrators and project evaluation, not daily factory decisions." action={<Button variant="secondary" size="sm" onClick={load}><RefreshCw size={15} /> Refresh History</Button>} />

    <div className="grid gap-6 2xl:grid-cols-[.72fr_1.28fr]">
      <Panel className="h-fit overflow-hidden">
        <PanelHeader eyebrow="Test network" title="Performance Test Configuration" description="Create a repeatable test network to check calculation speed and memory use as the network grows." />
        <div className="space-y-4 p-5">
          {presets.length > 0 && <div><div className="mb-2 text-xs font-bold uppercase tracking-[.09em] text-muted">Suggested test sizes</div><div className="grid grid-cols-3 gap-2">{presets.map((p) => <button key={`${p.nodeCount}-${p.edgeCount}`} onClick={() => setPreset(p)} className={`rounded-xl border px-2 py-3 text-center transition ${Number(form.nodeCount) === p.nodeCount && Number(form.edgeCount) === p.edgeCount ? 'border-tea-700 bg-tea-50' : 'border-tea-950/10 bg-white hover:bg-tea-50/50'}`}><div className="font-mono text-sm font-bold">{p.nodeCount}</div><div className="mt-1 text-[10px] text-muted">locations</div><div className="mt-1 font-mono text-[11px] font-semibold text-tea-700">{p.edgeCount} connections</div></button>)}</div></div>}
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Location count"><input className={inputClass} type="number" min="2" max="1000" value={form.nodeCount} onChange={(e) => setForm({ ...form, nodeCount: e.target.value })} /></Field><Field label="Connection count"><input className={inputClass} type="number" min="1" max="10000" value={form.edgeCount} onChange={(e) => setForm({ ...form, edgeCount: e.target.value })} /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Minimum daily limit"><input className={inputClass} type="number" min="1" value={form.minCapacityKgPerDay} onChange={(e) => setForm({ ...form, minCapacityKgPerDay: e.target.value })} /></Field><Field label="Maximum daily limit"><input className={inputClass} type="number" min="2" value={form.maxCapacityKgPerDay} onChange={(e) => setForm({ ...form, maxCapacityKgPerDay: e.target.value })} /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Test data reference"><input className={inputClass} type="number" value={form.seed} onChange={(e) => setForm({ ...form, seed: e.target.value })} /></Field><Field label="Priority results to inspect"><input className={inputClass} type="number" min="1" max="100" value={form.topN} onChange={(e) => setForm({ ...form, topN: e.target.value })} /></Field></div>
          <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.saveResult} onChange={(e) => setForm({ ...form, saveResult: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Save test history</b><span className="block text-xs text-muted">Keep performance results for later comparison.</span></span></label>
          <InlineError message={error} />
          <div className="grid gap-2"><Button onClick={runMax} disabled={Boolean(running)}><Play size={16} /> {running === 'max' ? 'Running capacity test…' : 'Run Throughput Calculation Test'}</Button><Button variant="secondary" onClick={runBottleneck} disabled={Boolean(running)}><Activity size={16} /> {running === 'bottleneck' ? 'Running risk tests…' : 'Run Connection Risk Test'}</Button></div>
          <p className="text-xs leading-5 text-muted">Very large disruption-impact tests can take longer because the system checks many possible connection failures.</p>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Throughput calculation" title="Capacity Test Result" description="Measures how quickly the system calculates daily network carrying capacity on the generated test network." />
          {maxResult ? <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"><MetricTile label="Calculated capacity" value={maxResult.maximumFlowKgPerDay.toLocaleString()} suffix="kg/day" icon={Activity} /><MetricTile label="Calculation time" value={Number(maxResult.executionTimeMs).toFixed(4)} suffix="ms" icon={Clock3} /><MetricTile label="Estimated memory" value={Number(maxResult.estimatedAlgorithmMemoryMb).toFixed(4)} suffix="MB" icon={MemoryStick} /><MetricTile label="Processing steps" value={maxResult.augmentingPathCount} icon={Database} /></div> : <EmptyState title="No throughput test in this session" description="Choose a test size and run the throughput calculation test." />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Connection risk checks" title="Risk Review Performance" description="Compares the internal checks used to identify full connections, priority connections and disruption impact." />
          {bottleneckResult ? <div><div className="grid gap-4 p-5 sm:grid-cols-2"><MetricTile label="Test network capacity" value={bottleneckResult.baselineMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" /><MetricTile label="Test size" value={`${bottleneckResult.nodeCount}/${bottleneckResult.edgeCount}`} suffix="locations/connections" /></div><div className="overflow-x-auto border-t border-tea-950/8"><table className="w-full min-w-[760px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Internal check</th><th className="px-5 py-3">Calculation time</th><th className="px-5 py-3">Estimated memory</th><th className="px-5 py-3">Results returned</th></tr></thead><tbody className="divide-y divide-tea-950/7">{bottleneckResult.methods.map((m) => <tr key={m.method}><td className="px-5 py-3.5 font-semibold">{methodDisplayName(m.method)}</td><td className="px-5 py-3.5 font-mono">{Number(m.executionTimeMs).toFixed(4)} ms</td><td className="px-5 py-3.5 font-mono">{Number(m.estimatedPeakAlgorithmMemoryMb).toFixed(4)} MB</td><td className="px-5 py-3.5 font-mono">{m.resultCount}</td></tr>)}</tbody></table></div></div> : <EmptyState title="No risk performance test in this session" description="Run the connection risk test to compare internal calculation performance." />}
        </Panel>
      </div>
    </div>

    <Panel className="mt-6 overflow-hidden">
      <PanelHeader eyebrow="Saved history" title="Calculation-Time History" description="Use this chart to see how system response time changes as the supply network becomes larger." />
      <div className="h-[360px] p-4">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 20, left: 8, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="dataset" label={{ value: 'locations / connections', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} label={{ value: 'milliseconds', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend verticalAlign="top" height={36} />{checkNames.map((name, i) => <Line key={name} type="monotone" dataKey={name} stroke={lineStrokes[i % lineStrokes.length]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />)}</LineChart></ResponsiveContainer> : <EmptyState title="No saved performance history" description="Enable Save test history and run a performance test." icon={BarChart3} />}</div>
      {recent.length > 0 && <div className="overflow-x-auto border-t border-tea-950/8"><table className="w-full min-w-[980px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Check</th><th className="px-4 py-3">Test size</th><th className="px-4 py-3">Calculation time</th><th className="px-4 py-3">Memory</th><th className="px-4 py-3">Capacity result</th><th className="px-4 py-3">Recorded</th></tr></thead><tbody className="divide-y divide-tea-950/7">{recent.slice(0, 15).map((r) => <tr key={r.id}><td className="px-4 py-3 font-semibold">{methodDisplayName(r.algorithm)}</td><td className="px-4 py-3 font-mono text-xs">{r.inputSize} / {r.edgeCount}</td><td className="px-4 py-3 font-mono">{Number(r.executionTimeMs).toFixed(4)} ms</td><td className="px-4 py-3 font-mono">{Number(r.memoryMb).toFixed(4)} MB</td><td className="px-4 py-3 font-mono font-bold">{Number(r.solutionMetric).toLocaleString()}</td><td className="px-4 py-3 text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
    </Panel>
  </>
}
