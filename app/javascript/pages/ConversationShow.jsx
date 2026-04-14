import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function ConversationShow({ conversation }) {
  const conv = conversation

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/conversations" className="text-sm text-brand-taupe hover:text-brand-brown transition-colors">
          ← Back to Conversations
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-brown">{conv.patient_name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{conv.patient_phone}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conv.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
              {conv.channel}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conv.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {conv.status}
            </span>
          </div>
        </div>
        {conv.started_at && (
          <p className="text-xs text-gray-400 mt-3">
            Started: {new Date(conv.started_at).toLocaleString('en-ZA')}
            {conv.ended_at && ` · Ended: ${new Date(conv.ended_at).toLocaleString('en-ZA')}`}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-brand-brown mb-5">Messages</h2>
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {conv.messages?.length > 0 ? conv.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div
                className={`max-w-lg rounded-2xl px-4 py-3 ${
                  msg.role === 'assistant'
                    ? 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    : 'bg-brand-brown text-white rounded-tr-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>
                {msg.timestamp && (
                  <p className={`text-xs mt-1.5 ${msg.role === 'assistant' ? 'text-gray-400' : 'text-white/50'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-8">No messages in this conversation</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
