import { useMemo } from 'react'
import { locationTypeShortLabels } from '../../utils/displayLabels'

const columns = { SOURCE: 100, FARM: 330, HUB: 610, FACTORY: 890 }
const nodeFill = { SOURCE: '#123D32', FARM: '#2F6B4F', HUB: '#C58A2C', FACTORY: '#202923' }

function layout(nodes) {
  const groups = { SOURCE: [], FARM: [], HUB: [], FACTORY: [] }
  nodes.filter((n) => n.active).forEach((n) => (groups[n.nodeType] || groups.FARM).push(n))
  const positions = {}
  Object.entries(groups).forEach(([type, list]) => {
    const gap = 390 / Math.max(list.length + 1, 2)
    list.forEach((node, i) => {
      positions[node.code] = { x: columns[type] || 450, y: 55 + gap * (i + 1), type }
    })
  })
  return positions
}

function flowFor(edge, edgeFlows) {
  return edgeFlows?.find((f) => f.fromCode === edge.fromCode && f.toCode === edge.toCode)
}

export function NetworkGraph({ nodes = [], edges = [], edgeFlows = [], compact = false }) {
  const positions = useMemo(() => layout(nodes), [nodes])
  const activeEdges = edges.filter((edge) => edge.active && positions[edge.fromCode] && positions[edge.toCode])
  if (!nodes.length) return <div className="flex min-h-[320px] items-center justify-center text-sm text-muted">No supply locations are available.</div>

  return (
    <div className={`grid-paper overflow-auto rounded-2xl border border-tea-950/10 bg-[#fbfbf7] ${compact ? 'min-h-[300px]' : 'min-h-[440px]'}`}>
      <svg viewBox="0 0 1000 500" className={`${compact ? 'min-w-[760px]' : 'min-w-[900px]'} w-full`} role="img" aria-label="Tea supply transport network">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7b877f" /></marker>
        </defs>
        {activeEdges.map((edge) => {
          const a = positions[edge.fromCode]
          const b = positions[edge.toCode]
          const flow = flowFor(edge, edgeFlows)
          const util = flow?.utilizationPercent ?? 0
          const atCapacity = flow && flow.residualCapacityKgPerDay === 0
          const high = util >= 85
          const stroke = atCapacity ? '#C34E4E' : high ? '#C58A2C' : '#93a39a'
          const label = flow ? `${flow.flowKgPerDay}/${flow.capacityKgPerDay}` : `${edge.capacityKgPerDay}`
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          return <g key={`${edge.id}-${edge.fromCode}-${edge.toCode}`}>
            <line x1={a.x + 48} y1={a.y} x2={b.x - 48} y2={b.y} stroke={stroke} strokeWidth={atCapacity ? 4 : 2.2} opacity=".9" markerEnd="url(#arrow)" />
            <rect x={mx - 37} y={my - 12} width="74" height="24" rx="8" fill="#fff" stroke="#d9e0da" />
            <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="700" fill="#4a574f">{label}</text>
          </g>
        })}
        {Object.entries(positions).map(([code, pos]) => {
          const location = nodes.find((n) => n.code === code)
          return <g key={code}>
            <circle cx={pos.x} cy={pos.y} r="46" fill={nodeFill[pos.type] || '#2F6B4F'} opacity={location?.active ? 1 : .35} />
            <circle cx={pos.x} cy={pos.y} r="39" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
            <text x={pos.x} y={pos.y - 2} textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff">{code}</text>
            <text x={pos.x} y={pos.y + 16} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="rgba(255,255,255,.72)">{locationTypeShortLabels[pos.type] || pos.type}</text>
          </g>
        })}
      </svg>
      <div className="flex flex-wrap gap-4 border-t border-tea-950/8 bg-white/65 px-4 py-3 text-xs text-muted">
        <span><b className="text-graphite">Connection label:</b> {edgeFlows?.length ? 'tea assigned / daily limit (kg/day)' : 'daily carrying limit (kg/day)'}</span>
        {edgeFlows?.length > 0 && <>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-5 rounded bg-critical" /> At capacity</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2 w-5 rounded bg-amberui" /> Near capacity</span>
        </>}
      </div>
    </div>
  )
}
