export function MetricTile({ label, value, suffix, caption, icon: Icon, tone = 'green' }) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-800' : tone === 'red' ? 'bg-red-50 text-red-700' : 'bg-tea-50 text-tea-900'
  return (
    <div className="surface-flat min-w-0 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
        {Icon && <span className={`rounded-lg p-2 ${toneClass}`}><Icon size={16} /></span>}
      </div>
      <div className="mt-4 flex items-end gap-1.5">
        <span className="mono-value truncate text-2xl font-bold text-graphite">{value ?? '—'}</span>
        {suffix && <span className="pb-1 text-xs font-semibold text-muted">{suffix}</span>}
      </div>
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </div>
  )
}
