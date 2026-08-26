import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, Clock3, Database, GitBranch, MemoryStick, Network } from 'lucide-react'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { useNetwork } from '../../context/NetworkContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { EndpointSelector } from '../../components/network/EndpointSelector'
import { NetworkGraph } from '../../components/network/NetworkGraph'
import { EdgeFlowTable } from '../../components/network/EdgeFlowTable'

export default function FlowAnalysisPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const sourceDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'SOURCE' && n.active)?.code || '', [graph.nodes])
  const sinkDefault = useMemo(() => graph.nodes.find((n) => n.nodeType === 'FACTORY' && n.active)?.code || '', [graph.nodes])
  const [sourceCode, setSourceCode] = useState('')
  const [sinkCode, setSinkCode] = useState('')
  const [saveBenchmark, setSaveBenchmark] = useState(true)
  const [result, setResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')

  useEffect(() => { if (!sourceCode && sourceDefault) setSourceCode(sourceDefault) }, [sourceDefault, sourceCode])
  useEffect(() => { if (!sinkCode && sinkDefault) setSinkCode(sinkDefault) }, [sinkDefault, sinkCode])

  const run = async () => {
    if (!sourceCode || !sinkCode) return setRunError('Select both source and factory nodes.')
    setRunning(true); setRunError('')
    try {
      setResult(await networkApi.runMaxFlow({ sourceCode, sinkCode, saveBenchmark }))
    } catch (err) { setRunError(apiErrorMessage(err)) } finally { setRunning(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  return (
    <>
      <PageHeader engine="FORD–FULKERSON" title="Network Flow Analysis" description="Compute the maximum quantity of harvested tea that can move through the active farm → hub → factory capacity network. The calculation runs only in the Spring Boot backend; React visualizes the returned flow, residual capacity and augmenting paths." />

      <div className="grid gap-6 2xl:grid-cols-[1.55fr_.75fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Capacity graph" title="Live Supply Network" description="Edge labels show capacity before calculation and flow/capacity after the algorithm returns." />
          <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} edgeFlows={result?.edgeFlows || []} /></div>
        </Panel>

        <Panel className="h-fit overflow-hidden">
          <PanelHeader eyebrow="Decision input" title="Run Maximum Flow" description="Select the source and factory used by the active graph." />
          <div className="space-y-4 p-5">
            <EndpointSelector nodes={graph.nodes} sourceCode={sourceCode} sinkCode={sinkCode} onSourceChange={setSourceCode} onSinkChange={setSinkCode} />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-tea-800" checked={saveBenchmark} onChange={(e) => setSaveBenchmark(e.target.checked)} /><span><b className="text-graphite">Save evidence</b><span className="block text-xs text-muted">Store this run in algorithm_test_results</span></span></label>
            <InlineError message={runError} />
            <Button className="w-full" onClick={run} disabled={running || !sourceCode || !sinkCode}>{running ? 'Calculating…' : <>Calculate Maximum Flow <ArrowRight size={16} /></>}</Button>
            <p className="text-xs leading-5 text-muted">POST /api/network/max-flow · No frontend max-flow implementation is used.</p>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricTile label="Maximum Throughput" value={result?.maximumFlowKgPerDay?.toLocaleString?.() ?? '—'} suffix={result ? 'kg/day' : ''} icon={Activity} />
        <MetricTile label="Nodes" value={result?.performance?.nodeCount ?? graph.nodes.filter((n) => n.active).length} icon={Network} />
        <MetricTile label="Edges" value={result?.performance?.edgeCount ?? graph.edges.filter((e) => e.active).length} icon={GitBranch} />
        <MetricTile label="Execution" value={result ? Number(result.performance.executionTimeMs).toFixed(4) : '—'} suffix={result ? 'ms' : ''} icon={Clock3} />
        <MetricTile label="Est. Algorithm Memory" value={result ? Number(result.performance.estimatedAlgorithmMemoryMb).toFixed(4) : '—'} suffix={result ? 'MB' : ''} icon={MemoryStick} />
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.45fr_.75fr]">
        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Returned result" title="Per-Connection Flow" description="Flow, residual capacity and utilization are taken directly from MaxFlowResponse.edgeFlows." />
          {result?.edgeFlows?.length ? <EdgeFlowTable rows={result.edgeFlows} /> : <EmptyState title="No flow result yet" description="Run Ford-Fulkerson to populate the edge-flow table." icon={Database} />}
        </Panel>

        <Panel className="overflow-hidden">
          <PanelHeader eyebrow="Algorithm trace" title="Augmenting Paths" description="DFS augmenting paths returned by the backend for viva and debugging evidence." />
          {result?.augmentingPaths?.length ? <div className="divide-y divide-tea-950/7">{result.augmentingPaths.map((path, i) => <div key={i} className="p-4"><div className="mb-2 flex items-center justify-between"><Badge tone="neutral">Path {i + 1}</Badge><span className="font-mono text-xs font-bold text-tea-800">+{path.addedFlowKgPerDay.toLocaleString()} kg/day</span></div><div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-graphite">{path.path.map((code, idx) => <span key={`${code}-${idx}`} className="contents"><span className="rounded-lg bg-tea-50 px-2 py-1 font-mono">{code}</span>{idx < path.path.length - 1 && <ArrowRight size={13} className="text-muted" />}</span>)}</div></div>)}</div> : <EmptyState title="No path trace" description="Augmenting paths will appear after a maximum-flow calculation." />}
        </Panel>
      </div>
    </>
  )
}
