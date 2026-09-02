import { useState, useEffect } from 'react'
import {
  Truck, MapPin, Navigation, RefreshCw, CheckCircle2, ShieldAlert,
  Zap, ArrowRight, Layers, Flame, Database, RotateCcw
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel } from '../../components/ui/Panel'
import { MetricTile } from '../../components/ui/MetricTile'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { FeedbackBanner } from '../../components/ui/Feedback'
import { dispatchApi, apiErrorMessage } from '../../api/dispatchApi'

const NODES = [
  { id: 'C1', name: 'C1 - Main Factory / Central Depot', coords: '6.9271, 79.8612', type: 'Depot' },
  { id: 'C2', name: 'C2 - Valley Collection Point 2', coords: '6.9320, 79.8700', type: 'Collection Point' },
  { id: 'C3', name: 'C3 - Hills Junction Point 3', coords: '6.9400, 79.8800', type: 'Junction' },
  { id: 'C4', name: 'C4 - Highland Farm Point 4', coords: '6.9500, 79.8900', type: 'Collection Point' },
  { id: 'C5', name: 'C5 - River Pass Point 5', coords: '6.9600, 79.9000', type: 'Pass' },
  { id: 'C6', name: 'C6 - Mountain Peak Point 6', coords: '6.9700, 79.9100', type: 'High Priority Farm' },
]

export default function LiveDispatchPage() {
  const [truckNode, setTruckNode] = useState('C1')
  const [routeResult, setRouteResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [banner, setBanner] = useState(null)

  const fetchRoute = async (currentNode = truckNode) => {
    setLoading(true)
    try {
      const data = await dispatchApi.getNextRoute(currentNode)
      setRouteResult(data)
      if (data.statusMessage) {
        if (data.totalRouteCost >= 0) {
          setBanner({ type: 'success', message: data.statusMessage })
        } else {
          setBanner({ type: 'warning', message: data.statusMessage })
        }
      }
    } catch (err) {
      setBanner({ type: 'error', message: apiErrorMessage(err) })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoute('C1')
  }, [])

  const handleTruckNodeChange = (newNode) => {
    setTruckNode(newNode)
    fetchRoute(newNode)
  }

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      const msg = await dispatchApi.seedData()
      setBanner({ type: 'success', message: typeof msg === 'string' ? msg : 'Initial seed data populated successfully!' })
      fetchRoute(truckNode)
    } catch (err) {
      setBanner({ type: 'error', message: apiErrorMessage(err) })
    } finally {
      setSeeding(false)
    }
  }

  const handleCollectBatch = async () => {
    if (!routeResult?.selectedBatchId) return
    setCollecting(true)
    try {
      const res = await dispatchApi.markBatchCollected(routeResult.selectedBatchId, truckNode)
      setRouteResult(res)
      setBanner({
        type: 'success',
        message: res.statusMessage || `Batch ${routeResult.selectedBatchId} collected successfully. Dynamic route recalculated.`,
      })
      if (res.targetCollectionPoint && res.recommendedPath?.length > 1) {
        // Move truck to newly targeted batch location or target node
        const nextTarget = res.targetCollectionPoint
        if (nextTarget && NODES.some(n => n.id === nextTarget)) {
          setTruckNode(nextTarget)
        }
      }
    } catch (err) {
      setBanner({ type: 'error', message: apiErrorMessage(err) })
    } finally {
      setCollecting(false)
    }
  }

  const path = routeResult?.recommendedPath || []
  const cost = routeResult?.totalRouteCost ?? -1
  const hasRoute = cost >= 0 && path.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        module="COLLECTION & DISPATCH"
        engine="LIVE ROUTE GUIDANCE"
        title="Dispatch Control Centre"
        description="Coordinate tea collection vehicles using current batch urgency, road availability, and the most practical route to each destination."
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSeedData}
              disabled={seeding || loading}
            >
              <Database size={15} className={`mr-2 ${seeding ? 'animate-spin' : ''}`} />
              {seeding ? 'Preparing data…' : 'Reset Demo Data'}
            </Button>
            <Button
              onClick={() => fetchRoute(truckNode)}
              disabled={loading}
            >
              <RefreshCw size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Route
            </Button>
          </div>
        }
      />

      {banner && (
        <FeedbackBanner
          type={banner.type}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Current Truck Node"
          value={truckNode}
          caption="Active Collection Dispatch Spot"
          icon={Truck}
          tone="green"
        />
        <MetricTile
          label="Target Priority Batch"
          value={routeResult?.selectedBatchId || 'None'}
          caption={routeResult?.priorityScore ? `Priority Score: ${routeResult.priorityScore}` : 'No active batch target'}
          icon={Flame}
          tone={routeResult?.selectedBatchId ? 'amber' : 'green'}
        />
        <MetricTile
          label="Target Location"
          value={routeResult?.targetCollectionPoint || 'N/A'}
          caption={routeResult?.targetCollectionPoint ? 'Highest priority ready node' : 'No destination'}
          icon={MapPin}
          tone="green"
        />
        <MetricTile
          label="Recommended Route Cost"
          value={hasRoute ? cost.toFixed(2) : 'Unreachable'}
          suffix={hasRoute ? 'weighted cost' : ''}
          caption={hasRoute ? `${path.length} nodes in optimal path` : 'Road network inaccessible'}
          icon={Navigation}
          tone={hasRoute ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Route & Map Panel */}
        <div className="space-y-6 lg:col-span-2">
          <Panel
            title="Live Route Computation & Dispatch Guidance"
            action={<Badge tone="green">Dispatch service active</Badge>}
          >
            {/* Truck Position Controller */}
            <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-tea-950">
                Select Dispatch Truck Location:
              </label>
              <div className="flex flex-wrap gap-2">
                {NODES.map((node) => {
                  const isCurrent = truckNode === node.id
                  const isTarget = routeResult?.targetCollectionPoint === node.id
                  const isInPath = path.includes(node.id)
                  return (
                    <button
                      key={node.id}
                      onClick={() => handleTruckNodeChange(node.id)}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-tea-900 text-white shadow-md ring-2 ring-tea-600'
                          : isTarget
                          ? 'bg-amber-500 text-white shadow-sm'
                          : isInPath
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-white text-graphite border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Truck size={14} className={isCurrent ? 'text-emerald-300 animate-pulse' : ''} />
                      <span>{node.id}</span>
                      {isCurrent && <span className="rounded bg-emerald-700/80 px-1 py-0.2 text-[9px]">TRUCK HERE</span>}
                      {isTarget && <span className="rounded bg-amber-700/80 px-1 py-0.2 text-[9px]">TARGET BATCH</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Path Visualizer */}
            {hasRoute ? (
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-graphite">
                      Recommended Collection Route
                    </h4>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      Total Cost: {cost.toFixed(2)}
                    </span>
                  </div>

                  {/* Horizontal Path Flow */}
                  <div className="flex flex-wrap items-center gap-2">
                    {path.map((nodeId, idx) => {
                      const isLast = idx === path.length - 1
                      const isFirst = idx === 0
                      const nodeInfo = NODES.find(n => n.id === nodeId)
                      return (
                        <div key={nodeId + idx} className="flex items-center gap-2">
                          <div className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 shadow-sm ${
                            isFirst
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-bold'
                              : isLast
                              ? 'border-amber-300 bg-amber-50 text-amber-950 font-bold'
                              : 'border-slate-200 bg-slate-50 text-slate-800'
                          }`}>
                            <MapPin size={16} className={isFirst ? 'text-emerald-600' : isLast ? 'text-amber-600' : 'text-slate-400'} />
                            <div>
                              <div className="text-xs font-extrabold">{nodeId}</div>
                              <div className="text-[10px] text-muted">{nodeInfo?.type || 'Node'}</div>
                            </div>
                          </div>
                          {!isLast && (
                            <ArrowRight size={18} className="text-emerald-500 animate-pulse" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Batch Action Card */}
                {routeResult?.selectedBatchId && (
                  <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Flame size={18} className="text-amber-600" />
                        <span className="text-sm font-bold text-amber-950">
                          Active Dispatch Objective: Batch {routeResult.selectedBatchId}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800">
                        Targeting collection point <strong className="underline">{routeResult.targetCollectionPoint}</strong> with Priority Score <strong className="underline">{routeResult.priorityScore}</strong>.
                      </p>
                    </div>

                    <Button
                      onClick={handleCollectBatch}
                      disabled={collecting}
                      className="bg-amber-600 text-white hover:bg-amber-700"
                    >
                      <CheckCircle2 size={16} className="mr-2" />
                      {collecting ? 'Marking Collected...' : 'Mark Batch as Collected'}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                <ShieldAlert size={36} className="mx-auto mb-3 text-amber-500" />
                <h4 className="text-base font-bold text-graphite">No Accessible Target Route</h4>
                <p className="mt-1 text-xs text-muted max-w-md mx-auto">
                  {routeResult?.statusMessage || 'All batches may be collected, or roads leading to ready batches are blocked by monsoon conditions.'}
                </p>
                <div className="mt-4 flex justify-center gap-3">
                  <Button variant="outline" onClick={handleSeedData}>
                    <RotateCcw size={14} className="mr-2" /> Reset & Re-Seed Database
                  </Button>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Network & Nodes Details Sidebar */}
        <div className="space-y-6">
          <Panel title="Collection Network Topology">
            <div className="space-y-3">
              {NODES.map((node) => {
                const isCurrent = truckNode === node.id
                const isTarget = routeResult?.targetCollectionPoint === node.id
                const isInPath = path.includes(node.id)

                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border p-3 transition-all ${
                      isCurrent
                        ? 'border-tea-700 bg-tea-900 text-white shadow-sm'
                        : isTarget
                        ? 'border-amber-300 bg-amber-50 text-amber-950'
                        : isInPath
                        ? 'border-emerald-200 bg-emerald-50/50 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={15} className={isCurrent ? 'text-emerald-300' : isTarget ? 'text-amber-600' : 'text-slate-400'} />
                        <span className="text-xs font-bold">{node.name}</span>
                      </div>
                      {isCurrent && <Badge tone="dark">TRUCK</Badge>}
                      {isTarget && <Badge tone="amber">TARGET</Badge>}
                      {!isCurrent && !isTarget && isInPath && <Badge tone="green">PATH</Badge>}
                    </div>
                    <div className="mt-1.5 flex justify-between text-[11px] opacity-80">
                      <span>Coordinates: {node.coords}</span>
                      <span className="font-semibold">{node.type}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          <Panel title="Dispatch Service Details">
            <div className="space-y-3 text-xs text-graphite">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-muted">Batch selection</span>
                <span className="font-bold text-tea-900">Urgency-based priority</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-muted">Route guidance</span>
                <span className="font-bold text-tea-900">Lowest-cost available route</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-muted">Operational data</span>
                <span className="font-bold text-tea-900">Live dispatch records</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-muted">Service status</span>
                <span className="font-bold text-emerald-600">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Road Penalty Formula</span>
                <span className="font-bold text-slate-700">Dist × Incline × Quality × Monsoon</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
