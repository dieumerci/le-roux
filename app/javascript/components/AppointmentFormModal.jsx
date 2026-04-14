import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import Modal from './Modal'

// ── Appointment form modal (Create & Edit) ──────────────────────────
// A single component handles both Create and Edit because the form
// fields are identical — only the submit endpoint and defaults
// change. `mode` picks which:
//   - mode="create" → POST /appointments with a patient picker
//   - mode="edit"   → PATCH /appointments/:id, patient pre-filled
//
// Validation is zod + react-hook-form. Times are entered as HTML5
// datetime-local inputs for zero-dependency input UX; zod parses the
// string into a date and enforces end > start.
const schema = z
  .object({
    patient_id: z.union([z.string(), z.number()]).refine((v) => !!v, 'Patient is required'),
    start_time: z.string().min(1, 'Start time is required'),
    end_time: z.string().min(1, 'End time is required'),
    reason: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((v) => new Date(v.end_time) > new Date(v.start_time), {
    path: ['end_time'],
    message: 'End time must be after start time',
  })

// Convert an ISO string from the server to the value format an HTML
// datetime-local input expects: "YYYY-MM-DDTHH:mm" in *local* time.
// (The input has no timezone offset so we slice off seconds & tz.)
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AppointmentFormModal({
  open,
  onClose,
  mode = 'create',       // 'create' | 'edit'
  appointment,           // required for mode=edit
  patients = [],         // required for mode=create
}) {
  const isEdit = mode === 'edit'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      patient_id: '',
      start_time: '',
      end_time: '',
      reason: '',
      notes: '',
    },
  })

  // When the modal opens (or the target appointment changes) hydrate
  // the form with the right defaults. Resetting inside a useEffect
  // keeps the form controlled while still reacting to prop changes.
  useEffect(() => {
    if (!open) return
    if (isEdit && appointment) {
      reset({
        patient_id: appointment.patient_id || '',
        start_time: toLocalInput(appointment.start_time),
        end_time: toLocalInput(appointment.end_time),
        reason: appointment.reason || '',
        notes: appointment.notes || '',
      })
    } else {
      reset({ patient_id: '', start_time: '', end_time: '', reason: '', notes: '' })
    }
  }, [open, isEdit, appointment, reset])

  const onSubmit = (data) => {
    const payload = {
      appointment: {
        ...(isEdit ? {} : { patient_id: data.patient_id }),
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
        reason: data.reason || null,
        notes: data.notes || null,
      },
    }

    const opts = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(isEdit ? 'Appointment updated' : 'Appointment booked')
        onClose?.()
      },
      onError: (errs) => {
        const msg = Object.values(errs || {})[0] || 'Something went wrong'
        toast.error(msg)
      },
    }

    if (isEdit) {
      router.patch(`/appointments/${appointment.id}`, payload, opts)
    } else {
      router.post('/appointments', payload, opts)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Appointment' : 'New Appointment'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="appointment-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-white bg-brand-taupe hover:bg-brand-brown disabled:opacity-50 rounded-lg transition-colors"
          >
            {isEdit ? 'Save changes' : 'Book appointment'}
          </button>
        </>
      }
    >
      <form id="appointment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Patient — only shown in create mode */}
        {!isEdit && (
          <Field label="Patient" error={errors.patient_id?.message}>
            <select
              {...register('patient_id')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
            >
              <option value="">Select a patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.phone}
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start time" error={errors.start_time?.message}>
            <input
              type="datetime-local"
              {...register('start_time')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
            />
          </Field>
          <Field label="End time" error={errors.end_time?.message}>
            <input
              type="datetime-local"
              {...register('end_time')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
            />
          </Field>
        </div>

        <Field label="Reason">
          <input
            type="text"
            placeholder="e.g. Root canal, cleaning, consultation"
            {...register('reason')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={3}
            placeholder="Any additional context for the reception…"
            {...register('notes')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe resize-none"
          />
        </Field>
      </form>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
        {label}
      </span>
      {children}
      {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
    </label>
  )
}
