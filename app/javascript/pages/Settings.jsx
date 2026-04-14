import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Settings({ schedules, pricing, faq }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-brown">Settings</h1>
        <p className="text-gray-500 mt-1 text-sm">Office hours, pricing, and FAQ configuration</p>
      </div>

      {/* Office Hours */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-base font-semibold text-brand-brown mb-4">Office Hours</h2>
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Day</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Hours</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Break</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {schedules?.map((schedule) => (
                <tr key={schedule.id} className="hover:bg-brand-cream transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">{schedule.day_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {schedule.active ? `${schedule.start_time} — ${schedule.end_time}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {schedule.break_start && schedule.break_end
                      ? `${schedule.break_start} — ${schedule.break_end}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${schedule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                      {schedule.active ? 'Open' : 'Closed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="text-base font-semibold text-brand-brown mb-4">Pricing</h2>
        <div className="divide-y divide-gray-100">
          {pricing && Object.entries(pricing).map(([treatment, price]) => (
            <div key={treatment} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <span className="text-sm font-medium text-gray-800 capitalize">{treatment}</span>
              <span className="text-sm font-semibold text-brand-taupe">{price}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-3 last:pb-0">
            <span className="text-sm text-gray-400">All other treatments</span>
            <span className="text-sm text-gray-400 italic">Requires consultation</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-brown mb-4">FAQ Knowledge Base</h2>
        <div className="space-y-3">
          {faq && Object.entries(faq).map(([topic, answer]) => (
            <div key={topic} className="p-4 bg-brand-cream rounded-lg border border-gray-100">
              <h3 className="text-xs font-semibold text-brand-taupe uppercase tracking-wide mb-1 capitalize">{topic}</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
