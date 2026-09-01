export function Panel({ children, className = '' }) {
  return <section className={`surface ${className}`}>{children}</section>
}

export function PanelHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-tea-950/8 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && <div className="section-kicker mb-1">{eyebrow}</div>}
        <h2 className="text-lg font-bold text-graphite">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}
