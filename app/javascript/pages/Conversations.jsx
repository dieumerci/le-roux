import React from 'react'
import { Link, router } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

const INPUT_CLASS =
  'border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe transition-colors'

export default function Conversations({ conversations, filters }) {
  const handleFilter = (key, value) => {
    router.get('/conversations', { ...filters, [key]: value || undefined }, { preserveState: true })
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-brown">Conversations</h1>
        <p className="text-gray-500 mt-1 text-sm">WhatsApp and voice call transcripts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex gap-3">
        <select
          value={filters?.channel || ''}
          onChange={(e) => handleFilter('channel', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">All Channels</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="voice">Voice</option>
        </select>
        <select
          value={filters?.status || ''}
          onChange={(e) => handleFilter('status', e.target.value)}
          className={INPUT_CLASS}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Conversations List */}
      <div className="space-y-2">
        {conversations?.length > 0 ? conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/conversations/${conv.id}`}
            className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:border-brand-taupe/40 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${conv.status === 'active' ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 group-hover:text-brand-brown transition-colors text-sm">
                  {conv.patient_name}
                </p>
                {conv.last_message && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{conv.last_message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conv.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                {conv.channel}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block">{conv.message_count} msgs</span>
              <span className="text-xs text-gray-400">
                {new Date(conv.updated_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </Link>
        )) : (
          <div className="text-center py-16 text-gray-400 text-sm">No conversations yet</div>
        )}
      </div>
    </DashboardLayout>
  )
}
