import React from 'react'
import { Link, router } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Appointments({ appointments, filters, stats }) {
  const handleFilter = (key, value) => {
    router.get('/appointments', { ...filters, [key]: value || undefined }, { preserveState: true })
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500 mt-1">{stats?.total ?? 0} total appointments</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          ['Scheduled', stats?.scheduled, 'yellow'],
          ['Confirmed', stats?.confirmed, 'green'],
          ['Completed', stats?.completed, 'blue'],
          ['Cancelled', stats?.cancelled, 'red'],
        ].map(([label, count, color]) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold text-${color}-600`}>{count ?? 0}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search patient name or phone..."
          defaultValue={filters?.search || ''}
          onKeyDown={(e) => e.key === 'Enter' && handleFilter('search', e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filters?.status || ''}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
          <option value="rescheduled">Rescheduled</option>
        </select>
        <input
          type="date"
          value={filters?.date || ''}
          onChange={(e) => handleFilter('date', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments?.length > 0 ? appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{apt.patient_name}</div>
                  <div className="text-sm text-gray-500">{apt.patient_phone}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>{new Date(apt.start_time).toLocaleDateString('en-ZA', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className="text-gray-500">
                    {new Date(apt.start_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} — {new Date(apt.end_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{apt.reason || '—'}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={apt.status} />
                </td>
                <td className="px-6 py-4">
                  <Link href={`/appointments/${apt.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                    View
                  </Link>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
