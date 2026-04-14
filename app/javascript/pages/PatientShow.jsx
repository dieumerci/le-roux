import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

const STATUS_STYLES = {
  scheduled:   'bg-amber-100 text-amber-800',
  confirmed:   'bg-emerald-100 text-emerald-800',
  completed:   'bg-blue-100 text-blue-800',
  cancelled:   'bg-red-100 text-red-800',
  no_show:     'bg-gray-100 text-gray-600',
  rescheduled: 'bg-purple-100 text-purple-800',
}

export default function PatientShow({ patient, appointments, conversations }) {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/patients" className="text-sm text-brand-taupe hover:text-brand-brown transition-colors">
          ← Back to Patients
        </Link>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h1 className="text-xl font-bold text-brand-brown mb-4">{patient.full_name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <Field label="Phone"><p className="text-sm text-gray-800">{patient.phone}</p></Field>
          <Field label="Email"><p className="text-sm text-gray-800">{patient.email || '—'}</p></Field>
          <Field label="Date of Birth">
            <p className="text-sm text-gray-800">
              {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('en-ZA') : '—'}
            </p>
          </Field>
          <Field label="Patient Since">
            <p className="text-sm text-gray-800">{new Date(patient.created_at).toLocaleDateString('en-ZA')}</p>
          </Field>
        </div>
        {patient.notes && (
          <div className="mt-4 p-3 bg-brand-cream rounded-lg border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700">{patient.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Appointment History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-brand-brown mb-4">Appointment History</h2>
          {appointments?.length > 0 ? (
            <div className="space-y-2">
              {appointments.map((apt) => (
                <Link
                  key={apt.id}
                  href={`/appointments/${apt.id}`}
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-brand-cream transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(apt.start_time).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{apt.reason || 'General'}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[apt.status] || 'bg-gray-100 text-gray-600'}`}>
                      {apt.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No appointments</p>
          )}
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-brand-brown mb-4">Conversations</h2>
          {conversations?.length > 0 ? (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/conversations/${conv.id}`}
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-brand-cream transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conv.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {conv.channel}
                      </span>
                      <span className="text-xs text-gray-400">{conv.message_count} messages</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(conv.updated_at).toLocaleDateString('en-ZA')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No conversations</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      {children}
    </div>
  )
}
