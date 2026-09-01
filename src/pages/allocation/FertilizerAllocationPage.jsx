import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  Boxes, CheckCircle2, XCircle, Play, RefreshCw, PlusCircle, ShieldAlert,
  BarChart3, Sparkles, Sprout, ArrowUpRight, Scale, Clock, Zap
} from 'lucide-react'
import { useAllocation } from '../../context/AllocationContext'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { MetricTile } from '../../components/ui/MetricTile'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'
import { ErrorState, LoadingState } from '../../components/ui/Feedback'

function strategyLabel(value = '') {
  if (value.includes('0/1')) return 'Recommended Allocation'
  if (value.includes('Fractional')) return 'Flexible Allocation'
  if (value.includes('Greedy')) return 'Priority-First Allocation'
  return value || 'Planning Strategy'
}

export default function FertilizerAllocationPage() {
  const {
    farms,
    requests,
    pendingRequests,
    allocationResult,
    fertilizerBenchmark,
    loading,
    error,
    backendConnected,
    refreshData,
    submitFertilizerRequest,
    runKnapsackAllocation,
    runFertilizerBenchmark,
  } = useAllocation()

  const [activeTab, setActiveTab] = useState('allocation') // 'allocation' | 'submit' | 'benchmark'
  const [totalCapacity, setTotalCapacity] = useState(50)
  const [allocating, setAllocating] = useState(false)
  const [allocError, setAllocError] = useState('')

  // Submit Request Form State
  const [form, setForm] = useState({
    farmName: '',
    contactNumber: '',
    region: 'Kandy',
    cropType: 'Tea',
    landSize: 3.5,
    fertilizerType: 'Urea',
    requestedBags: 15,
    benefitScore: 75.0,
    urgencyLevel: 'MEDIUM',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  // Benchmark State
  const [benchmarking, setBenchmarking] = useState(false)

  const handleRunAllocation = async () => {
    setAllocating(true)
    setAllocError('')
    try {
      await runKnapsackAllocation(Number(totalCapacity))
    } catch (err) {
      setAllocError(err.message)
    } finally {
      setAllocating(false)
    }
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    setSubmitSuccess('')
    try {
      const res = await submitFertilizerRequest({
        ...form,
        requestedBags: Number(form.requestedBags),
        benefitScore: Number(form.benefitScore),
        landSize: Number(form.landSize),
      })
      setSubmitSuccess(`Request created successfully (ID #${res.id}) for farm "${form.farmName}".`)
      setForm((prev) => ({ ...prev, farmName: '', contactNumber: '', requestedBags: 15, benefitScore: 75.0 }))
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRunBenchmark = async () => {
    setBenchmarking(true)
    try {
      await runFertilizerBenchmark()
    } catch (err) {
      console.error(err)
    } finally {
      setBenchmarking(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'benchmark' && fertilizerBenchmark.length === 0) {
      handleRunBenchmark()
    }
  }, [activeTab])

  if (loading) {
    return <Panel><LoadingState message="Connecting to Module 2 backend..." /></Panel>
  }

  return (
    <>
      {/* Topographic Header Banner */}
      <div className="topographic relative mb-6 overflow-hidden rounded-[26px] px-6 py-7 text-white shadow-soft sm:px-8 sm:py-8">
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone="green" className="!bg-white/12 !text-emerald-100">RESOURCE PLANNING</Badge>
            <Badge tone="green" className="!bg-emerald-300/15 !text-emerald-100">BENEFIT-BASED ALLOCATION</Badge>
            <Badge tone={backendConnected ? 'green' : 'red'} className="!bg-black/20">
              {backendConnected ? 'LIVE DATA CONNECTED' : 'SERVICE UNAVAILABLE'}
            </Badge>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Fertilizer Allocation Planning</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72 sm:text-base">
            Distribute available fertilizer stock across smallholder tea farms to achieve the strongest agricultural benefit within current supply limits.
          </p>
          
          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('allocation')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'allocation'
                  ? 'bg-white text-tea-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <Zap size={15} /> Allocation Plan
            </button>

            <button
              onClick={() => setActiveTab('submit')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'submit'
                  ? 'bg-white text-tea-950 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}
            >
              <PlusCircle size={15} /> Farm Requests
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition ${
                activeTab === 'benchmark'
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

      {error && <Panel className="mb-6"><ErrorState message={error} onRetry={refreshData} /></Panel>}

      {/* TAB 1: LIVE 0/1 KNAPSACK ALLOCATION */}
      {activeTab === 'allocation' && (
        <>
          {/* Controls Panel */}
          <Panel className="mb-6 p-6">
            <PanelHeader
              eyebrow="Allocation setup"
              title="Create Fertilizer Allocation Plan"
              description="Enter the available stock of fertilizer bags for this allocation round."
              action={
                <Button variant="secondary" size="sm" onClick={refreshData}>
                  <RefreshCw size={14} /> Refresh Pending Requests
                </Button>
              }
            />

            <div className="mt-5 grid gap-5 md:grid-cols-3 md:items-end">
              <div>
                <Field label="Total Available Capacity (Bags)" hint={`Pending demand: ${pendingRequests.reduce((acc, r) => acc + r.requestedBags, 0)} bags`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={totalCapacity}
                      onChange={(e) => setTotalCapacity(e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.09em] text-muted">Capacity Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {[30, 50, 100, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTotalCapacity(preset)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                        Number(totalCapacity) === preset
                          ? 'bg-tea-800 text-white'
                          : 'bg-tea-50 text-tea-950 hover:bg-tea-100'
                      }`}
                    >
                      {preset} Bags
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Button
                  className="w-full !bg-tea-800 !text-white hover:!bg-tea-900"
                  size="md"
                  onClick={handleRunAllocation}
                  disabled={allocating || pendingRequests.length === 0}
                >
                  {allocating ? (
                    'Computing Optimal DP Matrix...'
                  ) : (
                    <>
                      <Play size={16} /> Create Allocation Plan
                    </>
                  )}
                </Button>
              </div>
            </div>

            {allocError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {allocError}
              </div>
            )}
          </Panel>

          {/* Allocation Results KPI Section */}
          {allocationResult && (
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                label="Capacity Utilized"
                value={`${allocationResult.usedCapacity} / ${allocationResult.totalCapacity}`}
                suffix="bags"
                icon={Boxes}
                caption={`${allocationResult.capacityUtilizationPercent?.toFixed(1) ?? '100'}% of available stock assigned`}
                tone="green"
              />
              <MetricTile
                label="Total Benefit Score"
                value={allocationResult.totalBenefitAchieved?.toFixed(1) ?? '0.0'}
                icon={Sparkles}
                caption="Optimally maximized score (0/1 DP guarantee)"
                tone="amber"
              />
              <MetricTile
                label="Requests Approved"
                value={`${allocationResult.allocatedRequests?.length || 0} / ${
                  (allocationResult.allocatedRequests?.length || 0) + (allocationResult.rejectedRequests?.length || 0)
                }`}
                icon={CheckCircle2}
                caption={`${allocationResult.rejectedRequests?.length || 0} requests rejected due to stock limit`}
                tone="green"
              />
              <MetricTile
                label="Demand Fulfillment"
                value={`${allocationResult.demandFulfillmentPercent?.toFixed(1) ?? '0'}%`}
                icon={Scale}
                caption={`${allocationResult.totalRequestedBags} total bags requested by farms`}
              />
            </div>
          )}

          {/* Request Allocation Outcome Lists */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Approved Requests Panel */}
            <Panel className="overflow-hidden">
              <PanelHeader
                eyebrow="DP Selection Outcome"
                title="Approved Fertilizer Allocations"
                description="Farm requests selected to achieve the strongest total benefit within the available stock."
                action={
                  <Badge tone="green">
                    {allocationResult ? allocationResult.allocatedRequests.length : 0} Approved
                  </Badge>
                }
              />
              <div className="p-4">
                {!allocationResult ? (
                  <div className="py-12 text-center text-xs text-muted">
                    Set the available stock and click <span className="font-bold text-graphite">Create Allocation Plan</span> to view the recommended allocation.
                  </div>
                ) : allocationResult.allocatedRequests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted">No requests could be allocated with the current capacity.</div>
                ) : (
                  <div className="space-y-3">
                    {allocationResult.allocatedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 transition hover:bg-emerald-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                            <CheckCircle2 size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-graphite">
                              {req.farm?.farmName || `Farm #${req.farm?.id || req.id}`}
                            </div>
                            <div className="text-xs text-muted">
                              {req.fertilizerType} · {req.farm?.region || 'Region'} · Urgency:{' '}
                              <span className="font-bold text-tea-950">{req.urgencyLevel}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-emerald-800">
                            {req.allocatedBags} Bags Allocated
                          </div>
                          <div className="text-xs text-muted">
                            Benefit Score: <span className="font-bold text-graphite">{req.benefitScore}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>

            {/* Rejected Requests Panel */}
            <Panel className="overflow-hidden">
              <PanelHeader
                eyebrow="Stock Exceeded"
                title="Rejected Requests"
                description="Requests not selected because including them would violate capacity constraints."
                action={
                  <Badge tone="red">
                    {allocationResult ? allocationResult.rejectedRequests.length : 0} Rejected
                  </Badge>
                }
              />
              <div className="p-4">
                {!allocationResult ? (
                  <div className="py-12 text-center text-xs text-muted">
                    No allocation round executed yet.
                  </div>
                ) : allocationResult.rejectedRequests.length === 0 ? (
                  <div className="py-8 text-center font-bold text-xs text-emerald-700">
                    All submitted requests fit within the stock capacity!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allocationResult.rejectedRequests.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between rounded-xl border border-red-150 bg-red-50/40 p-4 transition hover:bg-red-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-700 font-bold">
                            <XCircle size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-graphite">
                              {req.farm?.farmName || `Farm #${req.farm?.id || req.id}`}
                            </div>
                            <div className="text-xs text-muted">
                              {req.fertilizerType} · Requested: <span className="font-bold">{req.requestedBags} Bags</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-extrabold text-red-700">0 Bags Allocated</div>
                          <div className="text-xs text-muted">
                            Benefit Score: <span className="font-bold text-graphite">{req.benefitScore}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Panel>
          </div>
        </>
      )}

      {/* TAB 2: SUBMIT REQUEST / REGISTER FARM */}
      {activeTab === 'submit' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submission Form Panel */}
          <Panel className="p-6">
            <PanelHeader
              eyebrow="Request Entry"
              title="Submit Fertilizer Request"
              description="Register farm details and request fertilizer stock allocation."
            />

            <form onSubmit={handleSubmitRequest} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Farm Name">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Green Valley Farm"
                    className={inputClass}
                    value={form.farmName}
                    onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                  />
                </Field>

                <Field label="Contact Number" hint="Unique farm identifier">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0771234567"
                    className={inputClass}
                    value={form.contactNumber}
                    onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Region">
                  <select
                    className={selectClass}
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                  >
                    {['Kandy', 'Nuwara Eliya', 'Ratnapura', 'Matara', 'Badulla'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Crop Type">
                  <select
                    className={selectClass}
                    value={form.cropType}
                    onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                  >
                    {['Tea', 'Rubber', 'Coconut'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Land Size (Acres)">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    className={inputClass}
                    value={form.landSize}
                    onChange={(e) => setForm({ ...form, landSize: e.target.value })}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Fertilizer Type">
                  <select
                    className={selectClass}
                    value={form.fertilizerType}
                    onChange={(e) => setForm({ ...form, fertilizerType: e.target.value })}
                  >
                    {['Urea', 'NPK', 'Compost', 'TSP', 'MOP'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Requested Bags (Weight)">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    className={inputClass}
                    value={form.requestedBags}
                    onChange={(e) => setForm({ ...form, requestedBags: e.target.value })}
                  />
                </Field>

                <Field label="Benefit Score (Value)">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="200"
                    required
                    className={inputClass}
                    value={form.benefitScore}
                    onChange={(e) => setForm({ ...form, benefitScore: e.target.value })}
                  />
                </Field>
              </div>

              <Field label="Urgency Level">
                <div className="flex gap-3">
                  {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-graphite">
                      <input
                        type="radio"
                        name="urgency"
                        value={level}
                        checked={form.urgencyLevel === level}
                        onChange={(e) => setForm({ ...form, urgencyLevel: e.target.value })}
                      />
                      {level}
                    </label>
                  ))}
                </div>
              </Field>

              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold">
                  {submitSuccess}
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full !bg-tea-800 !text-white">
                {submitting ? 'Submitting Request...' : 'Submit Fertilizer Request'}
              </Button>
            </form>
          </Panel>

          {/* Existing Farms & Requests Table */}
          <Panel className="p-6 overflow-hidden">
            <PanelHeader
              eyebrow="Database State"
              title="Registered Farms & Pending Requests"
              description="Live records fetched from PostgreSQL."
            />
            
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-tea-950/10 text-muted font-bold">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Farm Name</th>
                    <th className="pb-2">Region</th>
                    <th className="pb-2">Fertilizer</th>
                    <th className="pb-2">Bags</th>
                    <th className="pb-2">Benefit</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tea-950/5">
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-muted">No fertilizer requests registered.</td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-tea-50/50">
                        <td className="py-3 font-bold">#{req.id}</td>
                        <td className="py-3 font-semibold text-graphite">{req.farm?.farmName || 'Farm'}</td>
                        <td className="py-3 text-muted">{req.farm?.region || '—'}</td>
                        <td className="py-3">{req.fertilizerType}</td>
                        <td className="py-3 font-bold">{req.requestedBags}</td>
                        <td className="py-3 font-bold text-amber-800">{req.benefitScore}</td>
                        <td className="py-3">
                          <Badge tone={req.status === 'ALLOCATED' ? 'green' : req.status === 'REJECTED' ? 'red' : 'amber'}>
                            {req.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* TAB 3: ALGORITHM BENCHMARK LAB */}
      {activeTab === 'benchmark' && (
        <>
          <Panel className="mb-6 p-6">
            <PanelHeader
              eyebrow="Performance insights"
              title="Fertilizer Planning Performance"
              description="Compare allocation quality and processing time across small, medium, and large planning workloads."
              action={
                <Button variant="secondary" size="sm" onClick={handleRunBenchmark} disabled={benchmarking}>
                  <RefreshCw size={14} className={benchmarking ? 'animate-spin' : ''} /> Refresh Insights
                </Button>
              }
            />

            {benchmarking ? (
              <div className="py-12"><LoadingState message="Reviewing performance across small, medium, and large workloads…" /></div>
            ) : fertilizerBenchmark.length === 0 ? (
              <div className="py-12 text-center">
                <Button onClick={handleRunBenchmark} className="!bg-tea-800 !text-white">Run Performance Review</Button>
              </div>
            ) : (
              <div className="mt-6 space-y-8">
                {/* Visual Bar Chart */}
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          size: '20 Requests',
                          'Recommended Allocation': fertilizerBenchmark[0]?.totalBenefitAchieved || 0,
                          'Flexible Allocation': fertilizerBenchmark[1]?.totalBenefitAchieved || 0,
                          'Priority-First Allocation': fertilizerBenchmark[2]?.totalBenefitAchieved || 0,
                        },
                        {
                          size: '200 Requests',
                          'Recommended Allocation': fertilizerBenchmark[3]?.totalBenefitAchieved || 0,
                          'Flexible Allocation': fertilizerBenchmark[4]?.totalBenefitAchieved || 0,
                          'Priority-First Allocation': fertilizerBenchmark[5]?.totalBenefitAchieved || 0,
                        },
                        {
                          size: '2,000 Requests',
                          'Recommended Allocation': fertilizerBenchmark[6]?.totalBenefitAchieved || 0,
                          'Flexible Allocation': fertilizerBenchmark[7]?.totalBenefitAchieved || 0,
                          'Priority-First Allocation': fertilizerBenchmark[8]?.totalBenefitAchieved || 0,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="size" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Recommended Allocation" fill="#047857" />
                      <Bar dataKey="Flexible Allocation" fill="#0284c7" />
                      <Bar dataKey="Priority-First Allocation" fill="#d97706" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Benchmark Metrics Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-tea-950/15 text-muted uppercase font-bold">
                        <th className="py-2">Dataset Size</th>
                        <th className="py-2">Planning Strategy</th>
                        <th className="py-2">Total Benefit Achieved</th>
                        <th className="py-2">Capacity Used</th>
                        <th className="py-2">Requests Allocated</th>
                        <th className="py-2">Execution Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tea-950/10">
                      {fertilizerBenchmark.map((item, index) => (
                        <tr key={index} className={item.algorithmName.includes('0/1') ? 'bg-emerald-50/50 font-semibold' : ''}>
                          <td className="py-3 font-bold">{item.datasetSize} Requests</td>
                          <td className="py-3">{strategyLabel(item.algorithmName)}</td>
                          <td className="py-3 font-extrabold text-tea-950">
                            {item.totalBenefitAchieved?.toFixed(2)}
                          </td>
                          <td className="py-3">
                            {item.usedCapacity} / {item.totalCapacity} Bags ({item.capacityUtilizationPercent?.toFixed(1)}%)
                          </td>
                          <td className="py-3">
                            {item.allocatedRequestsCount} / {item.totalRequestsCount}
                          </td>
                          <td className="py-3 font-mono font-bold text-muted">
                            {item.executionTimeMillis} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Panel>
        </>
      )}
    </>
  )
}
