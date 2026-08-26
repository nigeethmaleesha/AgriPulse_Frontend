import { Field, selectClass } from '../ui/FormControls'

export function EndpointSelector({ nodes, sourceCode, sinkCode, onSourceChange, onSinkChange }) {
  const sources = nodes.filter((n) => n.active && n.nodeType === 'SOURCE')
  const sinks = nodes.filter((n) => n.active && n.nodeType === 'FACTORY')
  const sourceOptions = sources.length ? sources : nodes.filter((n) => n.active)
  const sinkOptions = sinks.length ? sinks : nodes.filter((n) => n.active)
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Source node">
        <select className={selectClass} value={sourceCode} onChange={(e) => onSourceChange(e.target.value)}>
          <option value="">Select source</option>
          {sourceOptions.map((node) => <option key={node.id} value={node.code}>{node.code} — {node.name}</option>)}
        </select>
      </Field>
      <Field label="Factory / sink">
        <select className={selectClass} value={sinkCode} onChange={(e) => onSinkChange(e.target.value)}>
          <option value="">Select sink</option>
          {sinkOptions.map((node) => <option key={node.id} value={node.code}>{node.code} — {node.name}</option>)}
        </select>
      </Field>
    </div>
  )
}
