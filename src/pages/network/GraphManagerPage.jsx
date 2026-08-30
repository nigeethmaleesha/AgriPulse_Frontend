import { useMemo, useState } from 'react'
import { Edit3, Plus, Trash2 } from 'lucide-react'
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
import { locationTypeLabels } from '../../utils/displayLabels'

const locationTypes = ['SOURCE', 'FARM', 'HUB', 'FACTORY']

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
    {!editing && <Field label="Location code" hint="Short unique code used on the network map, for example F4 or C3."><input required maxLength="40" className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="F4" /></Field>}
    {editing && <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Location code</span><span className="ml-3 font-mono font-bold">{initial.code}</span><div className="mt-1 text-xs text-muted">The code stays fixed so existing transport connections remain consistent.</div></div>}
    <Field label="Location name"><input required maxLength="120" className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Green Valley Tea Farm" /></Field>
    <Field label="Location type"><select className={selectClass} value={form.nodeType} onChange={(e) => setForm({ ...form, nodeType: e.target.value })}>{locationTypes.map((t) => <option key={t} value={t}>{locationTypeLabels[t]}</option>)}</select></Field>
    <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Include in daily planning</b><span className="block text-xs text-muted">Turn this off to temporarily exclude the location from capacity checks.</span></span></label>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Location' : 'Add Location'}</Button></div>
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
    {editing ? <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="font-mono font-bold">{initial.fromCode} → {initial.toCode}</span><div className="mt-1 text-xs text-muted">You can update this connection's daily carrying limit, availability and description.</div></div> : <div className="grid gap-3 sm:grid-cols-2"><Field label="From location"><select required className={selectClass} value={form.fromCode} onChange={(e) => setForm({ ...form, fromCode: e.target.value })}><option value="">Select location</option>{nodes.map((n) => <option key={n.id} value={n.code}>{n.name} ({n.code})</option>)}</select></Field><Field label="To location"><select required className={selectClass} value={form.toCode} onChange={(e) => setForm({ ...form, toCode: e.target.value })}><option value="">Select location</option>{nodes.map((n) => <option key={n.id} value={n.code}>{n.name} ({n.code})</option>)}</select></Field></div>}
    <Field label="Daily carrying limit"><div className="relative"><input required min="1" type="number" className={`${inputClass} pr-20`} value={form.capacityKgPerDay} onChange={(e) => setForm({ ...form, capacityKgPerDay: e.target.value })} /><span className="absolute right-3 top-2.5 text-xs text-muted">kg/day</span></div></Field>
    <Field label="Connection description"><input maxLength="160" className={inputClass} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Collection Centre 1 to factory transport limit" /></Field>
    <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Connection available</b><span className="block text-xs text-muted">Unavailable connections are excluded from daily capacity planning.</span></span></label>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Connection' : 'Add Connection'}</Button></div>
  </form>
}

export default function GraphManagerPage() {
  const { graph, loading, error, refreshGraph } = useNetwork()
  const [tab, setTab] = useState('locations')
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
      if (confirm.kind === 'location') await networkApi.deleteNode(confirm.item.id)
      else await networkApi.deleteEdge(confirm.item.id)
      setConfirm(null); await refreshGraph()
    } catch (err) { setActionError(apiErrorMessage(err)); setConfirm(null) } finally { setDeleteBusy(false) }
  }

  if (loading) return <Panel><LoadingState /></Panel>
  if (error) return <Panel><ErrorState message={error} onRetry={() => refreshGraph().catch(() => undefined)} /></Panel>

  return <>
    <PageHeader engine="NETWORK SETUP" title="Supply Network Setup" description="Maintain the farms, collection centres, factory and transport connections used in daily capacity planning. Changes here affect future operational checks." />

    <Panel className="mb-6 overflow-hidden">
      <PanelHeader eyebrow="Current setup" title="Supply Network Preview" description="Locations or connections marked unavailable are kept in the system but excluded from daily planning." />
      <div className="p-4"><NetworkGraph nodes={graph.nodes} edges={graph.edges} compact /></div>
    </Panel>

    <Panel className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-tea-950/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2"><button onClick={() => setTab('locations')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'locations' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}>Locations · {graph.nodes.length}</button><button onClick={() => setTab('connections')} className={`rounded-xl px-4 py-2 text-sm font-bold ${tab === 'connections' ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900'}`}>Connections · {graph.edges.length}</button></div>
        {tab === 'locations' ? <Button size="sm" onClick={() => setNodeModal({ mode: 'create' })}><Plus size={15} /> Add Location</Button> : <Button size="sm" onClick={() => setEdgeModal({ mode: 'create' })}><Plus size={15} /> Add Connection</Button>}
      </div>
      {actionError && <div className="p-5 pb-0"><InlineError message={actionError} /></div>}

      {tab === 'locations' ? <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Code</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Planning status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{sortedNodes.map((n) => <tr key={n.id} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{n.code}</td><td className="px-5 py-3.5 font-semibold text-graphite">{n.name}</td><td className="px-5 py-3.5"><Badge tone="neutral">{locationTypeLabels[n.nodeType] || n.nodeType}</Badge></td><td className="px-5 py-3.5"><Badge tone={n.active ? 'green' : 'neutral'}>{n.active ? 'Included' : 'Excluded'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setNodeModal({ mode: 'edit', item: n })}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'location', item: n })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
      : <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Transport connection</th><th className="px-5 py-3">Daily limit</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Availability</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{graph.edges.map((e) => <tr key={e.id} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{e.fromCode} → {e.toCode}</td><td className="px-5 py-3.5 font-mono">{e.capacityKgPerDay.toLocaleString()} kg/day</td><td className="max-w-[420px] px-5 py-3.5 text-muted">{e.label || '—'}</td><td className="px-5 py-3.5"><Badge tone={e.active ? 'green' : 'neutral'}>{e.active ? 'Available' : 'Unavailable'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => setEdgeModal({ mode: 'edit', item: e })}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'connection', item: e })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>}
    </Panel>

    <Modal open={Boolean(nodeModal)} title={nodeModal?.mode === 'edit' ? `Edit ${nodeModal.item.name}` : 'Add Supply Location'} onClose={() => setNodeModal(null)}>{nodeModal && <NodeForm initial={nodeModal.item} onCancel={() => setNodeModal(null)} onSaved={afterSave} />}</Modal>
    <Modal open={Boolean(edgeModal)} title={edgeModal?.mode === 'edit' ? `Edit ${edgeModal.item.fromCode} → ${edgeModal.item.toCode}` : 'Add Transport Connection'} onClose={() => setEdgeModal(null)}>{edgeModal && <EdgeForm initial={edgeModal.item} nodes={graph.nodes} onCancel={() => setEdgeModal(null)} onSaved={afterSave} />}</Modal>
    <ConfirmDialog open={Boolean(confirm)} title={`Delete ${confirm?.kind || ''}?`} description={confirm?.kind === 'location' ? `Delete ${confirm.item.code} — ${confirm.item.name}? Remove any transport connections that use this location first if the system prevents deletion.` : `Delete the connection ${confirm?.item?.fromCode} → ${confirm?.item?.toCode}? This permanently changes the saved supply network.`} busy={deleteBusy} onClose={() => setConfirm(null)} onConfirm={remove} />
  </>
}
