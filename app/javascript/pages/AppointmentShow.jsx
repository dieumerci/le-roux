import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function AppointmentShow({ appointment }) {
  const apt = appointment

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/appointments" className="text-indigo-600 hover:text-indigo-900 text-sm">&larr; Back to Appointments</Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
          <StatusBadge status={apt.status} />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Patient</label>
            <p className="text-gray-900 mt-1">{apt.patient_name}</p>
            <p className="text-sm text-gray-500">{apt.patient_phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date & Time</label>
            <p className="text-gray-900 mt-1">
              {new Date(apt.start_time).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(apt.start_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} — {new Date(apt.end_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Reason</label>
            <p className="text-gray-900 mt-1">{apt.reason || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="text-gray-900 mt-1">{apt.notes || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Cancellation Reason */}
      {apt.cancellation_reason && (
        <div className="bg-red-50 rounded-lg border border-red-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Cancellation Reason</h2>
          <p className="text-red-800"><span className="font-medium">Category:</span> {apt.cancellation_reason.category}</p>
          {apt.cancellation_reason.details && (
            <p className="text-red-700 mt-1">{apt.cancellation_reason.details}</p>
          )}
        </div>
      )}

      {/* Confirmation Logs */}
      {apt.confirmation_logs?.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirmation History</h2>
          <div className="space-y-3">
            {apt.confirmation_logs.map((log, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${log.flagged ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                <div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{log.method}</span>
                  <span className="mx-2 text-gray-400">—</span>
                  <span className="text-sm text-gray-600 capitalize">{log.outcome}</span>
                  {log.flagged && <span className="ml-2 text-xs text-amber-600 font-medium">FLAGGED</span>}
                </div>
                <div className="text-sm text-gray-500">
                  Attempts: {log.attempts} | {new Date(log.created_at).toLocaleString('en-ZA')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

function StatusBadge({ status }) {
  const styles = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-purple-100 text-purple-800',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
