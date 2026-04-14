import React from 'react'
import { router } from '@inertiajs/react'
import { Phone, Mail, Calendar, Edit3, X as XIcon, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import Modal from './Modal'

// ── Detail modal ────────────────────────────────────────────────────
// Rendered when the user clicks an event on the calendar. Mirrors the
// right-side panel from screenshot ref #1 (Jerome Bellingham). Keeps
// the heavy-weight AppointmentShow.jsx page intact — that's still
// available for deep-link access, but 90% of reception tasks are
// one-screen operations that don't need a full navigation.
//
// Actions (Edit / Cancel) are callbacks rather than navigation so the
// host page can swap this modal for the Edit / Cancel modals in place.
const STATUS_CHIP = {
  scheduled:   'bg-amber-100 text-amber-700',
  confirmed:   'bg-emerald-100 text-emerald-700',
  completed:   'bg-blue-100 text-blue-700',
  cancelled:   'bg-red-100 text-red-700',
  no_show:     'bg-gray-100 text-gray-600',
  rescheduled: 'bg-violet-100 text-violet-700',
}

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })

export default function AppointmentDetailModal({
  appointment,
  open,
  onClose,
  onEdit,
  onCancel,
}) {
  if (!appointment) return null

  const handleConfirm = () => {
    router.patch(`/appointments/${appointment.id}/confirm`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Appointment confirmed')
        onClose?.()
      },
      onError: () => toast.error('Could not confirm'),
    })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Appointment Details"
      size="xl"
      footer={
        <>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <XIcon size={15} /> Cancel
          </button>
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit3 size={15} /> Edit
          </button>
          {appointment.status !== 'confirmed' && appointment.status !== 'cancelled' && (
            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-taupe hover:bg-brand-brown rounded-lg transition-colors"
            >
              <CheckCircle size={15} /> Confirm
            </button>
          )}
        </>
      }
    >
      {/* Patient card */}
      <div className="border border-gray-200 rounded-xl p-5 mb-5 bg-gradient-to-br from-brand-cream/40 to-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-brown flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">
              {(appointment.patient_name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {appointment.patient_name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
              {appointment.patient_phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={13} /> {appointment.patient_phone}
                </span>
              )}
            </div>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_CHIP[appointment.status] || 'bg-gray-100 text-gray-600'}`}>
            {appointment.status}
          </span>
        </div>
      </div>

      {/* Booking Info */}
      <div>
        <h4 className="text-sm font-semibold text-brand-brown mb-3">Booking Information</h4>
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <Row icon={Calendar} label="Date">
            {fmtDate(appointment.start_time)}
          </Row>
          <Row icon={Calendar} label="Time">
            {fmtTime(appointment.start_time)} — {fmtTime(appointment.end_time)}
          </Row>
          <Row icon={Mail} label="Reason">
            {appointment.reason || '—'}
          </Row>
        </div>
      </div>
    </Modal>
  )
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-brand-taupe mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5">{children}</p>
      </div>
    </div>
  )
}
