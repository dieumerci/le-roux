import React, { useEffect, useRef, useState, useCallback } from 'react'
import { router, usePage } from '@inertiajs/react'
import {
  Bell, Check, Calendar, CalendarX, CalendarCheck, UserPlus,
  MessageSquare, Info, AlertTriangle,
} from 'lucide-react'

// ── Navbar notification bell + dropdown ─────────────────────────────
// Phase 9.6 sub-area #6.
//
// Badge count comes from Inertia shared props (`unread_notifications_count`)
// so it stays accurate on every page transition without an extra
// fetch. Opening the dropdown triggers a one-shot fetch to /notifications
// for the latest 20 items — we don't poll because the receptionist
// actively triggers the events that create notifications, so "fresh
// on open" is the right latency trade-off for this app.
//
// Marking individual notifications read:
//   - Click → navigate (via Inertia) AND mark read in the background
//   - "Mark all as read" → POST /notifications/mark_all_read

const ICONS = {
  appointment_created:     Calendar,
  appointment_cancelled:   CalendarX,
  appointment_confirmed:   CalendarCheck,
  appointment_rescheduled: Calendar,
  patient_created:         UserPlus,
  conversation_started:    MessageSquare,
  system:                  Info,
}

const LEVEL_STYLES = {
  info:    'bg-blue-50 text-blue-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger:  'bg-red-50 text-red-600',
}

export default function NotificationBell() {
  const { props } = usePage()
  // Shared prop from ApplicationController#inertia_share. Falls back
  // to 0 so the badge renders correctly before the first fetch.
  const sharedUnread = props.unread_notifications_count ?? 0

  const [open, setOpen]       = useState(false)
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)
  // Local override so the badge can drop to 0 instantly when the
  // user hits "Mark all as read", without waiting for the next
  // Inertia navigation.
  const [localUnread, setLocalUnread] = useState(null)
  const unreadCount = localUnread ?? sharedUnread

  const containerRef = useRef(null)

  // Keep the local override in sync when the shared prop changes
  // (i.e. after an Inertia navigation refreshes the count).
  useEffect(() => { setLocalUnread(null) }, [sharedUnread])

  // Close on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/notifications', {
        headers: { Accept: 'application/json' },
      })
      const data = await res.json()
      setItems(data.notifications || [])
      setLocalUnread(data.unread_count ?? 0)
    } catch (e) {
      // Silent — bell stays in previous state; console already logs.
      // eslint-disable-next-line no-console
      console.error('Failed to fetch notifications', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) fetchItems()
  }

  const markRead = async (id) => {
    try {
      await fetch(`/notifications/${id}/mark_read`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'X-CSRF-Token': csrfToken(),
        },
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('mark_read failed', e)
    }
  }

  const markAllRead = async () => {
    // Optimistic update so the badge snaps to 0 immediately.
    setLocalUnread(0)
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    try {
      await fetch('/notifications/mark_all_read', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'X-CSRF-Token': csrfToken(),
        },
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('mark_all_read failed', e)
    }
  }

  const clickItem = (n) => {
    setOpen(false)
    if (!n.read) {
      // Optimistic: drop the badge count immediately.
      setLocalUnread((prev) => Math.max(0, (prev ?? unreadCount) - 1))
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      markRead(n.id)
    }
    if (n.url) router.visit(n.url)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl border border-gray-200 shadow-lg max-h-[32rem] overflow-hidden flex flex-col z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-brand-brown">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-taupe hover:text-brand-brown transition-colors"
              >
                <Check size={12} /> Mark all as read
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 ? (
              <EmptyState message="Loading…" />
            ) : items.length === 0 ? (
              <EmptyState message="You're all caught up" />
            ) : (
              items.map((n) => (
                <NotificationRow key={n.id} n={n} onClick={() => clickItem(n)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationRow({ n, onClick }) {
  const Icon = ICONS[n.category] || (n.level === 'warning' ? AlertTriangle : Info)
  const toneClass = LEVEL_STYLES[n.level] || LEVEL_STYLES.info
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50 last:border-b-0 transition-colors ${
        n.read ? 'hover:bg-gray-50' : 'bg-brand-cream/40 hover:bg-brand-cream/70'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${toneClass}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm truncate ${n.read ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
            {n.title}
          </p>
          {!n.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-taupe flex-shrink-0 mt-1.5" />
          )}
        </div>
        {n.body && <p className="text-xs text-gray-500 truncate">{n.body}</p>}
        <p className="text-[10px] text-gray-400 mt-1">{relativeTime(n.created_at)}</p>
      </div>
    </button>
  )
}

function EmptyState({ message }) {
  return (
    <div className="px-4 py-10 text-center text-sm text-gray-400">{message}</div>
  )
}

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
}

function relativeTime(iso) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-ZA')
}
