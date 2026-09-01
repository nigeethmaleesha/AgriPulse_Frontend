import { useState } from 'react'
import {
  Boxes, ClipboardList, Edit3, Play, Plus, Trash2, Users, Zap, ZapOff,
  Gauge, Trophy, Scale, Timer, TrendingUp,
} from 'lucide-react'
import { useScheduling } from '../../context/SchedulingContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Panel, PanelHeader } from '../../components/ui/Panel'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { MetricTile } from '../../components/ui/MetricTile'
import { EmptyState, FeedbackBanner, InlineError } from '../../components/ui/Feedback'
import { Field, inputClass, selectClass } from '../../components/ui/FormControls'

const tabs = [
  { key: 'tasks', label: 'Production Tasks', icon: ClipboardList },
  { key: 'workers', label: 'Workers', icon: Users },
  { key: 'machines', label: 'Machines', icon: Boxes },
  { key: 'outages', label: 'Power Outages', icon: ZapOff },
]

function TaskForm({ initial, existingIds, onCancel, onSave }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial || { taskId: '', taskName: '', processingTimeHours: 2, priority: 5 })
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const taskId = form.taskId.trim().toUpperCase()
    if (!editing && existingIds.includes(taskId)) return setError('A task with this ID already exists.')
    if (Number(form.processingTimeHours) <= 0) return setError('Processing time must be greater than zero hours.')
    if (Number(form.priority) <= 0) return setError('Priority must be a positive number. Higher numbers matter more.')
    onSave({ taskId, taskName: form.taskName.trim(), processingTimeHours: Number(form.processingTimeHours), priority: Number(form.priority) })
  }
  return <form className="space-y-4" onSubmit={submit}>
    {!editing ? <Field label="Task ID" hint="Short unique code, for example T7."><input required maxLength="20" className={inputClass} value={form.taskId} onChange={(e) => setForm({ ...form, taskId: e.target.value })} placeholder="T7" /></Field>
      : <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Task ID</span><span className="ml-3 font-mono font-bold">{initial.taskId}</span></div>}
    <Field label="Task name"><input required maxLength="120" className={inputClass} value={form.taskName} onChange={(e) => setForm({ ...form, taskName: e.target.value })} placeholder="Rolling - Batch D" /></Field>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Processing time" hint="Machine hours required to finish this task."><div className="relative"><input required min="1" type="number" className={`${inputClass} pr-14`} value={form.processingTimeHours} onChange={(e) => setForm({ ...form, processingTimeHours: e.target.value })} /><span className="absolute right-3 top-2.5 text-xs text-muted">hrs</span></div></Field>
      <Field label="Priority" hint="Higher value matters more in the schedule."><input required min="1" type="number" className={inputClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} /></Field>
    </div>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">{editing ? 'Save Task' : 'Add Task'}</Button></div>
  </form>
}

function WorkerForm({ initial, existingIds, onCancel, onSave }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial || { workerId: '', workerName: '', shift: 'Morning', maxWorkingHours: 8 })
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const workerId = form.workerId.trim().toUpperCase()
    if (!editing && existingIds.includes(workerId)) return setError('A worker with this ID already exists.')
    if (Number(form.maxWorkingHours) <= 0) return setError('Maximum working hours must be greater than zero.')
    onSave({ workerId, workerName: form.workerName.trim(), shift: form.shift, maxWorkingHours: Number(form.maxWorkingHours) })
  }
  return <form className="space-y-4" onSubmit={submit}>
    {!editing ? <Field label="Worker ID" hint="Short unique code, for example W4."><input required maxLength="20" className={inputClass} value={form.workerId} onChange={(e) => setForm({ ...form, workerId: e.target.value })} placeholder="W4" /></Field>
      : <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Worker ID</span><span className="ml-3 font-mono font-bold">{initial.workerId}</span></div>}
    <Field label="Worker name"><input required maxLength="120" className={inputClass} value={form.workerName} onChange={(e) => setForm({ ...form, workerName: e.target.value })} placeholder="A. Jayasuriya" /></Field>
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Shift"><select className={selectClass} value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}><option value="Morning">Morning</option><option value="Evening">Evening</option><option value="Night">Night</option></select></Field>
      <Field label="Max working hours" hint="Working-hour limit for the day."><div className="relative"><input required min="1" type="number" className={`${inputClass} pr-14`} value={form.maxWorkingHours} onChange={(e) => setForm({ ...form, maxWorkingHours: e.target.value })} /><span className="absolute right-3 top-2.5 text-xs text-muted">hrs</span></div></Field>
    </div>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">{editing ? 'Save Worker' : 'Add Worker'}</Button></div>
  </form>
}

function MachineForm({ initial, existingIds, onCancel, onSave }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial || { machineId: '', machineName: '', available: true })
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const machineId = form.machineId.trim().toUpperCase()
    if (!editing && existingIds.includes(machineId)) return setError('A machine with this ID already exists.')
    onSave({ machineId, machineName: form.machineName.trim(), available: Boolean(form.available) })
  }
  return <form className="space-y-4" onSubmit={submit}>
    {!editing ? <Field label="Machine ID" hint="Short unique code, for example M3."><input required maxLength="20" className={inputClass} value={form.machineId} onChange={(e) => setForm({ ...form, machineId: e.target.value })} placeholder="M3" /></Field>
      : <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Machine ID</span><span className="ml-3 font-mono font-bold">{initial.machineId}</span></div>}
    <Field label="Machine name"><input required maxLength="120" className={inputClass} value={form.machineName} onChange={(e) => setForm({ ...form, machineName: e.target.value })} placeholder="Rolling Machine 2" /></Field>
    <label className="flex items-center gap-3 rounded-xl border border-tea-950/10 bg-white px-3 py-3 text-sm"><input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} className="h-4 w-4 accent-tea-800" /><span><b>Machine available</b><span className="block text-xs text-muted">Turn off for machines under maintenance or otherwise out of service today.</span></span></label>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">{editing ? 'Save Machine' : 'Add Machine'}</Button></div>
  </form>
}

function OutageForm({ initial, existingIds, onCancel, onSave }) {
  const editing = Boolean(initial)
  const [form, setForm] = useState(initial || { outageId: '', startHour: 12, endHour: 14 })
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const outageId = form.outageId.trim().toUpperCase()
    if (!editing && existingIds.includes(outageId)) return setError('A power outage with this ID already exists.')
    if (Number(form.startHour) < 0 || Number(form.endHour) > 24) return setError('Hours must be between 0 and 24.')
    if (Number(form.endHour) <= Number(form.startHour)) return setError('The end hour must be after the start hour.')
    onSave({ outageId, startHour: Number(form.startHour), endHour: Number(form.endHour) })
  }
  return <form className="space-y-4" onSubmit={submit}>
    {!editing ? <Field label="Outage ID" hint="Short unique code, for example O2."><input required maxLength="20" className={inputClass} value={form.outageId} onChange={(e) => setForm({ ...form, outageId: e.target.value })} placeholder="O2" /></Field>
      : <div className="rounded-xl border border-tea-950/10 bg-tea-50/60 p-3 text-sm"><span className="text-muted">Outage ID</span><span className="ml-3 font-mono font-bold">{initial.outageId}</span></div>}
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Start hour" hint="24-hour clock, 0-24."><input required min="0" max="24" type="number" className={inputClass} value={form.startHour} onChange={(e) => setForm({ ...form, startHour: e.target.value })} /></Field>
      <Field label="End hour" hint="24-hour clock, 0-24."><input required min="0" max="24" type="number" className={inputClass} value={form.endHour} onChange={(e) => setForm({ ...form, endHour: e.target.value })} /></Field>
    </div>
    <InlineError message={error} />
    <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">{editing ? 'Save Outage' : 'Add Outage'}</Button></div>
  </form>
}

const entityConfig = {
  tasks: { title: 'Add Production Task', keyField: 'taskId', Form: TaskForm },
  workers: { title: 'Add Worker', keyField: 'workerId', Form: WorkerForm },
  machines: { title: 'Add Machine', keyField: 'machineId', Form: MachineForm },
  outages: { title: 'Add Power Outage', keyField: 'outageId', Form: OutageForm },
}

function PlanCard({ title, badgeTone, planResult }) {
  if (!planResult) return null
  return (
    <Panel className="overflow-hidden">
      <PanelHeader
        eyebrow={`${planResult.tasksScheduled} / ${planResult.tasksTotal} tasks placed`}
        title={title}
        description={`Calculated in ${planResult.executionTimeMs.toFixed(2)} ms`}
        action={<Badge tone={badgeTone}>Value {planResult.totalPriorityValue}</Badge>}
      />
      <div className="p-5">
        {planResult.scheduledEntries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="text-left text-[11px] uppercase tracking-[.08em] text-muted">
                <tr><th className="py-2 pr-3">Task</th><th className="py-2 pr-3">Worker</th><th className="py-2 pr-3">Machine</th><th className="py-2 pr-3">Time</th></tr>
              </thead>
              <tbody className="divide-y divide-tea-950/7">
                {planResult.scheduledEntries.map((entry, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-3"><span className="font-mono font-bold">{entry.task.taskId}</span> <span className="text-muted">{entry.task.taskName}</span></td>
                    <td className="py-2 pr-3">{entry.worker.workerName}</td>
                    <td className="py-2 pr-3">{entry.machine.machineName}</td>
                    <td className="py-2 pr-3 font-mono">{entry.startHour}:00 - {entry.endHour}:00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No tasks scheduled" description="Nothing could be placed with the current inputs." icon={ClipboardList} />}

        {planResult.unscheduledTasks.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-800">Left waiting ({planResult.unscheduledTasks.length})</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {planResult.unscheduledTasks.map((t) => <Badge key={t.taskId} tone="amber">{t.taskId} · P{t.priority}</Badge>)}
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}

export default function FactorySchedulingPage() {
  const {
    tasks, workers, machines, outages, taskActions, workerActions, machineActions, outageActions,
    clearAll, result, running, runError, runSchedule,
  } = useScheduling()

  const [tab, setTab] = useState('tasks')
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const listsByKind = { tasks, workers, machines, outages }
  const actionsByKind = { tasks: taskActions, workers: workerActions, machines: machineActions, outages: outageActions }

  const openCreate = (kind) => setModal({ kind, mode: 'create' })
  const openEdit = (kind, item) => setModal({ kind, mode: 'edit', item })
  const closeModal = () => setModal(null)

  const save = (kind, item) => {
    const { keyField } = entityConfig[kind]
    if (modal?.mode === 'edit') actionsByKind[kind].update(modal.item[keyField], item)
    else actionsByKind[kind].add(item)
    closeModal()
  }
  const remove = () => {
    if (!confirm) return
    const { keyField } = entityConfig[confirm.kind]
    actionsByKind[confirm.kind].remove(confirm.item[keyField])
    setConfirm(null)
  }

  const run = async () => {
    try { await runSchedule() } catch { /* surfaced via runError */ }
  }

  const outageHours = outages.reduce((sum, o) => sum + Math.max(0, o.endHour - o.startHour), 0)
  const availableMachines = machines.filter((m) => m.available).length

  return <>
    <PageHeader
      module="FACTORY PROCESSING"
      engine="SHIFT SCHEDULE OPTIMIZATION"
      title="Factory Processing & Worker Shift Scheduler"
      description="Set up today's production tasks, workers, machines and any power outage windows, then generate an optimized shift schedule. Two independent optimization strategies are run and compared so you can see how much they agree."
      action={<Button variant="secondary" size="sm" onClick={clearAll}><Trash2 size={15} /> Clear All</Button>}
    />

    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricTile label="Production tasks" value={tasks.length} icon={ClipboardList} caption="Batches waiting for today's production window" />
      <MetricTile label="Workers" value={workers.length} icon={Users} caption="Available for shift assignment" />
      <MetricTile label="Machines" value={`${availableMachines}/${machines.length}`} icon={Boxes} caption="Available / total machines" tone={availableMachines < machines.length ? 'amber' : 'green'} />
      <MetricTile label="Power outage hours" value={outageHours} suffix="hrs blocked" icon={Zap} tone={outageHours > 0 ? 'amber' : 'green'} caption="Hours the factory has no power today" />
    </div>

    <Panel className="mb-6 overflow-hidden">
      <div className="flex flex-wrap gap-2 border-b border-tea-950/8 px-5 py-4">
        {tabs.map(({ key, label, icon: Icon }) => <button key={key} onClick={() => setTab(key)} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition ${tab === key ? 'bg-tea-950 text-white' : 'bg-tea-50 text-tea-900 hover:bg-tea-100'}`}><Icon size={15} /> {label} · {listsByKind[key].length}</button>)}
      </div>

      <PanelHeader eyebrow="Manage inputs" title={tabs.find((t) => t.key === tab).label} description={{
        tasks: 'Each task represents one tea batch waiting to be processed, with its processing time and priority.',
        workers: 'Workers have a shift and a daily working-hour limit that the schedule will not exceed.',
        machines: 'Machines process one task at a time. Mark a machine unavailable if it is under maintenance today.',
        outages: 'Power outage windows are hours during which no task may start or be in progress.',
      }[tab]} action={<Button size="sm" onClick={() => openCreate(tab)}><Plus size={15} /> Add {tab === 'outages' ? 'Outage' : tabs.find((t) => t.key === tab).label.replace(/s$/, '')}</Button>} />

      {tab === 'tasks' && (tasks.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Task ID</th><th className="px-5 py-3">Task name</th><th className="px-5 py-3">Processing time</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{tasks.map((t) => <tr key={t.taskId} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{t.taskId}</td><td className="px-5 py-3.5 font-semibold text-graphite">{t.taskName}</td><td className="px-5 py-3.5 font-mono">{t.processingTimeHours} hrs</td><td className="px-5 py-3.5"><Badge tone="neutral">Priority {t.priority}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => openEdit('tasks', t)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'tasks', item: t, label: t.taskName })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No production tasks yet" description="Add a tea batch to include it in today's factory schedule." icon={ClipboardList} />)}

      {tab === 'workers' && (workers.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Worker ID</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Shift</th><th className="px-5 py-3">Max hours/day</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{workers.map((w) => <tr key={w.workerId} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{w.workerId}</td><td className="px-5 py-3.5 font-semibold text-graphite">{w.workerName}</td><td className="px-5 py-3.5"><Badge tone="neutral">{w.shift}</Badge></td><td className="px-5 py-3.5 font-mono">{w.maxWorkingHours} hrs</td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => openEdit('workers', w)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'workers', item: w, label: w.workerName })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No workers yet" description="Add workers so the schedule can assign them to production tasks." icon={Users} />)}

      {tab === 'machines' && (machines.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Machine ID</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Availability</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{machines.map((m) => <tr key={m.machineId} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{m.machineId}</td><td className="px-5 py-3.5 font-semibold text-graphite">{m.machineName}</td><td className="px-5 py-3.5"><Badge tone={m.available ? 'green' : 'neutral'}>{m.available ? 'Available' : 'Unavailable'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => openEdit('machines', m)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'machines', item: m, label: m.machineName })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No machines yet" description="Add the machines available in the factory today." icon={Boxes} />)}

      {tab === 'outages' && (outages.length ? <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead className="bg-tea-50/65 text-left text-[11px] uppercase tracking-[.08em] text-muted"><tr><th className="px-5 py-3">Outage ID</th><th className="px-5 py-3">Start hour</th><th className="px-5 py-3">End hour</th><th className="px-5 py-3">Duration</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-tea-950/7">{outages.map((o) => <tr key={o.outageId} className="hover:bg-tea-50/30"><td className="px-5 py-3.5 font-mono font-bold">{o.outageId}</td><td className="px-5 py-3.5 font-mono">{o.startHour}:00</td><td className="px-5 py-3.5 font-mono">{o.endHour}:00</td><td className="px-5 py-3.5"><Badge tone="amber">{o.endHour - o.startHour} hrs</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><button className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" onClick={() => openEdit('outages', o)}><Edit3 size={16} /></button><button className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-critical" onClick={() => setConfirm({ kind: 'outages', item: o, label: o.outageId })}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div> : <EmptyState title="No power outages today" description="Add a window here if the factory will lose power for part of the day." icon={ZapOff} />)}

      <div className="border-t border-tea-950/8 p-5">
        <InlineError message={runError} />
        <Button className="w-full" onClick={run} disabled={running || !tasks.length || !workers.length || !machines.length}>
          <Play size={16} /> {running ? 'Generating schedule…' : 'Generate Optimized Schedule'}
        </Button>
      </div>
    </Panel>

    {result && (
      <>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Evolutionary plan value" value={result.geneticResult.totalPriorityValue} icon={Gauge} caption={`${result.geneticResult.tasksScheduled} of ${result.geneticResult.tasksTotal} tasks placed`} />
          <MetricTile label="Annealing plan value" value={result.annealingResult.totalPriorityValue} icon={Trophy} tone="green" caption={`${result.annealingResult.tasksScheduled} of ${result.annealingResult.tasksTotal} tasks placed`} />
          <MetricTile label="Difference between plans" value={`${result.differencePercent.toFixed(1)}%`} icon={Scale} tone={result.betterMethod === 'TIE' ? 'green' : 'amber'} caption="How far apart the two strategies landed" />
          <MetricTile label="Calculation time" value={`${result.geneticResult.executionTimeMs.toFixed(1)} / ${result.annealingResult.executionTimeMs.toFixed(1)}`} suffix="ms" icon={Timer} caption="Evolutionary vs. annealing calculation time" />
        </div>

        <FeedbackBanner type={result.betterMethod === 'TIE' ? 'success' : 'info'} message={result.verdict} />

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <PlanCard title="Evolutionary Plan" badgeTone="neutral" planResult={result.geneticResult} />
          <PlanCard title="Simulated Annealing Plan" badgeTone="green" planResult={result.annealingResult} />
        </div>
      </>
    )}

    {!result && (
      <Panel className="overflow-hidden"><EmptyState title="No schedule yet" description="Generate a schedule to see both optimization strategies' shift plans side by side." icon={TrendingUp} /></Panel>
    )}

    <Modal open={Boolean(modal)} title={modal?.mode === 'edit' ? `Edit ${modal.item[entityConfig[modal.kind]?.keyField] || ''}` : modal ? entityConfig[modal.kind].title : ''} onClose={closeModal}>
      {modal && (() => {
        const { Form, keyField } = entityConfig[modal.kind]
        const existingIds = listsByKind[modal.kind].map((x) => x[keyField])
        return <Form initial={modal.item} existingIds={existingIds} onCancel={closeModal} onSave={(item) => save(modal.kind, item)} />
      })()}
    </Modal>

    <ConfirmDialog open={Boolean(confirm)} title="Remove item?" description={`Remove "${confirm?.label}" from today's production inputs? This only affects this session and can be re-added at any time.`} onClose={() => setConfirm(null)} onConfirm={remove} />
  </>
}
