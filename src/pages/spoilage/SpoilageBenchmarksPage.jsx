import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Gauge, Play, TimerReset } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { spoilageApi, apiErrorMessage } from '../../api/spoilageApi'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTableShell } from '../../components/ui/DataTableShell'
import { InlineError } from '../../components/ui/Feedback'
import { Field, inputClass } from '../../components/ui/FormControls'
import { MetricTile } from '../../components/ui/MetricTile'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'

function algorithmLabel(value) {
  const labels = { bubble: 'Validation Strategy', insertion: 'Incremental Strategy', merge: 'Recommended Strategy', max_heap: 'Live Priority Strategy', timsort_full_resort: 'Full Review Strategy', insertion_order: 'Ordered Intake Strategy' }
  return labels[value] || value || 'Unknown'
}

function latestByAlgorithm(results) {
  const map = new Map()
  ;(results || []).forEach((row) => {
    const previous = map.get(row.algorithm)
    if (!previous || Number(row.id || 0) > Number(previous.id || 0)) map.set(row.algorithm, row)
  })
  return [...map.values()]
}

export default function SpoilageBenchmarksPage() {
  const [tab, setTab] = useState('priority')
  const [sizes, setSizes] = useState('100')
  const [incomingOperations, setIncomingOperations] = useState(50)
  const [priorityResults, setPriorityResults] = useState([])
  const [rankingResults, setRankingResults] = useState([])
  const [presets, setPresets] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    Promise.allSettled([spoilageApi.getBenchmarkPresets(), spoilageApi.getPriorityBenchmarkResults()]).then(([p, r]) => {
      if (p.status === 'fulfilled') setPresets(p.value)
      if (r.status === 'fulfilled') setPriorityResults(r.value || [])
    })
  }, [])

  async function run() {
    setBusy(true); setError(''); setNote('')
    try {
      if (!sizes.trim()) throw new Error('Enter at least one positive dataset size.')
      if (tab === 'priority') {
        const response = await spoilageApi.runPriorityBenchmark(sizes, Number(incomingOperations))
        setPriorityResults((current) => [...current, ...(response?.results || [])])
        setNote(response?.note || '')
      } else {
        if (sizes.split(',').some((s) => Number(s.trim()) > 10000)) setNote('Large validation datasets can take longer to process. These timings come from the actual service run.')
        const response = await spoilageApi.runRankingBenchmark(sizes)
        setRankingResults(response || [])
      }
    } catch (err) { setError(apiErrorMessage(err)) } finally { setBusy(false) }
  }

  const results = tab === 'priority' ? priorityResults : rankingResults
  const rows = useMemo(() => [...results].sort((a, b) => Number(a.inputSize || 0) - Number(b.inputSize || 0) || String(a.algorithm).localeCompare(String(b.algorithm))), [results])
  const latest = useMemo(() => latestByAlgorithm(rows), [rows])
  const fastest = useMemo(() => latest.length ? [...latest].sort((a, b) => Number(a.executionTimeMs || Infinity) - Number(b.executionTimeMs || Infinity))[0] : null, [latest])
  const largest = useMemo(() => rows.reduce((max, r) => Math.max(max, Number(r.inputSize || 0)), 0), [rows])

  const chartData = useMemo(() => {
    const bySize = new Map()
    rows.forEach((r) => {
      const size = Number(r.inputSize || 0)
      const row = bySize.get(size) || { inputSize: size }
      row[r.algorithm] = Number(r.executionTimeMs || 0)
      bySize.set(size, row)
    })
    return [...bySize.values()].sort((a, b) => a.inputSize - b.inputSize)
  }, [rows])
  const algorithms = [...new Set(rows.map((r) => r.algorithm))]

  return (
    <>
      <PageHeader module="QUALITY PROTECTION" engine="PERFORMANCE INSIGHTS" title="Quality Service Performance" description="Review response time, resource use, and priority handling across controlled workload sizes." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Saved / current rows" value={rows.length} icon={BarChart3} caption="Benchmark measurements shown in this workspace" />
        <MetricTile label="Largest input" value={largest || '—'} icon={Gauge} caption="Largest dataset represented in the current results" />
        <MetricTile label="Fastest latest run" value={fastest ? Number(fastest.executionTimeMs).toFixed(3) : '—'} suffix={fastest ? 'ms' : ''} icon={Activity} caption={fastest ? algorithmLabel(fastest.algorithm) : 'Run a performance review to compare strategies'} />
        <MetricTile label="Planning strategies" value={algorithms.length || 3} icon={TimerReset} caption={tab === 'priority' ? 'Live priority · Full review · Ordered intake' : 'Validation · Incremental · Recommended'} />
      </div>

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Performance setup" title="Compare Controlled Workloads" description="Start with a small workload for a quick health check, then use larger presets when you need a deeper capacity review." />
        <div className="p-5">
          <div className="mb-5 flex w-fit rounded-xl border border-tea-950/10 bg-white p-1"><button onClick={() => setTab('priority')} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'priority' ? 'bg-tea-950 text-white' : 'text-muted hover:bg-tea-50'}`}>Live Priority</button><button onClick={() => setTab('ranking')} className={`rounded-lg px-4 py-2 text-xs font-bold ${tab === 'ranking' ? 'bg-tea-950 text-white' : 'text-muted hover:bg-tea-50'}`}>Risk Ranking</button></div>
          <div className="grid gap-4 lg:grid-cols-[1fr_.6fr_auto] lg:items-end"><Field label="Workload sizes" hint="Comma-separated positive sizes. Start with 100."><input className={inputClass} value={sizes} onChange={(e) => setSizes(e.target.value)} /></Field>{tab === 'priority' ? <Field label="Incoming batches" hint="Number of new arrivals processed in each run."><input className={inputClass} type="number" min="1" value={incomingOperations} onChange={(e) => setIncomingOperations(e.target.value)} /></Field> : <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-900">Large validation workloads may take longer. Use 100 for routine checks.</div>}<Button onClick={run} disabled={busy}><Play size={15} /> {busy ? 'Running Review…' : 'Run Performance Review'}</Button></div>
          {presets && tab === 'priority' && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted"><span className="font-bold text-graphite">Workload presets:</span>{['small','medium','large'].map((key) => <button key={key} onClick={() => setSizes(String(presets[key]))} className="rounded-lg border border-tea-950/10 bg-white px-2.5 py-1.5 font-semibold capitalize hover:bg-tea-50">{key}: {Number(presets[key]).toLocaleString()}</button>)}</div>}
          {error && <div className="mt-4"><InlineError message={error} /></div>}
          {note && <div className="mt-4 rounded-xl border border-tea-950/10 bg-tea-50 px-3 py-2.5 text-xs leading-5 text-muted">{note}</div>}
        </div>
      </Panel>

      {rows.length > 0 && <div className="mb-6 grid gap-6 xl:grid-cols-2"><Panel className="overflow-hidden"><PanelHeader eyebrow="Time efficiency" title="Response Time vs Workload Size" description="Measured by the connected service; lower is faster." /><div className="h-[320px] p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="inputSize" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend />{algorithms.map((algorithm, index) => <Line key={algorithm} type="monotone" dataKey={algorithm} name={algorithmLabel(algorithm)} stroke={`hsl(${145 + index * 45} 35% ${32 + index * 8}%)`} strokeWidth={2} dot={{ r: 3 }} />)}</LineChart></ResponsiveContainer></div></Panel><Panel className="overflow-hidden"><PanelHeader eyebrow="Resource use" title="Latest Memory Measurements" description="Measured resource change for the latest visible run of each strategy." /><div className="h-[320px] p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={latest.map((r) => ({ algorithm: algorithmLabel(r.algorithm), memoryMb: Number(r.memoryMb || 0) }))}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="algorithm" tick={{ fontSize: 10 }} interval={0} /><YAxis tick={{ fontSize: 11 }} label={{ value: 'MB', angle: -90, position: 'insideLeft' }} /><Tooltip /><Bar dataKey="memoryMb" name="Memory MB" fill="#2F6B4F" radius={[6,6,0,0]} /></BarChart></ResponsiveContainer></div></Panel></div>}

      <Panel className="overflow-hidden">
        <PanelHeader eyebrow="Measured results" title="Performance Results" description="Every value shown here comes directly from the connected quality service." />
        {rows.length ? <DataTableShell><table className="min-w-[900px] w-full text-left text-sm"><thead className="bg-tea-50/75 text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Area</th><th className="px-4 py-3">Strategy</th><th className="px-4 py-3">Workload</th><th className="px-4 py-3">Response</th><th className="px-4 py-3">Memory</th><th className="px-4 py-3">Result Summary</th><th className="px-4 py-3">Run At</th></tr></thead><tbody className="divide-y divide-tea-950/7">{rows.map((r, index) => <tr key={`${r.id || index}-${r.algorithm}-${r.inputSize}`} className="hover:bg-tea-50/35"><td className="px-4 py-3"><Badge tone="green">Quality</Badge></td><td className="px-4 py-3 font-bold text-graphite">{algorithmLabel(r.algorithm)}</td><td className="px-4 py-3 font-mono">{Number(r.inputSize || 0).toLocaleString()}</td><td className="px-4 py-3 font-mono font-bold">{Number(r.executionTimeMs || 0).toFixed(4)} ms</td><td className="px-4 py-3 font-mono">{Number(r.memoryMb || 0).toFixed(4)} MB</td><td className="max-w-[320px] px-4 py-3 font-mono text-xs text-muted">{r.solutionMetric || '—'}</td><td className="px-4 py-3 text-xs text-muted">{r.runAt ? new Date(r.runAt).toLocaleString() : '—'}</td></tr>)}</tbody></table></DataTableShell> : <div className="px-5 py-10 text-center text-sm text-muted">Run a quality-service performance review to create measured results.</div>}
      </Panel>
    </>
  )
}
