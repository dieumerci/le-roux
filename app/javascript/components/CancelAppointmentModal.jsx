import React, { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'

// ── Cancel confirmation modal ───────────────────────────────────────
// Captures a structured cancellation reason (matching the backend
// CancellationReason::CATEGORIES whitelist) plus optional free-text
// details. The category is what Phase 11 analytics will aggregate on,
// so we force the reception to pick one rather than leaving it empty.
//
// The intentional friction of a confirmation button + reason select
// is the whole point — Phase 9.6 calls this "Cancel flow modal".
const CATEGORIES = [
  { value: 'cost',      label: 'Cost' },
  { value: 'timing',    label: 'Timing / schedule conflict' },
  { value: 'fear',      label: 'Fear / anxiety' },
  { value: 'transport', label: 'Transport' },
  { value: 'other',     label: 'Other' },
]

export default function CancelAppointmentModal({ appointment, open, onClose }) {
  const [category, setCategory] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset form whenever the modal (re)opens so a stale half-filled
  // state from a previous cancel doesn't leak into the next one.
  useEffect(() => {
    if (open) {
      setCategory('')
      setDetails('')
      setSubmitting(false)
    }
  }, [open])

  if (!appointment) return null

  const handleConfirm = () => {
    if (!category) {
      toast.error('Please pick a reason category')
      return
    }
    setSubmitting(true)
    router.patch(
      `/appointments/${appointment.id}/cancel`,
      { cancellation: { category, details } },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success('Appointment cancelled')
          onClose?.()
        },
        onError: () => toast.error('Could not cancel'),
        onFinish: () => setSubmitting(false),
      }
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel Appointment"
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Keep appointment
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            {submitting ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-100 mb-5">
        <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          You're about to cancel the appointment for{' '}
          <span className="font-semibold">{appointment.patient_name}</span>. This
          action cannot be undone.
        </div>
      </div>

      <label className="block mb-4">
        <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
          Reason category
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
        >
          <option value="">Select a reason…</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
          Additional notes <span className="text-gray-400 font-normal">(optional)</span>
        </span>
        <textarea
          rows={3}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Anything the reception should know about this cancellation…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe resize-none"
        />
      </label>
    </Modal>
  )
}
