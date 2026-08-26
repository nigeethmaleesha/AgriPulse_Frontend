import { AlertCircle, DatabaseZap, LoaderCircle, WifiOff } from 'lucide-react'
import { Button } from './Button'

export function LoadingState({ label = 'Loading network data…' }) {
  return <div className="flex min-h-40 items-center justify-center gap-3 text-sm text-muted"><LoaderCircle className="animate-spin" size={20} />{label}</div>
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-5">
      <div className="flex items-start gap-3">
        <WifiOff className="mt-0.5 text-critical" size={20} />
        <div className="flex-1">
          <p className="font-bold text-red-800">Unable to reach the Module 3 API</p>
          <p className="mt-1 text-sm text-red-700">{message || 'Check that Spring Boot and PostgreSQL are running on the configured API URL.'}</p>
          {onRetry && <Button variant="secondary" className="mt-4" onClick={onRetry}>Retry connection</Button>}
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ title = 'No data yet', description = 'Run the algorithm to see results.', icon: Icon = DatabaseZap }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center px-6 text-center">
      <span className="rounded-2xl bg-tea-50 p-3 text-tea-700"><Icon size={22} /></span>
      <p className="mt-3 font-bold text-graphite">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

export function InlineError({ message }) {
  if (!message) return null
  return <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{message}</div>
}
