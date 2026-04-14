import React, { useEffect } from 'react'
import { X } from 'lucide-react'

// ── Shared modal primitive ──────────────────────────────────────────
// Deliberately tiny: a fixed-position backdrop, a centred panel, a
// titled header with a close button, and a slot for children. Phase
// 9.6 uses this for the four appointment modals (Detail, Create,
// Edit, Cancel) — subsequent sub-areas (Patient forms) will reuse
// it without modification.
//
// Why not `@radix-ui/react-dialog` or `headlessui`? — STACK.md
// hasn't pulled either in, and for a single-dialog-at-a-time flow
// the ~40 lines below do the job. If we ever need nested dialogs or
// complex focus trapping we can swap to Radix without touching the
// call sites since the API is intentionally compatible.
export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {
  // Close on Escape — wired only while the modal is actually open so
  // we don't leak listeners onto the window for every mounted modal.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    window.addEventListener('keydown', onKey)
    // Lock body scroll while the modal is open so the page behind
    // doesn't wiggle under the overlay on mobile / short screens.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[size] || 'max-w-md'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative w-full ${sizeClass} bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <h2 id="modal-title" className="text-lg font-semibold text-brand-brown">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
