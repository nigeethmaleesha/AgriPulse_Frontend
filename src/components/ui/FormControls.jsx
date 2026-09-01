export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-600">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const inputClass = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-graphite shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-tea-600 focus:outline-none focus:ring-4 focus:ring-tea-600/10'
export const selectClass = `${inputClass} appearance-none`
