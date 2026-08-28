import { useState } from 'react'
import {
  Calculator, Plus, Trash2, Play, Navigation, Flame, Info,
  MapPin, Sliders, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { FeedbackBanner } from '../../components/ui/Feedback'
import { dispatchApi, apiErrorMessage } from '../../api/dispatchApi'

export default function RouteCalculatorPage() {
  const [truckCurrentNode, setTruckCurrentNode] = useState('C1')
  
  // Custom Batches
  const [readyBatches, setReadyBatches] = useState([
    { batchId: 'B-102', collectionPointId: 'C6', priorityScore: 95.0, ready: true },
    { batchId: 'B-091', collectionPointId: 'C4', priorityScore: 75.0, ready: true },
    { batchId: 'B-045', collectionPointId: 'C2', priorityScore: 60.0, ready: true },
  ])

  // Custom Road Edges Graph: Map<String, List<RoadEdge>>
  const [roadGraph, setRoadGraph] = useState({
    C1: [
      { toPointId: 'C2', distance: 5.0, incline: 1.0, roadQuality: 1.0, monsoonStatus: false, open: true },
      { toPointId: 'C3', distance: 14.0, incline: 1.2, roadQuality: 1.0, monsoonStatus: false, open: true },
    ],
    C2: [
      { toPointId: 'C3', distance: 8.0, incline: 1.2, roadQuality: 1.1, monsoonStatus: true, open: true },
      { toPointId: 'C5', distance: 12.0, incline: 1.3, roadQuality: 1.2, monsoonStatus: false, open: true },
    ],
    C3: [
      { toPointId: 'C4', distance: 6.0, incline: 1.1, roadQuality: 1.0, monsoonStatus: false, open: true },
    ],
    C4: [
      { toPointId: 'C6', distance: 10.0, incline: 1.5, roadQuality: 1.3, monsoonStatus: true, open: true },
    ],
    C5: [
      { toPointId: 'C6', distance: 7.0, incline: 1.4, roadQuality: 1.1, monsoonStatus: false, open: true },
    ],
  })

  const [calcResult, setCalcResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [banner, setBanner] = useState(null)

  const handleAddBatch = () => {
    const newId = `B-${Math.floor(100 + Math.random() * 900)}`
    setReadyBatches([...readyBatches, { batchId: newId, collectionPointId: 'C2', priorityScore: 50.0, ready: true }])
  }

  const handleRemoveBatch = (index) => {
    setReadyBatches(readyBatches.filter((_, i) => i !== index))
  }

  const handleBatchChange = (index, field, value) => {
    const updated = [...readyBatches]
    updated[index] = { ...updated[index], [field]: field === 'priorityScore' ? parseFloat(value) || 0 : value }
    setReadyBatches(updated)
  }

  const handleRunCalculation = async () => {
    setLoading(true)
    setBanner(null)
    try {
      const payload = {
        truckCurrentNode,
        readyBatches,
        roadGraph,
      }
      const data = await dispatchApi.calculateRoute(payload)
      setCalcResult(data)
      if (data.totalRouteCost >= 0) {
        setBanner({ type: 'success', message: 'In-memory route calculation completed successfully.' })
      } else {
        setBanner({ type: 'warning', message: data.statusMessage || 'Target unreachable with payload graph.' })
      }
    } catch (err) {
      setBanner({ type: 'error', message: apiErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        module="DISPATCH ENGINE · PLAYGROUND"
        engine="POST /api/v1/dispatch/calculate-route"
        title="In-Memory Route Calculator & Payload Inspector"
        description="Test custom harvest batch priorities and road graph edge weights to simulate exact Dijkstra + Max-Heap algorithm responses."
        action={
          <Button onClick={handleRunCalculation} disabled={loading}>
            <Play size={16} className="mr-2" />
            {loading ? 'Calculating...' : 'Run Route Calculation'}
          </Button>
        }
      />

      {banner && (
        <FeedbackBanner
          type={banner.type}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Input Payload Designer */}
        <div className="space-y-6 lg:col-span-2">
          {/* Truck Start Node */}
          <Panel title="1. Truck Starting Position">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-graphite">
                Truck Current Node:
              </label>
              <select
                value={truckCurrentNode}
                onChange={(e) => setTruckCurrentNode(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-graphite shadow-sm focus:border-tea-700 focus:outline-none"
              >
                {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </Panel>

          {/* Harvest Batches List */}
          <Panel
            title="2. Ready Harvest Batches (Max-Heap Input)"
            action={
              <Button variant="outline" size="sm" onClick={handleAddBatch}>
                <Plus size={14} className="mr-1" /> Add Batch
              </Button>
            }
          >
            <div className="space-y-3">
              {readyBatches.map((batch, index) => (
                <div key={index} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  <div className="w-24">
                    <label className="text-[10px] font-bold text-muted uppercase">Batch ID</label>
                    <input
                      type="text"
                      value={batch.batchId}
                      onChange={(e) => handleBatchChange(index, 'batchId', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-graphite"
                    />
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] font-bold text-muted uppercase">Collection Point</label>
                    <select
                      value={batch.collectionPointId}
                      onChange={(e) => handleBatchChange(index, 'collectionPointId', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-graphite"
                    >
                      {['C1', 'C2', 'C3', 'C4', 'C5', 'C6'].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <label className="text-[10px] font-bold text-muted uppercase">Priority Score</label>
                    <input
                      type="number"
                      step="5"
                      value={batch.priorityScore}
                      onChange={(e) => handleBatchChange(index, 'priorityScore', e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs font-bold text-graphite"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-3">
                    <label className="flex items-center gap-1.5 text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={batch.ready}
                        onChange={(e) => handleBatchChange(index, 'ready', e.target.checked)}
                        className="rounded text-tea-700"
                      />
                      Ready
                    </label>
                  </div>
                  <button
                    onClick={() => handleRemoveBatch(index)}
                    className="ml-auto pt-3 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* Right: Output Inspection Panel */}
        <div className="space-y-6">
          <Panel title="Calculated Route Output">
            {calcResult ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>Calculation Succeeded</span>
                  </div>
                  <p className="mt-1 text-xs text-emerald-800">
                    {calcResult.statusMessage}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted">Selected Batch Target:</span>
                    <span className="font-bold text-amber-700">{calcResult.selectedBatchId || 'None'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted">Destination Node:</span>
                    <span className="font-bold text-tea-950">{calcResult.targetCollectionPoint || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted">Target Priority Score:</span>
                    <span className="font-bold text-slate-800">{calcResult.priorityScore ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted">Total Route Cost:</span>
                    <span className="font-bold text-emerald-700">
                      {calcResult.totalRouteCost >= 0 ? calcResult.totalRouteCost.toFixed(2) : 'Unreachable'}
                    </span>
                  </div>
                </div>

                {calcResult.recommendedPath?.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase text-muted">
                      Recommended Node Sequence:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-900 p-3 text-white">
                      {calcResult.recommendedPath.map((node, i) => (
                        <span key={i} className="flex items-center gap-1 text-xs font-mono font-bold">
                          <span className="text-emerald-400">{node}</span>
                          {i < calcResult.recommendedPath.length - 1 && <span className="text-slate-500">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted">
                <Calculator size={32} className="mx-auto mb-2 text-slate-400" />
                <p>Click "Run Route Calculation" to evaluate custom payload.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
