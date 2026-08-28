import { RefreshCw } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { DataTableShell } from '../ui/DataTableShell'
import { EmptyState } from '../ui/Feedback'

export function formatBatchTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export function waitingHours(value) {
  if (!value) return null
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, (Date.now() - time) / 3_600_000)
}

function priorityTone(index) {
  if (index === 0) return 'red'
  if (index < 3) return 'amber'
  return 'neutral'
}

export function BatchTable({ batches = [], showRank = true, onRefreshBatch, busyId, emptyTitle = 'No ready harvest batches', emptyDescription = 'Add a ready harvest batch or reload the queue to begin spoilage prioritisation.' }) {
  if (!batches.length) return <EmptyState title={emptyTitle} description={emptyDescription} />

  return (
    <DataTableShell>
      <table className="min-w-[1080px] w-full text-left text-sm">
        <thead className="bg-tea-50/75 text-[11px] uppercase tracking-[.08em] text-muted">
          <tr>
            {showRank && <th className="px-4 py-3 font-bold">Priority</th>}
            <th className="px-4 py-3 font-bold">Batch</th>
            <th className="px-4 py-3 font-bold">Farm</th>
            <th className="px-4 py-3 font-bold">Collection Point</th>
            <th className="px-4 py-3 font-bold">Quantity</th>
            <th className="px-4 py-3 font-bold">Harvested</th>
            <th className="px-4 py-3 font-bold">Waiting</th>
            <th className="px-4 py-3 font-bold">Conditions</th>
            <th className="px-4 py-3 font-bold">Risk Score</th>
            <th className="px-4 py-3 font-bold">Status</th>
            {onRefreshBatch && <th className="px-4 py-3 font-bold">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-tea-950/7">
          {batches.map((batch, index) => {
            const hours = waitingHours(batch.harvestTime)
            return (
              <tr key={batch.id ?? `${batch.farmId}-${index}`} className={index === 0 && showRank ? 'bg-red-50/35' : 'hover:bg-tea-50/35'}>
                {showRank && <td className="px-4 py-3"><Badge tone={priorityTone(index)}>{index === 0 ? 'TOP' : `#${index + 1}`}</Badge></td>}
                <td className="px-4 py-3 font-mono font-bold text-graphite">B-{batch.id ?? '—'}</td>
                <td className="px-4 py-3 text-graphite">Farm {batch.farmId ?? '—'}</td>
                <td className="px-4 py-3 text-graphite">CP {batch.collectionPointId ?? '—'}</td>
                <td className="px-4 py-3"><span className="font-semibold text-graphite">{batch.quantity ?? '—'}</span> <span className="text-xs text-muted">kg</span></td>
                <td className="px-4 py-3 text-xs text-muted">{formatBatchTime(batch.harvestTime)}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-graphite">{hours == null ? '—' : `${hours.toFixed(1)} h`}</td>
                <td className="px-4 py-3"><div className="font-mono text-xs text-graphite">{batch.temperature ?? '—'} °C</div><div className="mt-0.5 font-mono text-xs text-muted">{batch.humidity ?? '—'}% RH</div></td>
                <td className="px-4 py-3"><span className="font-mono text-base font-extrabold text-tea-900">{batch.riskScore ?? '—'}</span></td>
                <td className="px-4 py-3"><Badge tone={String(batch.status).toLowerCase() === 'ready' ? 'green' : 'neutral'}>{String(batch.status || 'unknown').toUpperCase()}</Badge></td>
                {onRefreshBatch && <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => onRefreshBatch(batch.id)} disabled={busyId === batch.id}><RefreshCw size={14} className={busyId === batch.id ? 'animate-spin' : ''} /> Refresh score</Button></td>}
              </tr>
            )
          })}
        </tbody>
      </table>
    </DataTableShell>
  )
}
