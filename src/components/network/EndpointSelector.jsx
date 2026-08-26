import { Field, selectClass } from '../ui/FormControls'

export function EndpointSelector({ nodes, sourceCode, sinkCode, onSourceChange, onSinkChange }) {
  const sources = nodes.filter((n) => n.active && n.nodeType === 'SOURCE')
  const sinks = nodes.filter((n) => n.active && n.nodeType === 'FACTORY')
  const sourceOptions = sources.length ? sources : nodes.filter((n) => n.active)
  const sinkOptions = sinks.length ? sinks : nodes.filter((n) => n.active)
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Supply starting point">
        <select className={selectClass} value={sourceCode} onChange={(e) => onSourceChange(e.target.value)}>
          <option value="">Select supply origin</option>
          {sourceOptions.map((location) => <option key={location.id} value={location.code}>{location.name} ({location.code})</option>)}
        </select>
      </Field>
      <Field label="Destination factory">
        <select className={selectClass} value={sinkCode} onChange={(e) => onSinkChange(e.target.value)}>
          <option value="">Select factory</option>
          {sinkOptions.map((location) => <option key={location.id} value={location.code}>{location.name} ({location.code})</option>)}
        </select>
      </Field>
    </div>
  )
}
