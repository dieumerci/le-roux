import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

const statusColor = (connected) => connected ? 'text-green-600' : 'text-gray-400'
const statusLabel = (connected) => connected ? 'Connected' : 'Pending'
const statusIcon = (connected) => connected ? '✓' : '○'

export default function Dashboard({ stats, upcoming_appointments, system_status }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of today's activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Appointments"
          value={stats?.todays_appointments ?? 0}
          subtitle={`${stats?.confirmed_today ?? 0} confirmed, ${stats?.pending_confirmations ?? 0} pending`}
          color="indigo"
        />
        <StatCard
          title="WhatsApp Messages"
          value={stats?.whatsapp_messages ?? 0}
          subtitle="Last 7 days"
          color="green"
        />
        <StatCard
          title="Flagged Patients"
          value={stats?.flagged_patients ?? 0}
          subtitle="Need follow-up today"
          color="amber"
        />
        <StatCard
          title="Confirmed Today"
          value={stats?.confirmed_today ?? 0}
          subtitle="Morning confirmations"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Appointments</h2>
          {upcoming_appointments?.length > 0 ? (
            <div className="space-y-3">
              {upcoming_appointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name}</p>
                    <p className="text-sm text-gray-500">{apt.reason || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(apt.start_time).toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(apt.start_time).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No upcoming appointments</p>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            {[
              ['Database', true],
              ['Google Calendar', system_status?.google_calendar],
              ['Twilio WhatsApp', system_status?.twilio],
              ['Claude AI', system_status?.claude_ai],
            ].map(([name, connected]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-gray-700">{name}</span>
                <span className={`font-semibold ${statusColor(connected)}`}>
                  {statusIcon(connected)} {statusLabel(connected)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, subtitle, color }) {
  const colorMap = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${colorMap[color] || 'text-gray-900'}`}>{value}</p>
      <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
    </div>
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
