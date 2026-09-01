export function MetricTile({ label, value, suffix, caption, icon: Icon, tone = 'green' }) {
  const toneClass = tone === 'amber' ? 'bg-amber-50 text-amber-800 ring-amber-100' : tone === 'red' ? 'bg-red-50 text-red-700 ring-red-100' : 'bg-emerald-50 text-emerald-800 ring-emerald-100'
  return (
    <div className="surface-flat group min-w-0 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-tea-700/20 hover:shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-muted">{label}</span>
        {Icon && <span className={`rounded-xl p-2.5 ring-1 ${toneClass}`}><Icon size={17} /></span>}
      </div>
      <div className="mt-5 flex items-end gap-1.5">
        <span className="mono-value truncate text-[27px] font-extrabold leading-none text-slate-900">{value ?? '—'}</span>
        {suffix && <span className="pb-1 text-xs font-semibold text-muted">{suffix}</span>}
      </div>
      {caption && <p className="mt-2 text-xs leading-5 text-muted">{caption}</p>}
    </div>
  )
}
