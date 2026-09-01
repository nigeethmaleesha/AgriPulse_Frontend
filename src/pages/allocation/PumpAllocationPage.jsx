import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Play, RefreshCw, Zap, ShieldCheck, Layers, Gauge, Award, CheckCircle2, Calculator, BarChart3, PlusCircle } from 'lucide-react'
import { useAllocation } from '../../context/AllocationContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricTile } from '../../components/ui/MetricTile'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'
import { ErrorState, LoadingState } from '../../components/ui/Feedback'

function strategyLabel(value = '') {
  if (value.includes('Max-Heap')) return 'Recommended Priority Strategy'
  if (value.includes('Full Sort')) return 'Full Review Strategy'
  if (value.includes('Greedy')) return 'First-Ready Strategy'
  return value || 'Planning Strategy'
}

export default function PumpAllocationPage() {
  const { pumpBenchmark, runPumpBenchmark, backendConnected } = useAllocation()

  const [activeTab, setActiveTab] = useState('simulation') // 'simulation' | 'calculator' | 'comparison'
  const [numberOfFarms, setNumberOfFarms] = useState(2000)
  const [availablePumps, setAvailablePumps] = useState(50)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')

  // Single Farm Calculator State
  const [calcForm, setCalcForm] = useState({
    farmName: 'Hilltop Tea Estate',
    waterDeficiency: 85,
    landSize: 4.5,
    urgencyLevel: 'HIGH',
    isEligible: true,
  })
  const [calcResult, setCalcResult] = useState(null)

  const handleRun = async (farmsCount = numberOfFarms, pumpsCount = availablePumps) => {
    setRunning(true)
    setError('')
    try {
      await runPumpBenchmark(Number(farmsCount), Number(pumpsCount))
    } catch (err) {
      setError(err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleCalculatePriority = (e) => {
    e.preventDefault()
    const urgencyScore = calcForm.urgencyLevel === 'HIGH' ? 100 : calcForm.urgencyLevel === 'MEDIUM' ? 60 : 30
    const score = Number((calcForm.waterDeficiency * 0.5 + calcForm.landSize * 4.0 + urgencyScore * 0.3).toFixed(2))
    setCalcResult({
      ...calcForm,
      priorityScore: score,
      granted: calcForm.isEligible && score >= 50,
    })
  }

  useEffect(() => {
    if (pumpBenchmark.length === 0) {
      handleRun()
    }
  }, [])

  const maxHeapResult = pumpBenchmark.find((b) => b.algorithmUsed?.includes('Max-Heap')) || pumpBenchmark[0]
  const sortResult = pumpBenchmark.find((b) => b.algorithmUsed?.includes('Full Sort')) || pumpBenchmark[1]
  const greedyResult = pumpBenchmark.find((b) => b.algorithmUsed?.includes('Greedy')) || pumpBenchmark[2]

  const totalScoreHeap = maxHeapResult?.allocatedFarms?.reduce((acc, f) => acc + f.priorityScore, 0) || 0

  return (
    <>
      {/* Topographic Banner */}
      <div className="topographic relative mb-6 overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-soft sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="green" className="!bg-white/12 !text-emerald-100">RESOURCE PLANNING</Badge>
            <Badge tone="green" className="!bg-emerald-300/15 !text-emerald-100">NEED-BASED PRIORITIZATION</Badge>
            <Badge tone={backendConnected ? 'green' : 'red'} className="!bg-black/20">
              {backendConnected ? 'LIVE DATA CONNECTED' : 'SERVICE UNAVAILABLE'}
            </Badge>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Irrigation Resource Planning</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
            Direct limited irrigation pumps to the farms with the greatest current need during dry-season operations.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('simulation')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'simulation'
                  ? 'bg-white text-tea-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Zap size={15} /> Pump Allocation
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'calculator'
                  ? 'bg-white text-tea-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Calculator size={15} /> Priority Score Calculator
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'comparison'
                  ? 'bg-white text-tea-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <BarChart3 size={15} /> Performance Insights
            </button>
          </div>
        </div>
        <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full border border-white/10" />
      </div>

      {/* TAB 1: MAX-HEAP SIMULATION */}
      {activeTab === 'simulation' && (
        <>
          {/* Controls Panel */}
          <Panel className="mb-6 p-6">
            <PanelHeader
              eyebrow="Planning setup"
              title="Create Irrigation Allocation Plan"
              description="Enter the number of farms requiring support and the pumps currently available."
              action={
                <Button variant="secondary" size="sm" onClick={() => handleRun()} disabled={running}>
                  <RefreshCw size={14} className={running ? 'animate-spin' : ''} /> Refresh Simulation
                </Button>
              }
            />

            <div className="mt-5 grid gap-5 md:grid-cols-3 md:items-end">
              <div>
                <Field label="Total Competing Farms">
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    className={inputClass}
                    value={numberOfFarms}
                    onChange={(e) => setNumberOfFarms(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Available Irrigation Pumps">
                <input type="number" min="1" max="1000" className={inputClass} value={availablePumps} onChange={(e) => setAvailablePumps(e.target.value)} />
              </Field>

              <div>
                <Button
                  className="w-full !bg-tea-800 !text-white hover:!bg-tea-900"
                  size="md"
                  onClick={() => handleRun()}
                  disabled={running}
                >
                  {running ? (
                    'Preparing Allocation Plan…'
                  ) : (
                    <>
                      <Play size={16} /> Create Allocation Plan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                <span>{error}</span>
                <Button size="sm" variant="secondary" onClick={() => handleRun()}>Retry Connection</Button>
              </div>
            )}
          </Panel>

          {/* KPI Tiles */}
          {running ? (
            <Panel className="p-12"><LoadingState message="Preparing the irrigation allocation plan…" /></Panel>
          ) : (
            pumpBenchmark.length > 0 && (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricTile
                    label="Total Farms Evaluated"
                    value={numberOfFarms.toLocaleString()}
                    icon={Layers}
                    caption="Farms competing for irrigation pump supply"
                  />
                  <MetricTile
                    label="Pumps Allocated"
                    value={`${maxHeapResult?.pumpsAllocated || 0} / ${availablePumps}`}
                    icon={ShieldCheck}
                    caption="All available pumps assigned to highest priority farms"
                    tone="green"
                  />
                  <MetricTile
                    label="Total Priority Score"
                    value={totalScoreHeap.toFixed(1)}
                    icon={Award}
                    caption="Combined priority value of the recommended allocation"
                    tone="amber"
                  />
                  <MetricTile
                    label="Planning Time"
                    value={`${maxHeapResult?.executionTimeMillis || 0}`}
                    suffix="ms"
                    icon={Gauge}
                    caption="Measured response time from the planning service"
                    tone="green"
                  />
                </div>

                {/* Top Allocated Farms Grid */}
                <Panel className="p-6 overflow-hidden">
                  <PanelHeader
                    eyebrow="Recommended allocation"
                    title="Top Priority Farms Granted Irrigation Pumps"
                    description="Farms are shown in recommended service order based on current operational need."
                    action={<Badge tone="green">{maxHeapResult?.allocatedFarms?.length || 0} Pumps Granted</Badge>}
                  />

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {maxHeapResult?.allocatedFarms?.slice(0, 12).map((farm, index) => (
                      <div
                        key={farm.farmId || index}
                        className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-extrabold text-emerald-900 text-xs">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-graphite">Farm ID #{farm.farmId}</div>
                            <div className="text-[11px] text-muted">Eligible: <span className="font-bold text-emerald-700">YES</span></div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-emerald-900">{farm.priorityScore}</div>
                          <div className="text-[10px] text-muted">Priority Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )
          )}
        </>
      )}

      {/* TAB 2: SINGLE FARM PRIORITY CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel className="p-6">
            <PanelHeader
              eyebrow="Farm assessment"
              title="Farm Priority Score Calculator"
              description="Calculate dry season irrigation priority score based on water deficiency %, land size, and urgency level."
            />

            <form onSubmit={handleCalculatePriority} className="mt-5 space-y-4">
              <Field label="Farm Name">
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={calcForm.farmName}
                  onChange={(e) => setCalcForm({ ...calcForm, farmName: e.target.value })}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Water Deficiency Level (%)" hint="0% (Abundant) to 100% (Severe Drought)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    className={inputClass}
                    value={calcForm.waterDeficiency}
                    onChange={(e) => setCalcForm({ ...calcForm, waterDeficiency: Number(e.target.value) })}
                  />
                </Field>

                <Field label="Land Size (Acres)">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    className={inputClass}
                    value={calcForm.landSize}
                    onChange={(e) => setCalcForm({ ...calcForm, landSize: Number(e.target.value) })}
                  />
                </Field>
              </div>

              <Field label="Urgency Level">
                <select
                  className={selectClass}
                  value={calcForm.urgencyLevel}
                  onChange={(e) => setCalcForm({ ...calcForm, urgencyLevel: e.target.value })}
                >
                  <option value="LOW">LOW — Routine irrigation</option>
                  <option value="MEDIUM">MEDIUM — Moderate crop stress</option>
                  <option value="HIGH">HIGH — Critical drought hazard</option>
                </select>
              </Field>

              <Field label="Eligibility Status">
                <label className="flex items-center gap-2 text-xs font-bold text-graphite cursor-pointer">
                  <input
                    type="checkbox"
                    checked={calcForm.isEligible}
                    onChange={(e) => setCalcForm({ ...calcForm, isEligible: e.target.checked })}
                  />
                  Farm registered and certified for irrigation assistance
                </label>
              </Field>

              <Button type="submit" className="w-full !bg-tea-800 !text-white">
                Calculate Priority Score
              </Button>
            </form>
          </Panel>

          {/* Result Outcome */}
          <Panel className="p-6">
            <PanelHeader
              eyebrow="Evaluation Outcome"
              title="Irrigation Priority Result"
              description="Evaluated against the current irrigation priority threshold."
            />

            {!calcResult ? (
              <div className="py-12 text-center text-xs text-muted">
                Fill in the farm parameters and click <span className="font-bold text-graphite">Calculate Priority Score</span>.
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className={`rounded-2xl p-5 ${calcResult.granted ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center justify-between">
                    <Badge tone={calcResult.granted ? 'green' : 'red'}>
                      {calcResult.granted ? 'HIGH PRIORITY · ALLOCATED' : 'NOT ALLOCATED'}
                    </Badge>
                    <Award size={20} className={calcResult.granted ? 'text-emerald-700' : 'text-red-700'} />
                  </div>
                  <div className="mt-3 text-3xl font-black text-graphite">{calcResult.priorityScore}</div>
                  <div className="text-xs text-muted font-medium">Calculated Priority Score</div>
                  <p className="mt-3 text-xs leading-5 text-graphite">
                    Farm <strong>{calcResult.farmName}</strong> achieved a score of <strong>{calcResult.priorityScore}</strong> based on {calcResult.waterDeficiency}% water deficiency and {calcResult.landSize} acres.
                  </p>
                </div>

                <div className="rounded-xl border border-tea-950/10 bg-white p-4 space-y-2 text-xs">
                  <div className="font-bold text-graphite mb-1">Scoring Breakdown</div>
                  <div className="flex justify-between text-muted"><span>Water Deficiency Contribution (50%):</span><span className="font-bold text-graphite">{(calcResult.waterDeficiency * 0.5).toFixed(1)}</span></div>
                  <div className="flex justify-between text-muted"><span>Land Size Contribution (4x):</span><span className="font-bold text-graphite">{(calcResult.landSize * 4.0).toFixed(1)}</span></div>
                  <div className="flex justify-between text-muted"><span>Urgency Contribution (30%):</span><span className="font-bold text-graphite">{(calcResult.urgencyLevel === 'HIGH' ? 30 : calcResult.urgencyLevel === 'MEDIUM' ? 18 : 9)}</span></div>
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* TAB 3: ALGORITHM COMPARISON LAB */}
      {activeTab === 'comparison' && (
        <Panel className="p-6">
          <PanelHeader
            eyebrow="Performance insights"
            title="Irrigation Planning Strategy Comparison"
            description="Compare response time and allocation quality across different workload sizes."
            action={
              <Button variant="secondary" size="sm" onClick={() => handleRun()} disabled={running}>
                <RefreshCw size={14} className={running ? 'animate-spin' : ''} /> Run Full Comparison
              </Button>
            }
          />

          {running ? (
            <div className="py-12"><LoadingState message="Comparing irrigation planning strategies…" /></div>
          ) : pumpBenchmark.length > 0 && (
            <div className="mt-6 space-y-8">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Max-Heap Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 p-5 shadow-sm">
                  <Badge tone="green">RECOMMENDED</Badge>
                  <h3 className="mt-3 text-base font-extrabold text-graphite">{strategyLabel(maxHeapResult?.algorithmUsed)}</h3>
                  <div className="mt-4 text-2xl font-black text-emerald-800">{totalScoreHeap.toFixed(1)}</div>
                  <div className="text-xs text-muted font-medium">Total Priority Score Achieved</div>
                  <div className="mt-3 flex justify-between border-t border-emerald-200/60 pt-3 text-xs">
                    <span className="text-muted">Allocated: <strong>{maxHeapResult?.pumpsAllocated}</strong></span>
                    <span className="font-mono font-bold text-emerald-800">{maxHeapResult?.executionTimeMillis} ms</span>
                  </div>
                </div>

                {/* TimSort Card */}
                <div className="rounded-2xl border border-sky-500/30 bg-sky-50/40 p-5 shadow-sm">
                  <Badge tone="blue">FULL REVIEW</Badge>
                  <h3 className="mt-3 text-base font-extrabold text-graphite">{strategyLabel(sortResult?.algorithmUsed)}</h3>
                  <div className="mt-4 text-2xl font-black text-sky-800">
                    {sortResult?.allocatedFarms?.reduce((acc, f) => acc + f.priorityScore, 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted font-medium">Total Priority Score Achieved</div>
                  <div className="mt-3 flex justify-between border-t border-sky-200/60 pt-3 text-xs">
                    <span className="text-muted">Allocated: <strong>{sortResult?.pumpsAllocated}</strong></span>
                    <span className="font-mono font-bold text-sky-800">{sortResult?.executionTimeMillis} ms</span>
                  </div>
                </div>

                {/* Greedy Card */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-50/40 p-5 shadow-sm">
                  <Badge tone="amber">REFERENCE</Badge>
                  <h3 className="mt-3 text-base font-extrabold text-graphite">{strategyLabel(greedyResult?.algorithmUsed)}</h3>
                  <div className="mt-4 text-2xl font-black text-amber-800">
                    {greedyResult?.allocatedFarms?.reduce((acc, f) => acc + f.priorityScore, 0).toFixed(1)}
                  </div>
                  <div className="text-xs text-muted font-medium">Total Priority Score Achieved</div>
                  <div className="mt-3 flex justify-between border-t border-amber-200/60 pt-3 text-xs">
                    <span className="text-muted">Allocated: <strong>{greedyResult?.pumpsAllocated}</strong></span>
                    <span className="font-mono font-bold text-amber-800">{greedyResult?.executionTimeMillis} ms</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart Visualizer */}
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pumpBenchmark.map((b) => ({
                      algorithm: strategyLabel(b.algorithmUsed),
                      'Total Priority Score': b.allocatedFarms?.reduce((acc, f) => acc + f.priorityScore, 0) || 0,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="algorithm" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Total Priority Score" fill="#047857" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Panel>
      )}
    </>
  )
}
