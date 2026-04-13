import React from 'react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Settings({ schedules, pricing, faq }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Office hours, pricing, and FAQ configuration</p>
      </div>

      {/* Office Hours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Office Hours</h2>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-500">Day</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Hours</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Break</th>
                <th className="text-left py-2 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {schedules?.map((schedule) => (
                <tr key={schedule.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900 capitalize">{schedule.day_name}</td>
                  <td className="py-3 text-sm text-gray-600">
                    {schedule.active ? `${schedule.start_time} — ${schedule.end_time}` : '—'}
                  </td>
                  <td className="py-3 text-sm text-gray-600">
                    {schedule.break_start && schedule.break_end ? `${schedule.break_start} — ${schedule.break_end}` : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${schedule.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
        <div className="space-y-3">
          {pricing && Object.entries(pricing).map(([treatment, price]) => (
            <div key={treatment} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm font-medium text-gray-900 capitalize">{treatment}</span>
              <span className="text-sm font-semibold text-indigo-600">{price}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-500">All other treatments</span>
            <span className="text-sm text-gray-400 italic">Requires consultation</span>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">FAQ Knowledge Base</h2>
        <div className="space-y-4">
          {faq && Object.entries(faq).map(([topic, answer]) => (
            <div key={topic} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 capitalize mb-1">{topic}</h3>
              <p className="text-sm text-gray-600">{answer}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
