import React, { useEffect, useRef, useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { toast } from 'sonner'
import { ArrowLeft, Send, Phone, MessageCircle } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'

// ── Conversation detail + reply composer ───────────────────────────
// Phase 10.1 — the receptionist now reads the full transcript here
// and can type a WhatsApp reply directly into the thread. Send
// posts to POST /conversations/:id/reply which pushes the text out
// via Twilio (free-form, subject to the 24h customer-service
// window) and appends it to the JSONB messages array as an
// "assistant" entry — same shape the webhook produces — so the
// transcript stays consistent.
//
// Layout mirrors the screenshots the operator provided: a card
// scroller for the exchange, bubbles alternating left (patient,
// role=user) and right (clinic/AI, role=assistant), sticky
// composer pinned at the bottom of the card.

export default function ConversationShow({ conversation }) {
  const conv = conversation
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  // Auto-scroll to the latest message whenever the transcript
  // changes length (either a new webhook message or a successful
  // reply that Inertia just re-rendered).
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [conv.messages?.length])

  const canReply = conv.channel === 'whatsapp'

  const handleSend = (e) => {
    e.preventDefault()
    const trimmed = body.trim()
    if (!trimmed) return

    setSending(true)
    router.post(`/conversations/${conv.id}/reply`, { body: trimmed }, {
      preserveScroll: false,
      onSuccess: () => { setBody(''); toast.success('Reply sent') },
      onError:   () => toast.error('Could not send reply'),
      onFinish:  () => setSending(false),
    })
  }

  const handleKeyDown = (e) => {
    // Enter to send, Shift+Enter to insert a newline — same convention
    // as WhatsApp Web / Slack / iMessage on macOS.
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(e)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-5">
        <Link
          href="/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-brand-taupe hover:text-brand-brown transition-colors"
        >
          <ArrowLeft size={14} /> Back to Conversations
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
              <span className="text-brand-brown text-sm font-semibold">
                {initials(conv.patient_name)}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-brand-brown truncate">{conv.patient_name}</h1>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                <Phone size={11} />
                {conv.patient_phone}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Chip
              label={conv.channel}
              tone={conv.channel === 'whatsapp' ? 'emerald' : 'blue'}
            />
            <Chip
              label={conv.status}
              tone={conv.status === 'active' ? 'emerald' : 'gray'}
            />
            {conv.source === 'import' && <Chip label="Imported" tone="purple" />}
          </div>
        </div>
        {conv.topic && (
          <p className="text-xs text-gray-500 mt-3">
            Topic: <span className="font-medium text-brand-taupe">{conv.topic}</span>
          </p>
        )}
      </div>

      {/* Chat card */}
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 260px)' }}>
        {/* Messages scroller */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-5 space-y-3 bg-gray-50/40"
        >
          {conv.messages?.length > 0 ? (
            conv.messages.map((msg, i) => <Bubble key={i} msg={msg} />)
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-cream flex items-center justify-center mb-3">
                  <MessageCircle size={18} className="text-brand-taupe" />
                </div>
                <p className="text-sm text-gray-400">No messages yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSend}
          className="border-t border-gray-100 px-4 py-3 bg-white rounded-b-xl"
        >
          {!canReply && (
            <p className="text-[11px] text-amber-600 mb-2">
              Replies are only supported on WhatsApp conversations.
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!canReply || sending}
              placeholder={canReply ? 'Type your message…  (Enter to send, Shift+Enter for new line)' : 'Cannot reply to this conversation'}
              rows={1}
              className="flex-1 resize-none max-h-40 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!canReply || sending || !body.trim()}
              className="w-10 h-10 rounded-xl bg-brand-brown text-white flex items-center justify-center hover:bg-brand-brown/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              aria-label="Send reply"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

function Bubble({ msg }) {
  const isClinic = msg.role === 'assistant'
  return (
    <div className={`flex ${isClinic ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
          isClinic
            ? 'bg-brand-brown text-white rounded-tr-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
        {msg.timestamp && (
          <p className={`text-[10px] mt-1 ${isClinic ? 'text-white/60' : 'text-gray-400'}`}>
            {formatTime(msg.timestamp)}
          </p>
        )}
      </div>
    </div>
  )
}

function Chip({ label, tone }) {
  const tones = {
    emerald: 'bg-emerald-100 text-emerald-700',
    blue:    'bg-blue-100 text-blue-700',
    gray:    'bg-gray-100 text-gray-600',
    purple:  'bg-purple-100 text-purple-700',
  }
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${tones[tone] || tones.gray}`}>
      {label}
    </span>
  )
}

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '·'
}

function formatTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-ZA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}
