import { useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Gauge, Play, Scale, Timer } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { schedulingApi } from '../../api/schedulingApi'
import { apiErrorMessage } from '../../api/client'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricTile } from '../../components/ui/MetricTile'
import { DataTableShell } from '../../components/ui/DataTableShell'
import { EmptyState, InlineError } from '../../components/ui/Feedback'
import { Field, inputClass } from '../../components/ui/FormControls'

function parseSizes(text) {
  return [...new Set(text.split(',').map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b)
}

function betterMethod(row) {
  if (row.geneticTotalValue === row.annealingTotalValue) return 'TIE'
  return row.geneticTotalValue > row.annealingTotalValue ? 'GENETIC_ALGORITHM' : 'SIMULATED_ANNEALING'
}

export default function SchedulingBenchmarksPage() {
  const [presets, setPresets] = useState([])
  const [sizes, setSizes] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    schedulingApi.getBenchmarkPresets()
      .then((p) => { setPresets(p || []); setSizes((p || []).join(', ')) })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const toggleSize = (size) => {
    const current = parseSizes(sizes)
    const has = current.includes(size)
    const next = has ? current.filter((s) => s !== size) : [...current, size].sort((a, b) => a - b)
    setSizes(next.join(', '))
  }

  const run = async () => {
    const requested = parseSizes(sizes)
    if (!requested.length) return setError('Enter at least one positive task count, for example 10, 30, 80.')
    setRunning(true); setError('')
    try {
      const result = await schedulingApi.runBenchmark(requested)
      setRows((current) => {
        const byTaskCount = new Map(current.map((r) => [r.taskCount, r]))
        ;(result || []).forEach((r) => byTaskCount.set(r.taskCount, r))
        return [...byTaskCount.values()].sort((a, b) => a.taskCount - b.taskCount)
      })
    } catch (err) { setError(apiErrorMessage(err)) } finally { setRunning(false) }
  }

  const largest = useMemo(() => rows.reduce((max, r) => Math.max(max, r.taskCount), 0), [rows])
  const fastestOverall = useMemo(() => {
    if (!rows.length) return null
    return rows.reduce((best, r) => {
      const rowBest = Math.min(r.geneticExecutionTimeMs, r.annealingExecutionTimeMs)
      return !best || rowBest < best.timeMs ? { timeMs: rowBest, method: r.geneticExecutionTimeMs <= r.annealingExecutionTimeMs ? 'Genetic Algorithm' : 'Simulated Annealing', taskCount: r.taskCount } : best
    }, null)
  }, [rows])
  const avgDifference = useMemo(() => rows.length ? rows.reduce((sum, r) => sum + r.differencePercent, 0) / rows.length : null, [rows])

  const timeChartData = useMemo(() => rows.map((r) => ({ taskCount: r.taskCount, 'Genetic Algorithm': r.geneticExecutionTimeMs, 'Simulated Annealing': r.annealingExecutionTimeMs })), [rows])
  const valueChartData = useMemo(() => rows.map((r) => ({ taskCount: r.taskCount, genetic: r.geneticTotalValue, annealing: r.annealingTotalValue })), [rows])

  return <>
    <PageHeader module="FACTORY PROCESSING" engine="ADMINISTRATOR VIEW" title="Scheduling Algorithm Performance" description="Run the actual Genetic Algorithm and Simulated Annealing schedulers on synthetically generated task/worker/machine scenarios and compare calculation time and schedule quality as the task count grows." />

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Runs in this session" value={rows.length} icon={BarChart3} caption="Task-count scenarios measured so far" />
      <MetricTile label="Largest task count tested" value={largest || '—'} icon={Gauge} />
      <MetricTile label="Fastest measured run" value={fastestOverall ? fastestOverall.timeMs.toFixed(2) : '—'} suffix={fastestOverall ? 'ms' : ''} icon={Timer} caption={fastestOverall ? `${fastestOverall.method} · ${fastestOverall.taskCount} tasks` : 'Run a benchmark to compare'} />
      <MetricTile label="Average plan difference" value={avgDifference != null ? `${avgDifference.toFixed(1)}%` : '—'} icon={Scale} caption="How far apart GA and SA plans land, on average" />
    </div>

    <Panel className="mb-6 overflow-hidden">
      <PanelHeader eyebrow="Benchmark setup" title="Run Synthetic Scaling Test" description="Each task count generates a fresh synthetic scenario (tasks, workers, machines, outages) and runs both optimizers on it. Results accumulate below so you can compare several sizes." />
      <div className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <Field label="Task counts to test" hint="Comma-separated positive numbers.">
            <input className={inputClass} value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="10, 30, 80" disabled={loading} />
          </Field>
          <Button onClick={run} disabled={running || loading}><Play size={15} /> {running ? 'Running benchmark…' : 'Run Benchmark'}</Button>
        </div>
        {presets.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="font-bold text-graphite">Coursework presets:</span>
          {presets.map((p) => <button key={p} onClick={() => toggleSize(p)} className={`rounded-lg border px-2.5 py-1.5 font-semibold transition ${parseSizes(sizes).includes(p) ? 'border-tea-700 bg-tea-50 text-tea-900' : 'border-tea-950/10 bg-white hover:bg-tea-50/50'}`}>{p} tasks</button>)}
        </div>}
        {error && <div className="mt-4"><InlineError message={error} /></div>}
      </div>
    </Panel>

    {rows.length > 0 && <div className="mb-6 grid gap-6 xl:grid-cols-2">
      <Panel className="overflow-hidden">
        <PanelHeader eyebrow="Time efficiency" title="Calculation Time vs Task Count" description="Measured by the Java backend for each optimizer; lower is faster." />
        <div className="h-[320px] p-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={timeChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="taskCount" tick={{ fontSize: 11 }} label={{ value: 'tasks', position: 'insideBottom', offset: -3 }} /><YAxis tick={{ fontSize: 11 }} label={{ value: 'ms', angle: -90, position: 'insideLeft' }} /><Tooltip /><Legend /><Line type="monotone" dataKey="Genetic Algorithm" stroke="#123D32" strokeWidth={2.5} dot={{ r: 3 }} /><Line type="monotone" dataKey="Simulated Annealing" stroke="#C58A2C" strokeWidth={2.5} dot={{ r: 3 }} /></LineChart></ResponsiveContainer></div>
      </Panel>
      <Panel className="overflow-hidden">
        <PanelHeader eyebrow="Solution quality" title="Total Priority Value vs Task Count" description="Higher means more (and higher-priority) tasks were successfully placed into the schedule." />
        <div className="h-[320px] p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={valueChartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e7e3" /><XAxis dataKey="taskCount" tick={{ fontSize: 11 }} label={{ value: 'tasks', position: 'insideBottom', offset: -3 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Legend formatter={(v) => v === 'genetic' ? 'Genetic Algorithm' : 'Simulated Annealing'} /><Bar dataKey="genetic" fill="#123D32" radius={[5,5,0,0]} name="genetic" /><Bar dataKey="annealing" fill="#C58A2C" radius={[5,5,0,0]} name="annealing" /></BarChart></ResponsiveContainer></div>
      </Panel>
    </div>}

    <Panel className="overflow-hidden">
      <PanelHeader eyebrow="Measured evidence" title="Benchmark Results" description="These values are returned directly by the backend for each synthetic scenario. No numbers are generated in the frontend." />
      {rows.length ? <DataTableShell><table className="min-w-[1040px] w-full text-left text-sm"><thead className="bg-tea-50/75 text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-4 py-3">Tasks</th><th className="px-4 py-3">Workers</th><th className="px-4 py-3">Machines</th><th className="px-4 py-3">GA time</th><th className="px-4 py-3">SA time</th><th className="px-4 py-3">GA value</th><th className="px-4 py-3">SA value</th><th className="px-4 py-3">GA placed</th><th className="px-4 py-3">SA placed</th><th className="px-4 py-3">Better plan</th></tr></thead><tbody className="divide-y divide-tea-950/7">{rows.map((r) => { const better = betterMethod(r); return <tr key={r.taskCount} className="hover:bg-tea-50/35"><td className="px-4 py-3 font-mono font-bold">{r.taskCount}</td><td className="px-4 py-3 font-mono">{r.workerCount}</td><td className="px-4 py-3 font-mono">{r.machineCount}</td><td className="px-4 py-3 font-mono">{r.geneticExecutionTimeMs.toFixed(3)} ms</td><td className="px-4 py-3 font-mono">{r.annealingExecutionTimeMs.toFixed(3)} ms</td><td className="px-4 py-3 font-mono">{r.geneticTotalValue}</td><td className="px-4 py-3 font-mono">{r.annealingTotalValue}</td><td className="px-4 py-3 font-mono">{r.geneticTasksScheduled}/{r.taskCount}</td><td className="px-4 py-3 font-mono">{r.annealingTasksScheduled}/{r.taskCount}</td><td className="px-4 py-3"><Badge tone={better === 'TIE' ? 'neutral' : 'green'}>{better === 'TIE' ? 'Tie' : better === 'GENETIC_ALGORITHM' ? 'Genetic Algorithm' : 'Simulated Annealing'} · {r.differencePercent.toFixed(1)}%</Badge></td></tr> })}</tbody></table></DataTableShell> : <EmptyState title="No benchmark runs yet" description="Choose task counts above and run the benchmark to create measured performance evidence." icon={Activity} />}
    </Panel>
  </>
}
