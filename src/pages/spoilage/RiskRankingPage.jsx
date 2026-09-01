import { useCallback, useEffect, useMemo, useState } from 'react'
import { Braces, Clock3, Plus, RefreshCw, ThermometerSun, Waves } from 'lucide-react'
import { spoilageApi, apiErrorMessage } from '../../api/spoilageApi'
import { useSpoilage } from '../../context/SpoilageContext'
import { BatchForm } from '../../components/spoilage/BatchForm'
import { BatchTable, waitingHours } from '../../components/spoilage/BatchTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { MetricTile } from '../../components/ui/MetricTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'

const methods = [
  { id: 'merge', label: 'Merge Sort', complexity: 'O(n log n)', note: 'Recommended for the full ranking' },
  { id: 'insertion', label: 'Insertion Sort', complexity: 'O(n²)', note: 'Useful when data is nearly ordered' },
  { id: 'bubble', label: 'Bubble Sort', complexity: 'O(n²)', note: 'Simple coursework comparison baseline' },
]

export default function RiskRankingPage() {
  const { refreshStatus } = useSpoilage()
  const [method, setMethod] = useState('merge')
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [calculatedAt, setCalculatedAt] = useState(null)

  const loadRanking = useCallback(async (selected = method) => {
    setLoading(true)
    setError('')
    try {
      const data = await spoilageApi.getRanking(selected)
      setBatches(data || [])
      setCalculatedAt(new Date())
      refreshStatus().catch(() => undefined)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [method, refreshStatus])

  useEffect(() => { loadRanking('merge') }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function createBatch(payload) {
    setSaving(true)
    setActionError('')
    try {
      await spoilageApi.addBatch(payload)
      setAddOpen(false)
      await loadRanking(method)
    } catch (err) {
      setActionError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const highest = batches[0]
  const avgRisk = useMemo(() => batches.length ? batches.reduce((sum, b) => sum + Number(b.riskScore || 0), 0) / batches.length : 0, [batches])
  const longestWait = useMemo(() => Math.max(0, ...batches.map((b) => waitingHours(b.harvestTime) || 0)), [batches])

  return (
    <>
      <PageHeader module="M04 · SPOILAGE INTELLIGENCE" engine={`ENGINE · ${methods.find((m) => m.id === method)?.label.toUpperCase()}`} title="Harvest Batch Risk Ranking" description="Rank every ready tea batch by the backend-calculated spoilage risk score so collection teams can see which harvested tea should move first." action={<Button onClick={() => setAddOpen(true)}><Plus size={16} /> Add Harvest Batch</Button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Ready batches" value={batches.length} icon={Braces} caption="Batches currently returned by the ranking API" />
        <MetricTile label="Highest risk score" value={highest?.riskScore ?? '—'} icon={ThermometerSun} tone="red" caption={highest ? `Batch B-${highest.id} currently ranks first` : 'No ready batch is ranked'} />
        <MetricTile label="Average risk score" value={batches.length ? avgRisk.toFixed(2) : '—'} icon={Waves} caption="Average of the current ranked ready batches" />
        <MetricTile label="Longest wait" value={batches.length ? longestWait.toFixed(1) : '—'} suffix={batches.length ? 'hours' : ''} icon={Clock3} tone="amber" caption={calculatedAt ? `Calculated ${calculatedAt.toLocaleTimeString()}` : 'Waiting time is calculated from harvest time'} />
      </div>

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Ranking engine" title="Choose the comparison method" description="All three methods use the same Member 7 risk formula. The selected algorithm changes only how the scored batches are ordered." action={<Button variant="secondary" size="sm" onClick={() => loadRanking(method)} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recalculate Ranking</Button>} />
        <div className="grid gap-3 p-5 lg:grid-cols-3">
          {methods.map((item) => <button key={item.id} onClick={() => { setMethod(item.id); loadRanking(item.id) }} className={`rounded-2xl border p-4 text-left transition ${method === item.id ? 'border-tea-700/35 bg-tea-50 shadow-sm' : 'border-tea-950/10 bg-white hover:border-tea-700/20'}`}><div className="flex items-center justify-between gap-3"><span className="font-extrabold text-graphite">{item.label}</span><Badge tone={method === item.id ? 'green' : 'neutral'}>{item.complexity}</Badge></div><p className="mt-2 text-xs leading-5 text-muted">{item.note}</p></button>)}
        </div>
      </Panel>

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Decision output" title="Current Spoilage Priority" description="Highest risk is shown first. Risk score is calculated and persisted by the Spring Boot backend before the selected sort runs." />
        {loading ? <LoadingState label="Calculating spoilage risk ranking…" /> : error ? <ErrorState message={error} onRetry={() => loadRanking(method)} /> : <BatchTable batches={batches} />}
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader eyebrow="Decision transparency" title="How the risk score is calculated" description="This is the exact project-defined formula implemented by the Member 7 backend service." />
        <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-tea-950/10 bg-tea-950 p-5 text-white"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-200/75">Risk Formula</div><div className="mt-4 overflow-x-auto font-mono text-sm font-bold leading-7 sm:text-base">riskScore = (hoursSinceHarvest × 0.40)<br />+ (temperature × 0.35)<br />+ ((humidity / 10) × 0.25)</div><div className="mt-4 text-xs leading-5 text-white/60">Higher score means a batch receives higher spoilage priority in the ranking.</div></div>
          <div className="space-y-3"><div className="rounded-xl border border-tea-950/10 bg-white p-4"><div className="text-sm font-bold text-graphite">Waiting time · 40%</div><p className="mt-1 text-xs leading-5 text-muted">The strongest factor. Tea that has waited longer receives a higher score.</p></div><div className="rounded-xl border border-tea-950/10 bg-white p-4"><div className="text-sm font-bold text-graphite">Temperature · 35%</div><p className="mt-1 text-xs leading-5 text-muted">Higher measured temperature contributes strongly to the risk score.</p></div><div className="rounded-xl border border-tea-950/10 bg-white p-4"><div className="text-sm font-bold text-graphite">Humidity · 25% scaled</div><p className="mt-1 text-xs leading-5 text-muted">Humidity is divided by ten before its weighting is applied.</p></div></div>
        </div>
      </Panel>

      <Modal open={addOpen} title="Add Ready Harvest Batch" onClose={saving ? undefined : () => { setAddOpen(false); setActionError('') }} width="max-w-2xl">
        <BatchForm onSubmit={createBatch} busy={saving} />
        {actionError && <div className="mt-4"><InlineError message={actionError} /></div>}
      </Modal>
    </>
  )
}
