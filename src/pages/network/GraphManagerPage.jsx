import { useMemo, useState } from 'react'
import { Edit3, GitBranch, Plus, Trash2 } from 'lucide-react'
import { networkApi } from '../../api/networkApi'
import { apiErrorMessage } from '../../api/client'
import { useNetwork } from '../../context/NetworkContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { ErrorState, InlineError, LoadingState } from '../../components/ui/Feedback'
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'
import { NetworkGraph } from '../../components/network/NetworkGraph'

const nodeTypes = ['SOURCE', 'FARM', 'HUB', 'FACTORY']

function NodeForm({ initial, onCancel, onSaved }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial ? { name: initial.name, nodeType: initial.nodeType, active: initial.active } : { code: '', name: '', nodeType: 'FARM', active: true })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await networkApi.updateNode(initial.id, form)
      else await networkApi.createNode({ ...form, code: form.code.trim().toUpperCase() })
      await onSaved()
    } catch (err) { setError(apiErrorMessage(err)) } finally { setBusy(false) }
  }
  return <form className="space-y-4" onSubmit={submit}>
    {!editing && <Field label="Node code" hint="Unique identifier used by all Module 3 APIs, e.g. F4 or H3."><input required maxLength="40" className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="F4" /></Field>}
    {editing && <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Code</span><span className="ml-3 font-mono font-bold">{initial.code}</span><div className="mt-1 text-xs text-muted">The backend update endpoint does not change node codes.</div></div>}
    <Field label="Display name"><input required maxLength="120" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
    <Field label="Node type"><select className={selectClass} value={form.nodeType} onChange={(e) => setForm({ ...form, nodeType: e.target.value })}>{nodeTypes.map((t) => <option key={t}>{t}</option>)}</select></Field>
    <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Active node</b><span className="block text-xs text-muted">Inactive nodes are excluded from the active flow network.</span></span></label>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Node' : 'Create Node'}</Button></div>
  </form>
}

function EdgeForm({ initial, nodes, onCancel, onSaved }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial ? { capacityKgPerDay: initial.capacityKgPerDay, active: initial.active, label: initial.label || '' } : { fromCode: '', toCode: '', capacityKgPerDay: 500, active: true, label: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const payload = { ...form, capacityKgPerDay: Number(form.capacityKgPerDay) }
      if (editing) await networkApi.updateEdge(initial.id, payload)
      else await networkApi.createEdge(payload)
      await onSaved()
    } catch (err) { setError(apiErrorMessage(err)) } finally { setBusy(false) }
  }
  return <form className="space-y-4" onSubmit={submit}>
    {editing ? <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="font-mono font-bold">{initial.fromCode} → {initial.toCode}</span><div className="mt-1 text-xs text-muted">The backend update endpoint edits capacity, active state and label only.</div></div> : <div className="grid gap-3 sm:grid-cols-2"><Field label="From node"><select required className={selectClass} value={form.fromCode} onChange={(e) => setForm({ ...form, fromCode: e.target.value })}><option value="">Select</option>{nodes.map((n) => <option key={n.id} value={n.code}>{n.code} — {n.name}</option>)}</select></Field><Field label="To node"><select required className={selectClass} value={form.toCode} onChange={(e) => setForm({ ...form, toCode: e.target.value })}><option value="">Select</option>{nodes.map((n) => <option key={n.id} value={n.code}>{n.code} — {n.name}</option>)}</select></Field></div>}
    <Field label="Capacity (kg/day)"><input required min="1" type="number" className={inputClass} value={form.capacityKgPerDay} onChange={(e) => setForm({ ...form, capacityKgPerDay: e.target.value })} /></Field>
    <Field label="Connection label"><input maxLength="160" className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Hub 1 to factory daily transport capacity" /></Field>
    <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Active connection</b><span className="block text-xs text-muted">Only active edges are included in calculations.</span></span></label>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Connection' : 'Create Connection'}</Button></div>
  </form>
}

export default function GraphManagerPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const [tab, setTab] = useState('nodes')
  const [nodeModal, setNodeModal] = useState(null)
  const [edgeModal, setEdgeModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const sortedNodes = useMemo(() => [...graph.nodes].sort((a,b) => a.nodeType.localeCompare(b.nodeType) || a.code.localeCompare(b.code)), [graph.nodes])

  const afterSave = async () => { await refreshGraph(); setNodeModal(null); setEdgeModal(null) }
  const remove = async () => {
    if (!confirm) return
    setDeleteBusy(true); setActionError('')
    try {
      if (confirm.kind === 'node') await networkApi.deleteNode(confirm.item.id)
      else await networkApi.deleteEdge(confirm.item.id)
      setConfirm(null); await refreshGraph()
    } catch (err) { setActionError(apiErrorMessage(err)); setConfirm(null) } finally { setDeleteBusy(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  return <>
    <PageHeader engine="DIRECTED CAPACITY GRAPH" title="Supply Graph Data" description="Manage the PostgreSQL-backed nodes and capacity edges used by both Member 5 and Member 6. CRUD is kept secondary to the algorithm views, but every backend graph endpoint is available here." />

    <Panel className="mb-6 overflow-hidden">
      <PanelHeader eyebrow="Current graph" title="Network Structure Preview" description="Inactive nodes and connections stay in the database but are excluded from the active flow network." />
      <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div>
    </Panel>

    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-tea-950/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2"><button onClick={() => setTab('nodes')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'nodes' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}>Nodes · {graph.nodes.length}</button><button onClick={() => setTab('edges')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'edges' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}>Connections · {graph.edges.length}</button></div>
        {tab === 'nodes' ? <Button size="sm" onClick={() => setNodeModal({ mode: 'create' })}><Plus size={15} /> Add Node</Button> : <Button size="sm" onClick={() => setEdgeModal({ mode: 'create' })}><Plus size={15} /> Add Connection</Button>}
      </div>
      {actionError && <div className="p-5 pb-0"><InlineError message={actionError} /></div>}

      {tab === 'nodes' ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">State</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{sortedNodes.map((n) => <tr key={n.id} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{n.code}</td><td className="px-5 py-3.5 font-semibold text-graphite">{n.name}</td><td className="px-5 py-3.5"><Badge tone="neutral">{n.nodeType}</Badge></td><td className="px-5 py-3.5"><Badge tone={n.active ? 'green' : 'neutral'}>{n.active ? 'Active' : 'Inactive'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setNodeModal({ mode: 'edit', item: n })}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'node', item: n })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
      : <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Connection</th><th className="px-5 py-3">Capacity</th><th className="px-5 py-3">Label</th><th className="px-5 py-3">State</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{graph.edges.map((e) => <tr key={e.id} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{e.fromCode} → {e.toCode}</td><td className="px-5 py-3.5 font-mono">{e.capacityKgPerDay.toLocaleString()} kg/day</td><td className="max-w-[420px] px-5 py-3.5 text-muted">{e.label || '—'}</td><td className="px-5 py-3.5"><Badge tone={e.active ? 'green' : 'neutral'}>{e.active ? 'Active' : 'Inactive'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setEdgeModal({ mode: 'edit', item: e })}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'edge', item: e })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </Panel>

    <Modal open={Boolean(nodeModal)} title={nodeModal?.mode === 'edit' ? `Edit ${nodeModal.item.code}` : 'Create Supply Node'} onClose={() => setNodeModal(null)}>{nodeModal && <NodeForm initial={nodeModal.item} onCancel={() => setNodeModal(null)} onSaved={afterSave} />}</Modal>
    <Modal open={Boolean(edgeModal)} title={edgeModal?.mode === 'edit' ? `Edit ${edgeModal.item.fromCode} → ${edgeModal.item.toCode}` : 'Create Capacity Connection'} onClose={() => setEdgeModal(null)}>{edgeModal && <EdgeForm initial={edgeModal.item} nodes={graph.nodes} onCancel={() => setEdgeModal(null)} onSaved={afterSave} />}</Modal>
    <ConfirmDialog open={Boolean(confirm)} title={`Delete ${confirm?.kind || ''}?`} description={confirm?.kind === 'node' ? `Delete ${confirm.item.code} — ${confirm.item.name}? If the node is referenced by capacity edges, the backend may reject the deletion until those edges are removed.` : `Delete the connection ${confirm?.item?.fromCode} → ${confirm?.item?.toCode}? This changes the persistent supply graph.`} busy={deleteBusy} onClose={() => setConfirm(null)} onConfirm={remove} />
  </>
}
