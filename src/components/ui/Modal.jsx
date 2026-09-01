import { X } from 'lucide-react'

export function Modal({ open, title, children, onClose, width = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-tea-950/35 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div className={`max-h-[92vh] w-full ${width} overflow-auto rounded-2xl border border-white/40 bg-ivory shadow-2xl`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-tea-950/10 bg-ivory/95 px-5 py-4 backdrop-blur">
          <h3 className="text-lg font-bold text-graphite">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-tea-50 hover:text-tea-900" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
