import { useMemo, useState } from 'react'
import {
  Database,
  Edit3,
  GitBranch,
  Link2,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { useNetwork } from '../../context/NetworkContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  EmptyState,
  ErrorState,
  FeedbackBanner,
  InlineError,
  LoadingState,
} from '../../components/ui/Feedback'
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'
import { NetworkGraph } from '../../components/network/NetworkGraph'
import { locationTypeLabels } from '../../utils/displayLabels'

const locationTypes = ['SOURCE', 'FARM', 'HUB', 'FACTORY']
const validTargets = {
  SOURCE: ['FARM'],
  FARM: ['HUB'],
  HUB: ['FACTORY'],
  FACTORY: [],
}

function NodeForm({ initial, nodes, onCancel, onSaved }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, nodeType: initial.nodeType, active: initial.active }
      : { code: '', name: '', nodeType: 'FARM', active: true },
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const endpointTaken = (type) => nodes.some(
    (node) => node.nodeType === type && (!editing || node.id !== initial.id),
  )

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (editing) {
        await networkApi.updateNode(initial.id, form)
      } else {
        await networkApi.createNode({ ...form, code: form.code.trim().toUpperCase() })
      }
      await onSaved()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {!editing ? (
        <Field
          label="Location code"
          hint="Short unique code used by the graph and algorithms, for example F4, H3 or FACTORY."
        >
          <input
            required
            maxLength="40"
            className={inputClass}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="F4"
          />
        </Field>
      ) : (
        <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm">
          <span className="text-muted">Location code</span>
          <span className="ml-3 font-mono font-bold">{initial.code}</span>
          <div className="mt-1 text-xs text-muted">
            The code stays fixed so existing transport connections and saved analysis references remain consistent.
          </div>
        </div>
      )}

      <Field label="Location name">
        <input
          required
          maxLength="120"
          className={inputClass}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Green Valley Tea Farm"
        />
      </Field>

      <Field
        label="Location type"
        hint="The Module 3 capacity graph follows Supply Source → Tea Farm → Collection Centre → Factory."
      >
        <select
          className={selectClass}
          value={form.nodeType}
          onChange={(e) => setForm({ ...form, nodeType: e.target.value })}
        >
          {locationTypes.map((type) => {
            const unavailable = (type === 'SOURCE' || type === 'FACTORY') && endpointTaken(type)
            return (
              <option key={type} value={type} disabled={unavailable}>
                {locationTypeLabels[type]}{unavailable ? ' — already added' : ''}
              </option>
            )
          })}
        </select>
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="h-4 w-4 accent-tea-800"
        />
        <span>
          <b>Include in daily planning</b>
          <span className="block text-xs text-muted">
            Turn this off to keep the location saved but exclude it from capacity checks.
          </span>
        </span>
      </label>

      <InlineError message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : editing ? 'Save Location' : 'Add Location'}
        </Button>
      </div>
    </form>
  )
}

function EdgeForm({ initial, nodes, onCancel, onSaved }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(
    initial
      ? {
          fromCode: initial.fromCode,
          toCode: initial.toCode,
          capacityKgPerDay: initial.capacityKgPerDay,
          active: initial.active,
          label: initial.label || '',
        }
      : {
          fromCode: '',
          toCode: '',
          capacityKgPerDay: 500,
          active: true,
          label: '',
        },
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const fromNode = nodes.find((node) => node.code === form.fromCode)
  const allowedTargetTypes = fromNode ? validTargets[fromNode.nodeType] || [] : []
  const fromOptions = nodes.filter((node) => node.nodeType !== 'FACTORY')
  const toOptions = fromNode
    ? nodes.filter((node) => allowedTargetTypes.includes(node.nodeType) && node.code !== fromNode.code)
    : []

  const changeFrom = (code) => {
    const selectedFrom = nodes.find((node) => node.code === code)
    const allowed = selectedFrom ? validTargets[selectedFrom.nodeType] || [] : []
    const currentTo = nodes.find((node) => node.code === form.toCode)
    setForm({
      ...form,
      fromCode: code,
      toCode: currentTo && allowed.includes(currentTo.nodeType) ? currentTo.code : '',
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = {
        ...form,
        capacityKgPerDay: Number(form.capacityKgPerDay),
      }
      if (editing) await networkApi.updateEdge(initial.id, payload)
      else await networkApi.createEdge(payload)
      await onSaved()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="From location">
          <select
            required
            className={selectClass}
            value={form.fromCode}
            onChange={(e) => changeFrom(e.target.value)}
          >
            <option value="">Select location</option>
            {fromOptions.map((node) => (
              <option key={node.id} value={node.code}>
                {node.name} ({node.code}) — {locationTypeLabels[node.nodeType]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="To location"
          hint={fromNode ? `Valid next stage from ${locationTypeLabels[fromNode.nodeType]}.` : 'Choose the start location first.'}
        >
          <select
            required
            className={selectClass}
            value={form.toCode}
            onChange={(e) => setForm({ ...form, toCode: e.target.value })}
            disabled={!fromNode}
          >
            <option value="">Select location</option>
            {toOptions.map((node) => (
              <option key={node.id} value={node.code}>
                {node.name} ({node.code}) — {locationTypeLabels[node.nodeType]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Daily carrying limit"
        hint="Maximum amount of tea this connection can carry in one day. This becomes the edge capacity used by Ford-Fulkerson."
      >
        <div className="relative">
          <input
            required
            min="1"
            step="1"
            type="number"
            className={`${inputClass} pr-20`}
            value={form.capacityKgPerDay}
            onChange={(e) => setForm({ ...form, capacityKgPerDay: e.target.value })}
          />
          <span className="absolute right-3 top-2.5 text-xs text-muted">kg/day</span>
        </div>
      </Field>

      <Field label="Connection description" hint="Optional note for operators; it does not change the algorithm.">
        <input
          maxLength="160"
          className={inputClass}
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="Collection Centre 1 to factory transport limit"
        />
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
          className="h-4 w-4 accent-tea-800"
        />
        <span>
          <b>Connection available</b>
          <span className="block text-xs text-muted">
            Unavailable connections remain saved but are excluded from daily capacity calculations.
          </span>
        </span>
      </label>

      <InlineError message={error} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="submit" disabled={busy || !form.fromCode || !form.toCode}>
          {busy ? 'Saving…' : editing ? 'Save Connection' : 'Add Connection'}
        </Button>
      </div>
    </form>
  )
}

export default function GraphManagerPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const [tab, setTab] = useState('locations')
  const [nodeModal, setNodeModal] = useState(null)
  const [edgeModal, setEdgeModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [setupConfirm, setSetupConfirm] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [setupBusy, setSetupBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const sortedNodes = useMemo(
    () => [...graph.nodes].sort((a, b) => a.nodeType.localeCompare(b.nodeType) || a.code.localeCompare(b.code)),
    [graph.nodes],
  )

  const activeNodes = graph.nodes.filter((node) => node.active)
  const activeEdges = graph.edges.filter((edge) => edge.active)
  const source = activeNodes.find((node) => node.nodeType === 'SOURCE')
  const factory = activeNodes.find((node) => node.nodeType === 'FACTORY')
  const hasFarm = activeNodes.some((node) => node.nodeType === 'FARM')
  const hasHub = activeNodes.some((node) => node.nodeType === 'HUB')
  const readyForAnalysis = Boolean(source && factory && hasFarm && hasHub && activeEdges.length)
  const canAddConnection = graph.nodes.length >= 2

  const afterSave = async (kind) => {
    await refreshGraph()
    setNodeModal(null)
    setEdgeModal(null)
    setTab(kind === 'connection' ? 'connections' : 'locations')
    setSuccessMessage(kind === 'connection' ? 'Transport connection saved to PostgreSQL.' : 'Supply location saved to PostgreSQL.')
  }

  const openConnectionModal = () => {
    setActionError('')
    if (!canAddConnection) {
      setActionError('Add at least two locations before creating a transport connection.')
      return
    }
    setEdgeModal({ mode: 'create' })
  }

  const remove = async () => {
    if (!confirm) return
    setDeleteBusy(true)
    setActionError('')
    setSuccessMessage('')
    try {
      if (confirm.kind === 'location') await networkApi.deleteNode(confirm.item.id)
      else await networkApi.deleteEdge(confirm.item.id)
      setConfirm(null)
      await refreshGraph()
      setSuccessMessage(confirm.kind === 'location' ? 'Location deleted.' : 'Transport connection deleted.')
    } catch (err) {
      setActionError(apiErrorMessage(err))
      setConfirm(null)
    } finally {
      setDeleteBusy(false)
    }
  }

  const runSetupAction = async () => {
    if (!setupConfirm) return
    setSetupBusy(true)
    setActionError('')
    setSuccessMessage('')
    try {
      if (setupConfirm === 'clear') {
        await networkApi.clearGraph()
        setSuccessMessage('Module 3 network cleared. You can now build the graph manually from an empty database.')
      } else {
        await networkApi.loadDemoGraph()
        setSuccessMessage('Coursework demo network loaded. You can edit it, extend it, or clear it and enter your own data.')
      }
      setSetupConfirm(null)
      setTab('locations')
      await refreshGraph()
    } catch (err) {
      setActionError(apiErrorMessage(err))
      setSetupConfirm(null)
    } finally {
      setSetupBusy(false)
    }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  return (
    <>
      <PageHeader
        engine="NETWORK SETUP"
        title="Supply Network Setup"
        description="Enter and maintain the Module 3 graph manually. Saved locations and transport capacities are stored in PostgreSQL and become the input for Flow Monitoring, Critical Connections and Scenario Planning."
      />

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader
          eyebrow="Manual data entry"
          title="Build the Tea Supply Capacity Graph"
          description="Create the locations first, connect them with daily carrying limits, then run the PDSA analysis pages against the saved graph. Demo data is optional and is never required for the algorithms."
          action={(
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSetupConfirm('demo')}>
                <RotateCcw size={15} /> Load Demo Network
              </Button>
              <Button variant="danger" size="sm" onClick={() => setSetupConfirm('clear')} disabled={!graph.nodes.length && !graph.edges.length}>
                <Trash2 size={15} /> Clear Network
              </Button>
            </div>
          )}
        />

        <div className="grid gap-3 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-tea-950/10 bg-white p-4">
            <div className="flex items-center gap-2 text-tea-800"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tea-50 font-bold">1</span><Database size={17} /></div>
            <p className="mt-3 font-bold text-graphite">Add locations</p>
            <p className="mt-1 text-sm leading-5 text-muted">Create one supply source, tea farms, collection centres and one factory.</p>
            <Button size="sm" className="mt-4" onClick={() => setNodeModal({ mode: 'create' })}><Plus size={15} /> Add Location</Button>
          </div>

          <div className="rounded-2xl border border-tea-950/10 bg-white p-4">
            <div className="flex items-center gap-2 text-tea-800"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tea-50 font-bold">2</span><Link2 size={17} /></div>
            <p className="mt-3 font-bold text-graphite">Add transport connections</p>
            <p className="mt-1 text-sm leading-5 text-muted">Choose From, To and the daily capacity in kg/day. These values are the graph edge capacities.</p>
            <Button size="sm" className="mt-4" onClick={openConnectionModal} disabled={!canAddConnection}><Plus size={15} /> Add Connection</Button>
          </div>

          <div className="rounded-2xl border border-tea-950/10 bg-white p-4">
            <div className="flex items-center gap-2 text-tea-800"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tea-50 font-bold">3</span><GitBranch size={17} /></div>
            <p className="mt-3 font-bold text-graphite">Run network analysis</p>
            <p className="mt-1 text-sm leading-5 text-muted">Flow Monitoring and the other Module 3 pages read this saved graph from the backend.</p>
            <div className="mt-4"><Badge tone={readyForAnalysis ? 'green' : 'neutral'}>{readyForAnalysis ? 'Ready for analysis' : 'Setup incomplete'}</Badge></div>
          </div>
        </div>
      </Panel>

      {successMessage && (
        <div className="mb-5">
          <FeedbackBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage('')} />
        </div>
      )}
      {actionError && (
        <div className="mb-5">
          <InlineError message={actionError} />
        </div>
      )}

      <Panel className="mb-6 overflow-hidden">
        <PanelHeader
          eyebrow="Current setup"
          title="Supply Network Preview"
          description="This preview uses the exact locations and capacities currently stored in Module 3. Locations or connections marked unavailable remain saved but are excluded from daily planning."
          action={(
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge tone={source ? 'green' : 'neutral'}>{source ? `Source: ${source.code}` : 'Source missing'}</Badge>
              <Badge tone={factory ? 'green' : 'neutral'}>{factory ? `Factory: ${factory.code}` : 'Factory missing'}</Badge>
              <Badge tone={readyForAnalysis ? 'green' : 'neutral'}>{activeNodes.length} active locations · {activeEdges.length} active connections</Badge>
            </div>
          )}
        />
        <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-tea-950/8 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="section-kicker mb-2">Saved PostgreSQL data</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTab('locations')}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'locations' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}
              >
                Locations · {graph.nodes.length}
              </button>
              <button
                onClick={() => setTab('connections')}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'connections' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}
              >
                Connections · {graph.edges.length}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setTab('locations'); setNodeModal({ mode: 'create' }) }}>
              <Plus size={15} /> Add Location
            </Button>
            <Button size="sm" onClick={() => { setTab('connections'); openConnectionModal() }} disabled={!canAddConnection}>
              <Plus size={15} /> Add Connection
            </Button>
          </div>
        </div>

        {tab === 'locations' ? (
          sortedNodes.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted">
                  <tr>
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Planning status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tea-950/7">
                  {sortedNodes.map((node) => (
                    <tr key={node.id} className="hover:bg-tea-50/30">
                      <td className="px-5 py-3.5 font-mono font-bold">{node.code}</td>
                      <td className="px-5 py-3.5 font-semibold text-graphite">{node.name}</td>
                      <td className="px-5 py-3.5"><Badge tone="neutral">{locationTypeLabels[node.nodeType] || node.nodeType}</Badge></td>
                      <td className="px-5 py-3.5"><Badge tone={node.active ? 'green' : 'neutral'}>{node.active ? 'Included' : 'Excluded'}</Badge></td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setNodeModal({ mode: 'edit', item: node })} aria-label={`Edit ${node.code}`}><Edit3 size={16} /></button>
                          <button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'location', item: node })} aria-label={`Delete ${node.code}`}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No locations saved yet"
              description="Start manually by adding the supply source, farms, collection centres and factory. Nothing is hard-coded here."
              icon={Database}
            />
          )
        ) : graph.edges.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted">
                <tr>
                  <th className="px-5 py-3">Transport connection</th>
                  <th className="px-5 py-3">Daily limit</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Availability</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tea-950/7">
                {graph.edges.map((edge) => (
                  <tr key={edge.id} className="hover:bg-tea-50/30">
                    <td className="px-5 py-3.5 font-mono font-bold">{edge.fromCode} → {edge.toCode}</td>
                    <td className="px-5 py-3.5 font-mono">{Number(edge.capacityKgPerDay).toLocaleString()} kg/day</td>
                    <td className="max-w-[420px] px-5 py-3.5 text-muted">{edge.label || '—'}</td>
                    <td className="px-5 py-3.5"><Badge tone={edge.active ? 'green' : 'neutral'}>{edge.active ? 'Available' : 'Unavailable'}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setEdgeModal({ mode: 'edit', item: edge })} aria-label={`Edit ${edge.fromCode} to ${edge.toCode}`}><Edit3 size={16} /></button>
                        <button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'connection', item: edge })} aria-label={`Delete ${edge.fromCode} to ${edge.toCode}`}><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No transport connections saved yet"
            description="Add a connection and enter its daily carrying limit. The value you enter becomes an edge capacity in the maximum-flow graph."
            icon={Link2}
          />
        )}
      </Panel>

      <Modal
        open={Boolean(nodeModal)}
        title={nodeModal?.mode === 'edit' ? `Edit ${nodeModal.item.name}` : 'Add Supply Location'}
        onClose={() => setNodeModal(null)}
      >
        {nodeModal && (
          <NodeForm
            initial={nodeModal.item}
            nodes={graph.nodes}
            onCancel={() => setNodeModal(null)}
            onSaved={() => afterSave('location')}
          />
        )}
      </Modal>

      <Modal
        open={Boolean(edgeModal)}
        title={edgeModal?.mode === 'edit' ? `Edit ${edgeModal.item.fromCode} → ${edgeModal.item.toCode}` : 'Add Transport Connection'}
        onClose={() => setEdgeModal(null)}
      >
        {edgeModal && (
          <EdgeForm
            initial={edgeModal.item}
            nodes={graph.nodes}
            onCancel={() => setEdgeModal(null)}
            onSaved={() => afterSave('connection')}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={`Delete ${confirm?.kind || ''}?`}
        description={confirm?.kind === 'location'
          ? `Delete ${confirm.item.code} — ${confirm.item.name}? If a transport connection uses this location, delete that connection first.`
          : `Delete the connection ${confirm?.item?.fromCode} → ${confirm?.item?.toCode}? This permanently changes the saved Module 3 network.`}
        busy={deleteBusy}
        onClose={() => setConfirm(null)}
        onConfirm={remove}
      />

      <ConfirmDialog
        open={Boolean(setupConfirm)}
        title={setupConfirm === 'clear' ? 'Clear the Module 3 network?' : 'Load the coursework demo network?'}
        description={setupConfirm === 'clear'
          ? 'This removes all saved Module 3 locations and transport connections from PostgreSQL. It does not change any other AgriPulse module. You can then enter a new network manually.'
          : 'This replaces the current Module 3 locations and transport connections with the reproducible SOURCE → Farms → Collection Centres → Factory demo network. Other modules are not changed.'}
        confirmText={setupConfirm === 'clear' ? 'Clear Network' : 'Load Demo Network'}
        busy={setupBusy}
        onClose={() => setSetupConfirm(null)}
        onConfirm={runSetupAction}
      />
    </>
  )
}
