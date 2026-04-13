import React from 'react'
import { Link } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function ConversationShow({ conversation }) {
  const conv = conversation

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/conversations" className="text-indigo-600 hover:text-indigo-900 text-sm">&larr; Back to Conversations</Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{conv.patient_name}</h1>
            <p className="text-gray-500">{conv.patient_phone}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conv.channel === 'whatsapp' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {conv.channel}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {conv.status}
            </span>
          </div>
        </div>
        {conv.started_at && (
          <p className="text-xs text-gray-400 mt-2">
            Started: {new Date(conv.started_at).toLocaleString('en-ZA')}
            {conv.ended_at && ` — Ended: ${new Date(conv.ended_at).toLocaleString('en-ZA')}`}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
        <div className="space-y-4">
          {conv.messages?.length > 0 ? conv.messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-lg rounded-lg px-4 py-3 ${
                msg.role === 'assistant'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-indigo-600 text-white'
              }`}>
                <p className="text-sm">{msg.content}</p>
                {msg.timestamp && (
                  <p className={`text-xs mt-1 ${msg.role === 'assistant' ? 'text-gray-400' : 'text-indigo-200'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          )) : (
            <p className="text-gray-400 text-sm text-center">No messages in this conversation</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
