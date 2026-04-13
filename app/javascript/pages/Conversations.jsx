import React from 'react'
import { Link, router } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Conversations({ conversations, filters }) {
  const handleFilter = (key, value) => {
    router.get('/conversations', { ...filters, [key]: value || undefined }, { preserveState: true })
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500 mt-1">WhatsApp and voice call transcripts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex gap-4">
        <select
          value={filters?.channel || ''}
          onChange={(e) => handleFilter('channel', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="voice">Voice</option>
        </select>
        <select
          value={filters?.status || ''}
          onChange={(e) => handleFilter('status', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {conversations?.length > 0 ? conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/conversations/${conv.id}`}
            className="block bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${conv.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`}></span>
                <div>
                  <h3 className="font-medium text-gray-900">{conv.patient_name}</h3>
                  <p className="text-sm text-gray-500">{conv.patient_phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conv.channel === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                  {conv.channel}
                </span>
                <span className="text-xs text-gray-400">{conv.message_count} msgs</span>
                <span className="text-xs text-gray-400">
                  {new Date(conv.updated_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
            {conv.last_message && (
              <p className="text-sm text-gray-500 mt-2 truncate">{conv.last_message}</p>
            )}
          </Link>
        )) : (
          <div className="text-center py-12 text-gray-400">No conversations yet</div>
        )}
      </div>
    </DashboardLayout>
  )
}
