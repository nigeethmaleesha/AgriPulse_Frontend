export function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'bg-stoneui text-graphite',
    green: 'bg-tea-100 text-tea-900',
    amber: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
    red: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    blue: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    dark: 'bg-tea-950 text-white',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${tones[tone]} ${className}`}>{children}</span>
}
