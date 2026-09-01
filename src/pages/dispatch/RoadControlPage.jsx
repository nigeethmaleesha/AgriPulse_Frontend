import { useState } from 'react'
import {
  ShieldAlert, CloudRain, CheckCircle2, XCircle, RefreshCw,
  Sliders, AlertTriangle, Layers, Navigation, ArrowRight
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { FeedbackBanner } from '../../components/ui/Feedback'
import { dispatchApi, apiErrorMessage } from '../../api/dispatchApi'

const INITIAL_ROADS = [
  { id: 1, fromPointId: 'C1', toPointId: 'C2', distance: 5.0, incline: 1.0, roadQuality: 1.0, monsoonStatus: false, isOpen: true },
  { id: 2, fromPointId: 'C2', toPointId: 'C3', distance: 8.0, incline: 1.2, roadQuality: 1.1, monsoonStatus: true, isOpen: true },
  { id: 3, fromPointId: 'C3', toPointId: 'C4', distance: 6.0, incline: 1.1, roadQuality: 1.0, monsoonStatus: false, isOpen: true },
  { id: 4, fromPointId: 'C4', toPointId: 'C6', distance: 10.0, incline: 1.5, roadQuality: 1.3, monsoonStatus: true, isOpen: true },
  { id: 5, fromPointId: 'C2', toPointId: 'C5', distance: 12.0, incline: 1.3, roadQuality: 1.2, monsoonStatus: false, isOpen: true },
  { id: 6, fromPointId: 'C5', toPointId: 'C6', distance: 7.0, incline: 1.4, roadQuality: 1.1, monsoonStatus: false, isOpen: true },
  { id: 7, fromPointId: 'C1', toPointId: 'C3', distance: 14.0, incline: 1.2, roadQuality: 1.0, monsoonStatus: false, isOpen: true },
]

export default function RoadControlPage() {
  const [roads, setRoads] = useState(INITIAL_ROADS)
  const [updatingId, setUpdatingId] = useState(null)
  const [banner, setBanner] = useState(null)

  const handleToggleRoadStatus = async (road, field) => {
    setUpdatingId(road.id)
    setBanner(null)

    const updatedOpen = field === 'isOpen' ? !road.isOpen : road.isOpen
    const updatedMonsoon = field === 'monsoonStatus' ? !road.monsoonStatus : road.monsoonStatus

    try {
      const res = await dispatchApi.updateRoadStatus(road.id, {
        isOpen: updatedOpen,
        monsoonStatus: updatedMonsoon,
      })

      setRoads(roads.map(r => r.id === road.id ? {
        ...r,
        isOpen: res.isOpen !== undefined ? res.isOpen : updatedOpen,
        monsoonStatus: res.monsoonStatus !== undefined ? res.monsoonStatus : updatedMonsoon
      } : r))

      setBanner({
        type: 'success',
        message: `Road ${road.fromPointId}-${road.toPointId} updated successfully (Open: ${updatedOpen ? 'YES' : 'NO'}, Monsoon: ${updatedMonsoon ? 'YES' : 'NO'}).`,
      })
    } catch (err) {
      // Local optimistic fallback for presentation if server not yet seeded
      setRoads(roads.map(r => r.id === road.id ? {
        ...r,
        isOpen: updatedOpen,
        monsoonStatus: updatedMonsoon
      } : r))
      setBanner({
        type: 'info',
        message: `Updated Road ${road.fromPointId}-${road.toPointId} status locally: ${apiErrorMessage(err)}.`,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        module="DISPATCH CONTROL · PORT 8082"
        engine="PUT /api/v1/dispatch/roads/{id}/status"
        title="Road Conditions & Monsoon Hazard Control"
        description="Dynamically block closed roads or toggle monsoon weather penalties in PostgreSQL to simulate real-world route recalculations."
      />

      {banner && (
        <FeedbackBanner
          type={banner.type}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}

      <Panel title="Database Road Network Status">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3 px-4">Road ID</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Distance (km)</th>
                <th className="py-3 px-4">Incline Factor</th>
                <th className="py-3 px-4">Road Quality</th>
                <th className="py-3 px-4">Monsoon Hazard</th>
                <th className="py-3 px-4">Road Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-graphite">
              {roads.map((road) => (
                <tr key={road.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono font-bold">#RD-{road.id}</td>
                  <td className="py-3 px-4 font-bold">
                    <span className="flex items-center gap-1">
                      <span>{road.fromPointId}</span>
                      <ArrowRight size={12} className="text-slate-400" />
                      <span>{road.toPointId}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">{road.distance} km</td>
                  <td className="py-3 px-4 font-mono">{road.incline}x</td>
                  <td className="py-3 px-4 font-mono">{road.roadQuality}x</td>
                  <td className="py-3 px-4">
                    {road.monsoonStatus ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        <CloudRain size={12} /> Active Monsoon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        Clear Weather
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {road.isOpen ? (
                      <Badge tone="green">OPEN</Badge>
                    ) : (
                      <Badge tone="red">CLOSED</Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant={road.monsoonStatus ? 'outline' : 'ghost'}
                        onClick={() => handleToggleRoadStatus(road, 'monsoonStatus')}
                        disabled={updatingId === road.id}
                      >
                        <CloudRain size={13} className="mr-1" />
                        Toggle Monsoon
                      </Button>
                      <Button
                        size="sm"
                        variant={road.isOpen ? 'danger' : 'outline'}
                        onClick={() => handleToggleRoadStatus(road, 'isOpen')}
                        disabled={updatingId === road.id}
                      >
                        {road.isOpen ? <XCircle size={13} className="mr-1" /> : <CheckCircle2 size={13} className="mr-1" />}
                        {road.isOpen ? 'Close Road' : 'Reopen Road'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
