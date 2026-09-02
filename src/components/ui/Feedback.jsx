import { AlertCircle, DatabaseZap, LoaderCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function LoadingState({ label = 'Loading network information…' }) {
  return <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 p-8 text-center text-muted"><LoaderCircle size={25} className="animate-spin" /><p className="text-sm font-semibold">{label}</p></div>
}

export function ErrorState({ message, onRetry }) {
  return <div className="p-5"><div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"><AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} /><div className="flex-1"><p className="font-bold text-red-800">Unable to load the tea supply system</p><p className="mt-1 text-sm text-red-700">{message || 'Check that the backend service and database are running.'}</p>{onRetry && <Button size="sm" variant="secondary" className="mt-3" onClick={onRetry}><RefreshCw size={14} /> Try again</Button>}</div></div></div>
}

export function InlineError({ message }) {
  if (!message) return null
  return <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-700">{message}</div>
}

export function EmptyState({ title = 'No data yet', description = 'Run a network check to see results.', icon: Icon = DatabaseZap }) {
  return <div className="flex min-h-[170px] flex-col items-center justify-center px-6 py-8 text-center"><div className="rounded-2xl bg-tea-50 p-3 text-tea-700"><Icon size={22} /></div><p className="mt-3 font-bold text-graphite">{title}</p><p className="mt-1 max-w-md text-sm leading-5 text-muted">{description}</p></div>
}

export function FeedbackBanner({ type = 'info', message, onDismiss }) {
  if (!message) return null
  const isError = type === 'error'
  const isWarning = type === 'warning'
  const isSuccess = type === 'success'

  const bannerClass = isError
    ? 'border-red-200 bg-red-50 text-red-800'
    : isWarning
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : isSuccess
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : 'border-slate-200 bg-slate-50 text-slate-800'

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 text-xs font-bold shadow-sm ${bannerClass}`}>
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  )
}

