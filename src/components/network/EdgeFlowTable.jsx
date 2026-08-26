import { Badge } from '../ui/Badge'
import { connectionStatus } from '../../utils/displayLabels'

export function EdgeFlowTable({ rows = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-tea-50/70 text-[11px] uppercase tracking-[.09em] text-muted">
          <tr>
            <th className="px-4 py-3">Transport connection</th>
            <th className="px-4 py-3">Daily limit</th>
            <th className="px-4 py-3">Tea assigned</th>
            <th className="px-4 py-3">Capacity still available</th>
            <th className="px-4 py-3">Usage</th>
            <th className="px-4 py-3">Operational status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-tea-950/7">
          {rows.map((row) => {
            const status = connectionStatus(row.utilizationPercent, row.residualCapacityKgPerDay)
            return <tr key={`${row.fromCode}-${row.toCode}`} className="hover:bg-tea-50/35">
              <td className="px-4 py-3 font-mono font-semibold text-graphite">{row.fromCode} → {row.toCode}</td>
              <td className="px-4 py-3 mono-value">{row.capacityKgPerDay.toLocaleString()} kg/day</td>
              <td className="px-4 py-3 mono-value font-bold">{row.flowKgPerDay.toLocaleString()} kg/day</td>
              <td className="px-4 py-3 mono-value">{row.residualCapacityKgPerDay.toLocaleString()} kg/day</td>
              <td className="px-4 py-3">
                <div className="flex min-w-[155px] items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stoneui">
                    <div className={`h-full rounded-full ${status.tone === 'red' ? 'bg-critical' : status.tone === 'amber' ? 'bg-amberui' : 'bg-tea-700'}`} style={{ width: `${Math.min(100, Math.max(0, row.utilizationPercent))}%` }} />
                  </div>
                  <span className="w-12 text-right font-mono text-xs font-bold">{Number(row.utilizationPercent).toFixed(1)}%</span>
                </div>
              </td>
              <td className="px-4 py-3"><Badge tone={status.tone}>{status.label}</Badge></td>
            </tr>
          })}
        </tbody>
      </table>
    </div>
  )
}
