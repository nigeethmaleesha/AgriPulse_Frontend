export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.09em] text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const inputClass = 'h-10 w-full rounded-xl border border-tea-950/15 bg-white px-3 text-sm text-graphite shadow-sm transition placeholder:text-muted/60 focus:border-tea-700 focus:outline-none focus:ring-2 focus:ring-tea-700/10'
export const selectClass = `${inputClass} appearance-none`
