export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80',
    green: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dark: 'bg-tea-950 text-white ring-1 ring-tea-950',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.08em] ${tones[tone]} ${className}`}>{children}</span>
}
