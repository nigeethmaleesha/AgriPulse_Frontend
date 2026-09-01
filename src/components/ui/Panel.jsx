export function Panel({ children, className = '', title, action }) {
  return <section className={`surface ${className}`}>{title && <div className="flex items-center justify-between gap-4 border-b border-slate-200/75 px-5 py-4 sm:px-6"><h2 className="text-[17px] font-extrabold tracking-[-.015em] text-slate-900">{title}</h2>{action && <div className="shrink-0">{action}</div>}</div>}{children}</section>
}

export function PanelHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-200/75 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
      <div>
        {eyebrow && <div className="section-kicker mb-1">{eyebrow}</div>}
        <h2 className="text-[17px] font-extrabold tracking-[-.015em] text-slate-900">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
