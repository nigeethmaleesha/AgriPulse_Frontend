import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownToLine, Database, ListOrdered, Plus, RefreshCcw, RotateCcw, Trash2, TriangleAlert, Zap } from 'lucide-react'
import { spoilageApi, apiErrorMessage } from '../../api/spoilageApi'
import { useSpoilage } from '../../context/SpoilageContext'
import { BatchForm } from '../../components/spoilage/BatchForm'
import { BatchTable, formatBatchTime, waitingHours } from '../../components/spoilage/BatchTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState, ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { Field, inputClass } from '../../components/ui/FormControls'
import { MetricTile } from '../../components/ui/MetricTile'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'

export default function PriorityQueuePage() {
  const { status, setStatus, refreshStatus } = useSpoilage()
  const [view, setView] = useState('ordered')
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [busyAction, setBusyAction] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [enqueueOpen, setEnqueueOpen] = useState(false)
  const [enqueueId, setEnqueueId] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [lastAction, setLastAction] = useState(null)

  const loadView = useCallback(async (selected = view) => {
    setLoading(true)
    setError('')
    try {
      const [data, latestStatus] = await Promise.all([
        selected === 'heap' ? spoilageApi.getHeap() : spoilageApi.getOrdered(),
        spoilageApi.getStatus(),
      ])
      setBatches(data || [])
      setStatus(latestStatus || status)
    } catch (err) {
      const message = apiErrorMessage(err)
      if (err?.response?.status === 404) {
        setBatches([])
        refreshStatus().catch(() => undefined)
      } else setError(message)
    } finally {
      setLoading(false)
    }
  }, [view, setStatus, status, refreshStatus])

  useEffect(() => { loadView('ordered') }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function runAction(key, fn, successLabel) {
    setBusyAction(key)
    setActionError('')
    try {
      const result = await fn()
      setLastAction(successLabel ? { label: successLabel, result, at: new Date() } : null)
      await loadView(view)
      return result
    } catch (err) {
      setActionError(apiErrorMessage(err))
      return null
    } finally {
      setBusyAction('')
    }
  }

  async function createIncoming(payload) {
    const result = await runAction('create', () => spoilageApi.createAndEnqueue(payload), 'Incoming batch scored and inserted into the live max-heap')
    if (result) setAddOpen(false)
  }

  async function refreshBatch(id) {
    setBusyId(id)
    setActionError('')
    try {
      const result = await spoilageApi.refreshPriority(id)
      setLastAction({ label: `Batch B-${id} risk score refreshed and heap position updated`, result, at: new Date() })
      await loadView(view)
    } catch (err) { setActionError(apiErrorMessage(err)) } finally { setBusyId(null) }
  }

  async function enqueueExisting(event) {
    event.preventDefault()
    const id = Number(enqueueId)
    if (!Number.isInteger(id) || id <= 0) { setActionError('Enter a valid existing harvest batch ID.'); return }
    const result = await runAction('enqueue', () => spoilageApi.enqueueExisting(id), `Batch B-${id} inserted or updated in the live max-heap`)
    if (result) { setEnqueueOpen(false); setEnqueueId('') }
  }

  const top = status?.highestRiskBatch || batches[0]
  const wait = top ? waitingHours(top.harvestTime) : null
  const heapDepth = useMemo(() => status?.size > 0 ? Math.floor(Math.log2(status.size)) + 1 : 0, [status?.size])

  return (
    <>
      <PageHeader module="M04 · SPOILAGE INTELLIGENCE" engine="ENGINE · CUSTOM MAX-HEAP" title="Live Urgent Batch Queue" description="Maintain incoming ready batches in a custom max-heap so the current highest-risk tea batch can be retrieved in O(1) and updates can be re-positioned in O(log n)." action={<div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => runAction('reload', spoilageApi.reloadQueue, 'Live queue rebuilt from ready PostgreSQL batches')} disabled={!!busyAction}><RotateCcw size={16} className={busyAction === 'reload' ? 'animate-spin' : ''} /> Reload Queue</Button><Button onClick={() => setAddOpen(true)}><Plus size={16} /> Incoming Batch</Button></div>} />

      {actionError && <div className="mb-5"><InlineError message={actionError} /></div>}
      {lastAction && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><Zap size={17} className="mt-0.5 shrink-0" /><div><strong>{lastAction.label}</strong><div className="mt-0.5 text-xs text-emerald-800/70">Completed {lastAction.at.toLocaleTimeString()}</div></div></div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Queue size" value={status?.size ?? 0} icon={ListOrdered} caption="Ready batches currently held in the live heap" />
        <MetricTile label="Top risk score" value={top?.riskScore ?? '—'} icon={TriangleAlert} tone="red" caption={top ? `Batch B-${top.id} is currently at heap root` : 'No live priority is available'} />
        <MetricTile label="Top batch wait" value={wait == null ? '—' : wait.toFixed(1)} suffix={wait == null ? '' : 'hours'} icon={Zap} tone="amber" caption={top ? formatBatchTime(top.harvestTime) : 'Waiting time appears after the queue is loaded'} />
        <MetricTile label="Heap depth" value={heapDepth || '—'} icon={Database} caption="Calculated from the current in-memory queue size" />
      </div>

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader eyebrow="Current decision" title="Highest Risk Now" description="The max-heap keeps this batch at index 0, allowing constant-time access to the current highest-priority batch." action={top && <Button variant="amber" size="sm" onClick={() => setConfirm({ type: 'pop', batch: top })} disabled={!!busyAction}><ArrowDownToLine size={15} /> Process / Pop Highest</Button>} />
        {top ? <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_.8fr]"><div className="topographic rounded-2xl p-5 text-white"><div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-200">CURRENT HEAP ROOT</div><div className="mt-2 font-mono text-3xl font-extrabold">B-{top.id}</div></div><div className="rounded-2xl bg-white/10 px-4 py-3 text-right"><div className="text-[10px] font-bold uppercase tracking-wider text-white/55">Risk Score</div><div className="mt-1 font-mono text-2xl font-bold">{top.riskScore ?? '—'}</div></div></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4"><div><div className="text-xs text-white/45">Farm</div><div className="mt-1 font-bold">Farm {top.farmId}</div></div><div><div className="text-xs text-white/45">Collection</div><div className="mt-1 font-bold">CP {top.collectionPointId}</div></div><div><div className="text-xs text-white/45">Temperature</div><div className="mt-1 font-mono font-bold">{top.temperature} °C</div></div><div><div className="text-xs text-white/45">Humidity</div><div className="mt-1 font-mono font-bold">{top.humidity}%</div></div></div></div><div className="rounded-2xl border border-tea-950/10 bg-white p-5"><div className="text-xs font-bold uppercase tracking-[.12em] text-muted">Live queue operations</div><div className="mt-4 space-y-2"><Button className="w-full justify-start" variant="secondary" onClick={() => setEnqueueOpen(true)}><Plus size={15} /> Enqueue Existing Batch</Button><Button className="w-full justify-start" variant="secondary" onClick={() => loadView(view)}><RefreshCcw size={15} /> Refresh Current View</Button><Button className="w-full justify-start" variant="danger" onClick={() => setConfirm({ type: 'clear' })}><Trash2 size={15} /> Clear Live Queue</Button></div><p className="mt-4 text-xs leading-5 text-muted">Pop and clear affect the in-memory live heap only. The backend does not change the PostgreSQL batch status for those operations.</p></div></div> : <EmptyState title="Live priority queue is empty" description="Reload the queue from ready database batches or add an incoming harvest batch." />}
      </Panel>

      <Panel className="overflow-hidden">
        <PanelHeader eyebrow="Queue inspection" title={view === 'ordered' ? 'Operational Priority Order' : 'Internal Heap Array'} description={view === 'ordered' ? 'A fully ordered copy for operational review and report screenshots. The live heap remains unchanged.' : 'The actual heap-array snapshot. Index 0 is guaranteed to contain the maximum-risk batch; lower rows are not a fully sorted list.'} action={<div className="flex rounded-xl border border-tea-950/10 bg-white p-1"><button onClick={() => { setView('ordered'); loadView('ordered') }} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === 'ordered' ? 'bg-tea-950 text-white' : 'text-muted hover:bg-tea-50'}`}>Priority Order</button><button onClick={() => { setView('heap'); loadView('heap') }} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === 'heap' ? 'bg-tea-950 text-white' : 'text-muted hover:bg-tea-50'}`}>Heap Structure</button></div>} />
        {loading ? <LoadingState label="Loading live priority queue…" /> : error ? <ErrorState message={error} onRetry={() => loadView(view)} /> : <BatchTable batches={batches} showRank={view === 'ordered'} onRefreshBatch={refreshBatch} busyId={busyId} emptyTitle="No batches in the live queue" emptyDescription="Use Reload Queue to rebuild the max-heap from ready PostgreSQL batches." />}
      </Panel>

      <Modal open={addOpen} title="Add Incoming Batch to Live Queue" onClose={busyAction ? undefined : () => setAddOpen(false)} width="max-w-2xl"><BatchForm onSubmit={createIncoming} submitLabel="Score & Enqueue Batch" busy={busyAction === 'create'} /></Modal>
      <Modal open={enqueueOpen} title="Enqueue Existing Ready Batch" onClose={busyAction ? undefined : () => setEnqueueOpen(false)}><form onSubmit={enqueueExisting} className="space-y-4"><Field label="Harvest Batch ID" hint="The batch must already exist in PostgreSQL and have status ready."><input className={inputClass} type="number" min="1" value={enqueueId} onChange={(e) => setEnqueueId(e.target.value)} placeholder="e.g. 12" /></Field><div className="rounded-xl border border-tea-950/10 bg-tea-50 p-3 text-xs leading-5 text-muted">The backend recalculates the existing batch&apos;s risk score, persists it, and inserts or updates it in the live heap.</div><div className="flex justify-end"><Button type="submit" disabled={busyAction === 'enqueue'}>{busyAction === 'enqueue' ? 'Enqueueing…' : 'Enqueue Existing Batch'}</Button></div></form></Modal>
      <ConfirmDialog open={confirm?.type === 'pop'} title="Pop highest-risk batch?" description={confirm?.batch ? `Batch B-${confirm.batch.id} will be removed from the live in-memory queue. Its PostgreSQL record and status will not be changed.` : ''} confirmText="Pop Highest" busy={busyAction === 'pop'} onClose={() => setConfirm(null)} onConfirm={async () => { const result = await runAction('pop', spoilageApi.popTop, 'Highest-risk batch removed from the live queue'); if (result) setConfirm(null) }} />
      <ConfirmDialog open={confirm?.type === 'clear'} title="Clear live priority queue?" description="This clears only the in-memory max-heap. PostgreSQL harvest batches remain unchanged and can be loaded again with Reload Queue." confirmText="Clear Queue" busy={busyAction === 'clear'} onClose={() => setConfirm(null)} onConfirm={async () => { const result = await runAction('clear', spoilageApi.clearQueue, 'Live max-heap cleared'); if (result) setConfirm(null) }} />
    </>
  )
}
