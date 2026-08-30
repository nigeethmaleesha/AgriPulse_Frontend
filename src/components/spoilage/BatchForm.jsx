import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { Field, inputClass } from '../ui/FormControls'
import { InlineError } from '../ui/Feedback'

function localDateTimeValue() {
  const date = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}

export function BatchForm({ onSubmit, submitLabel = 'Add Harvest Batch', busy = false }) {
  const [form, setForm] = useState({
    farmId: '', collectionPointId: '', quantity: '', harvestTime: localDateTimeValue(), temperature: '', humidity: '',
  })
  const [error, setError] = useState('')

  const valid = useMemo(() => Number(form.farmId) > 0 && Number(form.collectionPointId) > 0 && Number(form.quantity) > 0 && form.harvestTime && Number.isFinite(Number(form.temperature)) && Number.isFinite(Number(form.humidity)), [form])

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  async function submit(event) {
    event.preventDefault()
    if (!valid) {
      setError('Enter valid farm, collection point, quantity, harvest time, temperature and humidity values.')
      return
    }
    setError('')
    await onSubmit({
      farmId: Number(form.farmId),
      collectionPointId: Number(form.collectionPointId),
      quantity: Number(form.quantity),
      harvestTime: `${form.harvestTime}:00`,
      temperature: Number(form.temperature),
      humidity: Number(form.humidity),
    })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Farm ID"><input className={inputClass} type="number" min="1" value={form.farmId} onChange={update('farmId')} placeholder="e.g. 5" /></Field>
        <Field label="Collection Point ID"><input className={inputClass} type="number" min="1" value={form.collectionPointId} onChange={update('collectionPointId')} placeholder="e.g. 3" /></Field>
        <Field label="Quantity" hint="Kilograms"><input className={inputClass} type="number" min="0.01" step="0.01" value={form.quantity} onChange={update('quantity')} placeholder="e.g. 105" /></Field>
        <Field label="Harvest Time"><input className={inputClass} type="datetime-local" value={form.harvestTime} onChange={update('harvestTime')} /></Field>
        <Field label="Temperature" hint="Degrees Celsius"><input className={inputClass} type="number" step="0.1" value={form.temperature} onChange={update('temperature')} placeholder="e.g. 29" /></Field>
        <Field label="Humidity" hint="Relative humidity %"><input className={inputClass} type="number" min="0" max="100" step="0.1" value={form.humidity} onChange={update('humidity')} placeholder="e.g. 88" /></Field>
      </div>
      <div className="rounded-xl border border-tea-950/10 bg-tea-50/70 px-4 py-3 text-xs leading-5 text-muted"><strong className="text-graphite">Risk score is read-only.</strong> The Spring Boot backend calculates it from waiting time, temperature and humidity.</div>
      <InlineError message={error} />
      <div className="flex justify-end"><Button type="submit" disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button></div>
    </form>
  )
}
