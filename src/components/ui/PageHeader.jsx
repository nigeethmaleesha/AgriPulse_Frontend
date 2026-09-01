import { Badge } from './Badge'

export function PageHeader({ module = 'TEA SUPPLY NETWORK', engine, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div className="max-w-4xl">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="dark">{module}</Badge>
          {engine && <Badge tone="green">{engine}</Badge>}
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-graphite sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted sm:text-[15px]">{description}</p>}
      </div>
      {action}
    </div>
  )
}
