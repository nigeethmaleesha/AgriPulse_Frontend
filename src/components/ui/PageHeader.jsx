import { Badge } from './Badge'

export function PageHeader({ module = 'TEA SUPPLY NETWORK', engine, title, description, action }) {
  return (
    <div className="page-enter mb-6 flex flex-col gap-4 rounded-[22px] border border-slate-200/80 bg-white px-5 py-5 shadow-card sm:px-6 xl:flex-row xl:items-center xl:justify-between">
      <div className="max-w-4xl">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="dark">{module}</Badge>{engine && <Badge tone="green">{engine}</Badge>}
        </div>
        <h2 className="text-2xl font-extrabold tracking-[-.03em] text-slate-900 sm:text-[30px]">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-[15px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
