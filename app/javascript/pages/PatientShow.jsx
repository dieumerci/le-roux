import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function PatientShow({ patient, appointments, conversations }) {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/patients" className="text-indigo-600 hover:text-indigo-900 text-sm">&larr; Back to Patients</Link>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{patient.full_name}</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Phone</label>
            <p className="text-gray-900 mt-1">{patient.phone}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-gray-900 mt-1">{patient.email || '—'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
            <p className="text-gray-900 mt-1">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('en-ZA') : '—'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Patient Since</label>
            <p className="text-gray-900 mt-1">{new Date(patient.created_at).toLocaleDateString('en-ZA')}</p>
          </div>
        </div>
        {patient.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Notes</label>
            <p className="text-gray-700 mt-1">{patient.notes}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment History</h2>
          {appointments?.length > 0 ? (
            <div className="space-y-3">
              {appointments.map((apt) => (
                <Link key={apt.id} href={`/appointments/${apt.id}`} className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(apt.start_time).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">{apt.reason || 'General'}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusStyle(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No appointments</p>
          )}
        </div>

        {/* Conversations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversations</h2>
          {conversations?.length > 0 ? (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <Link key={conv.id} href={`/conversations/${conv.id}`} className="block p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conv.channel === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {conv.channel}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{conv.message_count} messages</span>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(conv.updated_at).toLocaleDateString('en-ZA')}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No conversations</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

function statusStyle(status) {
  const styles = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-purple-100 text-purple-800',
  }
  return styles[status] || 'bg-gray-100 text-gray-800'
}
