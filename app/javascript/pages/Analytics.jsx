import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Analytics({ cancellation_stats, booking_stats, channel_stats }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-brown">Analytics</h1>
        <p className="text-gray-500 mt-1 text-sm">Cancellation reasons, booking stats, and channel performance</p>
      </div>

      {/* Booking Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-base font-semibold text-brand-brown mb-5">Booking Stats — Last 30 Days</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatBlock label="Total Bookings"   value={booking_stats?.total_bookings_30d ?? 0} />
          <StatBlock label="Completed"        value={booking_stats?.completed_30d ?? 0}      color="emerald" />
          <StatBlock label="No Shows"         value={booking_stats?.no_shows_30d ?? 0}       color="red" />
          <StatBlock label="Conversion Rate"  value={`${booking_stats?.conversion_rate ?? 0}%`} color="taupe" />
        </div>
      </div>

      {/* Channel Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-base font-semibold text-brand-brown mb-5">Channel Performance</h2>
        <div className="grid grid-cols-2 gap-5">
          <div className="text-center p-6 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-3xl font-bold text-emerald-600">{channel_stats?.whatsapp ?? 0}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">WhatsApp Conversations</p>
            <p className="text-xs text-gray-400 mt-0.5">{channel_stats?.whatsapp_pct ?? 0}% of total</p>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-3xl font-bold text-blue-600">{channel_stats?.voice ?? 0}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">Voice Conversations</p>
            <p className="text-xs text-gray-400 mt-0.5">{channel_stats?.voice_pct ?? 0}% of total</p>
          </div>
        </div>
      </div>

      {/* Cancellation Reasons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-brown mb-2">Cancellation Reasons</h2>
        <div className="flex items-center gap-4 mb-5">
          <p className="text-sm text-gray-500">
            Total cancelled: <span className="font-semibold text-red-500">{cancellation_stats?.total_cancelled ?? 0}</span>
          </p>
          <p className="text-sm text-gray-500">
            Rate: <span className="font-semibold text-red-500">{cancellation_stats?.cancellation_rate ?? 0}%</span>
          </p>
        </div>
        <div className="space-y-3">
          {cancellation_stats?.by_reason?.map((item) => {
            const maxCount = Math.max(...(cancellation_stats.by_reason.map(r => r.count) || [1]), 1)
            const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0
            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.category}</span>
                  <span className="text-sm text-gray-500">{item.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-brand-taupe h-2 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatBlock({ label, value, color = 'brown' }) {
  const colorMap = {
    brown:   'text-brand-brown',
    taupe:   'text-brand-taupe',
    emerald: 'text-emerald-600',
    red:     'text-red-500',
  }
  return (
    <div className="text-center">
      <p className={`text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  )
}
