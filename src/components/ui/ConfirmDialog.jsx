import { TriangleAlert } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ open, title = 'Confirm action', description, confirmText = 'Delete', busy, onClose, onConfirm }) {
  return (
    <Modal open={open} title={title} onClose={busy ? undefined : onClose}>
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <TriangleAlert className="shrink-0 text-amber-700" size={20} />
        <p className="text-sm leading-6 text-amber-900">{description}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : confirmText}</Button>
      </div>
    </Modal>
  )
}
