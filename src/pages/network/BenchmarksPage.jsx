import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Clock3, Database, MemoryStick, Play, RefreshCw } from 'lucide-react'
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { Field, inputClass } from '../../components/ui/FormControls'

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
  const loadRecentOnly = async () => { try { setRecent(await networkApi.getMaxFlowResults()) } catch { /* benchmark result already succeeded */ } }
  const setPreset = (p) => setForm((f) => ({ ...f, nodeCount: p.nodeCount, edgeCount: p.edgeCount }))

  const chartData = useMemo(() => {
    const groups = new Map()
    recent.slice().reverse().forEach((r) => {
      const key = `${r.inputSize}/${r.edgeCount}`
      const row = groups.get(key) || { dataset: key, inputSize: r.inputSize }
      const short = r.algorithm.includes('synthetic') || r.algorithm.includes('DFS') ? 'Ford-Fulkerson' : r.algorithm.includes('Linear') ? 'Linear scan' : r.algorithm.includes('heap') || r.algorithm.includes('Heap') ? 'Max-heap' : r.algorithm.includes('closure') ? 'Closure reruns' : r.algorithm
      row[short] = r.executionTimeMs
      groups.set(key, row)
    })
    return [...groups.values()].sort((a,b) => a.inputSize - b.inputSize)
  }, [recent])
  const algNames = useMemo(() => [...new Set(chartData.flatMap((r) => Object.keys(r).filter((k) => !['dataset','inputSize'].includes(k))))], [chartData])
  const lineStrokes = ['#123D32', '#C58A2C', '#2F6B4F', '#7b6f8d']

  if (loading) return <Panel><LoadingState label="Loading benchmark presets and saved evidence…" /></Panel>

  return <>
    <PageHeader engine="EXPERIMENTAL EVALUATION" title="Algorithm Benchmarks" description="Run the official Module 3 small, medium and large synthetic datasets. Member 5 measures Ford-Fulkerson; Member 6 compares linear saturated-edge scanning, max-heap utilization ranking and exact closure-impact reruns." action={<Button variant="secondary" size="sm" onClick={load}><RefreshCw size={15} /> Refresh Evidence</Button>} />

    <div className="grid gap-6 2xl:grid-cols-[.72fr_1.28fr]">
      <Panel className="h-fit overflow-hidden">
        <PanelHeader eyebrow="Synthetic dataset" title="Benchmark Configuration" description="The same generator and capacity range are sent to the Spring Boot benchmark endpoints." />
        <div className="space-y-4 p-5">
          {presets.length > 0 && <div><div className="mb-2 text-xs font-bold uppercase tracking-[.09em] text-muted">Coursework presets</div><div className="grid grid-cols-3 gap-2">{presets.map((p) => <button key={`${p.nodeCount}-${p.edgeCount}`} onClick={() => setPreset(p)} className={`rounded-xl border px-2 py-3 text-center transition ${Number(form.nodeCount) === p.nodeCount && Number(form.edgeCount) === p.edgeCount ? 'border-tea-700 bg-tea-50' : 'border-tea-950/10 bg-white hover:bg-tea-50/50'}`}><div className="font-mono text-sm font-bold">{p.nodeCount}</div><div className="mt-1 text-[10px] text-muted">nodes</div><div className="mt-1 font-mono text-[11px] font-semibold text-tea-700">{p.edgeCount} edges</div></button>)}</div></div>}
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Node count"><input className={inputClass} type="number" min="2" max="1000" value={form.nodeCount} onChange={(e) => setForm({ ...form, nodeCount: e.target.value })} /></Field><Field label="Edge count"><input className={inputClass} type="number" min="1" max="10000" value={form.edgeCount} onChange={(e) => setForm({ ...form, edgeCount: e.target.value })} /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Min capacity"><input className={inputClass} type="number" min="1" value={form.minCapacityKgPerDay} onChange={(e) => setForm({ ...form, minCapacityKgPerDay: e.target.value })} /></Field><Field label="Max capacity"><input className={inputClass} type="number" min="2" value={form.maxCapacityKgPerDay} onChange={(e) => setForm({ ...form, maxCapacityKgPerDay: e.target.value })} /></Field></div>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Seed"><input className={inputClass} type="number" value={form.seed} onChange={(e) => setForm({ ...form, seed: e.target.value })} /></Field><Field label="Member 6 Top N"><input className={inputClass} type="number" min="1" max="100" value={form.topN} onChange={(e) => setForm({ ...form, topN: e.target.value })} /></Field></div>
          <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.saveResult} onChange={(e) => setForm({ ...form, saveResult: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Save benchmark result</b><span className="block text-xs text-muted">Persist evidence in algorithm_test_results.</span></span></label>
          <InlineError message={error} />
          <div className="grid gap-2"><Button onClick={runMax} disabled={Boolean(running)}><Play size={16} /> {running === 'max' ? 'Running Ford-Fulkerson…' : 'Run Member 5 Benchmark'}</Button><Button variant="secondary" onClick={runBottleneck} disabled={Boolean(running)}><Activity size={16} /> {running === 'bottleneck' ? 'Comparing methods…' : 'Run Member 6 Benchmark'}</Button></div>
          <p className="text-xs leading-5 text-muted">Large 500/2000 bottleneck tests can take longer because exact closure-impact ranking reruns maximum flow for many edges.</p>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Member 5" title="Ford-Fulkerson Benchmark Result" description="POST /api/network/benchmark" />
          {maxResult ? <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4"><MetricTile label="Max Flow" value={maxResult.maximumFlowKgPerDay.toLocaleString()} suffix="kg/day" icon={Activity} /><MetricTile label="Execution" value={Number(maxResult.executionTimeMs).toFixed(4)} suffix="ms" icon={Clock3} /><MetricTile label="Est. Memory" value={Number(maxResult.estimatedAlgorithmMemoryMb).toFixed(4)} suffix="MB" icon={MemoryStick} /><MetricTile label="Augmenting Paths" value={maxResult.augmentingPathCount} icon={Database} /></div> : <EmptyState title="No Member 5 benchmark in this session" description="Select a preset and run the Ford-Fulkerson benchmark." />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Member 6" title="Bottleneck Method Comparison" description="POST /api/network/benchmark/bottlenecks · all candidate methods run on the same generated graph." />
          {bottleneckResult ? <div><div className="grid gap-4 p-5 sm:grid-cols-2"><MetricTile label="Baseline Flow" value={bottleneckResult.baselineMaximumFlowKgPerDay.toLocaleString()} suffix="kg/day" /><MetricTile label="Dataset" value={`${bottleneckResult.nodeCount}/${bottleneckResult.edgeCount}`} suffix="nodes/edges" /></div><div className="overflow-x-auto border-t border-tea-950/8"><table className="w-full min-w-[760px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Method</th><th className="px-5 py-3">Execution</th><th className="px-5 py-3">Est. Memory</th><th className="px-5 py-3">Results</th></tr></thead><tbody className="divide-y divide-tea-950/7">{bottleneckResult.methods.map((m) => <tr key={m.method}><td className="px-5 py-3.5 font-semibold">{m.method}</td><td className="px-5 py-3.5 font-mono">{Number(m.executionTimeMs).toFixed(4)} ms</td><td className="px-5 py-3.5 font-mono">{Number(m.estimatedPeakAlgorithmMemoryMb).toFixed(4)} MB</td><td className="px-5 py-3.5 font-mono">{m.resultCount}</td></tr>)}</tbody></table></div><div className="border-t border-tea-950/8 bg-tea-50/45 px-5 py-3 text-xs leading-5 text-muted">{bottleneckResult.note}</div></div> : <EmptyState title="No Member 6 benchmark in this session" description="Run the bottleneck benchmark to compare the three assigned approaches." />}
        </Panel>
      </div>
    </div>

    <Panel className="mt-6 overflow-hidden">
      <PanelHeader eyebrow="Persistent evidence" title="Saved Execution-Time History" description="Loaded from GET /api/network/max-flow/results. These values come from actual backend runs stored in PostgreSQL." />
      <div className="h-[360px] p-4">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 20, left: 8, bottom: 25 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="dataset" label={{ value: 'nodes / edges', position: 'insideBottom', offset: -5 }} tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend verticalAlign="top" height={36} />{algNames.map((name, i) => <Line key={name} type="monotone" dataKey={name} stroke={lineStrokes[i % lineStrokes.length]} strokeWidth={2.5} dot={{ r: 3 }} connectNulls />)}</LineChart></ResponsiveContainer> : <EmptyState title="No saved benchmark evidence" description="Enable Save benchmark result and run a test to build the evidence chart." icon={BarChart3} />}</div>
      {recent.length > 0 && <div className="overflow-x-auto border-t border-tea-950/8"><table className="w-full min-w-[980px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Module</th><th className="px-4 py-3">Algorithm</th><th className="px-4 py-3">Dataset</th><th className="px-4 py-3">Execution</th><th className="px-4 py-3">Memory</th><th className="px-4 py-3">Solution Metric</th><th className="px-4 py-3">Recorded</th></tr></thead><tbody className="divide-y divide-tea-950/7">{recent.slice(0, 15).map((r) => <tr key={r.id}><td className="px-4 py-3 text-xs font-semibold text-muted">{r.module}</td><td className="px-4 py-3 font-semibold">{r.algorithm}</td><td className="px-4 py-3 font-mono text-xs">{r.inputSize} / {r.edgeCount}</td><td className="px-4 py-3 font-mono">{Number(r.executionTimeMs).toFixed(4)} ms</td><td className="px-4 py-3 font-mono">{Number(r.memoryMb).toFixed(4)} MB</td><td className="px-4 py-3 font-mono font-bold">{Number(r.solutionMetric).toLocaleString()}</td><td className="px-4 py-3 text-xs text-muted">{new Date(r.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
    </Panel>
  </>
}
