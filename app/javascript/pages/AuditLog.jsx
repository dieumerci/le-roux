import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import { ClipboardList, Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import { cn } from '../lib/utils'

const ACTION_COLORS = {
  'appointment.created':   'bg-emerald-50 text-emerald-700 border-emerald-200',
  'appointment.updated':   'bg-blue-50 text-blue-700 border-blue-200',
  'appointment.cancelled': 'bg-red-50 text-red-700 border-red-200',
  'appointment.confirmed': 'bg-green-50 text-green-700 border-green-200',
  'patient.created':       'bg-purple-50 text-purple-700 border-purple-200',
  'patient.updated':       'bg-indigo-50 text-indigo-700 border-indigo-200',
  'conversation.replied':  'bg-amber-50 text-amber-700 border-amber-200',
}

const ACTION_LABELS = {
  'appointment.created':   'Appointment Created',
  'appointment.updated':   'Appointment Updated',
  'appointment.cancelled': 'Appointment Cancelled',
  'appointment.confirmed': 'Appointment Confirmed',
  'patient.created':       'Patient Created',
  'patient.updated':       'Patient Updated',
  'conversation.replied':  'Reply Sent',
}

function ActionBadge({ action }) {
  const colorClass = ACTION_COLORS[action] || 'bg-gray-50 text-gray-700 border-gray-200'
  const label = ACTION_LABELS[action] || action
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', colorClass)}>
      {label}
    </span>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-ZA', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export default function AuditLog({
  logs = [],
  meta = {},
  filters = {},
  distinct_actions = [],
  distinct_performers = [],
}) {
  const [expanded, setExpanded] = useState(null)
  const [localFilters, setLocalFilters] = useState({
    action_filter: filters.action_filter || '',
    performed_by:  filters.performed_by  || '',
    date_from:     filters.date_from     || '',
    date_to:       filters.date_to       || '',
  })

  const applyFilters = (overrides = {}) => {
    const params = { ...localFilters, ...overrides, page: 1 }
    router.get('/audit-log', params, { preserveState: true, replace: true })
  }

  const clearFilters = () => {
    setLocalFilters({ action_filter: '', performed_by: '', date_from: '', date_to: '' })
    router.get('/audit-log', {}, { preserveState: false, replace: true })
  }

  const goToPage = (page) => {
    router.get('/audit-log', { ...localFilters, page }, { preserveState: true, replace: true })
  }

  const exportCsv = () => {
    const params = new URLSearchParams(localFilters).toString()
    window.location.href = `/audit-log/export${params ? '?' + params : ''}`
  }

  const hasActiveFilters = Object.values(localFilters).some(v => v)

  return (
    <DashboardLayout>
      {/* ── Page header ─────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10">
            <ClipboardList size={20} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-ink">Audit Log</h1>
            <p className="text-sm text-brand-muted">
              {meta.total ?? 0} record{meta.total !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-surface"
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <div className="mb-5 rounded-xl border border-brand-border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-brand-muted" />
            <span className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Filters</span>
          </div>

          {/* Action filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-muted">Action</label>
            <select
              value={localFilters.action_filter}
              onChange={e => setLocalFilters(f => ({ ...f, action_filter: e.target.value }))}
              className="h-9 rounded-lg border border-brand-border bg-brand-surface px-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="">All actions</option>
              {distinct_actions.map(a => (
                <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
              ))}
            </select>
          </div>

          {/* Performer filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-muted">Performed by</label>
            <select
              value={localFilters.performed_by}
              onChange={e => setLocalFilters(f => ({ ...f, performed_by: e.target.value }))}
              className="h-9 rounded-lg border border-brand-border bg-brand-surface px-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            >
              <option value="">Anyone</option>
              {distinct_performers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Date from */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-muted">From</label>
            <input
              type="date"
              value={localFilters.date_from}
              onChange={e => setLocalFilters(f => ({ ...f, date_from: e.target.value }))}
              className="h-9 rounded-lg border border-brand-border bg-brand-surface px-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>

          {/* Date to */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-muted">To</label>
            <input
              type="date"
              value={localFilters.date_to}
              onChange={e => setLocalFilters(f => ({ ...f, date_to: e.target.value }))}
              className="h-9 rounded-lg border border-brand-border bg-brand-surface px-2.5 text-sm text-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            />
          </div>

          <button
            onClick={() => applyFilters()}
            className="h-9 rounded-lg bg-brand-primary px-4 text-sm font-medium text-white transition hover:bg-brand-primary/90"
          >
            Apply
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-brand-border px-3 text-sm text-brand-muted transition hover:text-brand-ink"
            >
              <RefreshCw size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Log table ───────────────────────────────────────── */}
      <div className="rounded-xl border border-brand-border bg-white shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-brand-muted">
            <ClipboardList size={36} className="opacity-30" />
            <p className="text-sm font-medium">No audit records found</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-brand-primary underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_2fr_120px_110px_110px] gap-4 bg-brand-surface px-5 py-3 text-xs font-semibold uppercase tracking-wide text-brand-muted">
              <span>Action</span>
              <span>Summary</span>
              <span>Performed by</span>
              <span>Timestamp</span>
              <span>Resource</span>
            </div>

            {logs.map(log => (
              <React.Fragment key={log.id}>
                <div
                  className="grid cursor-pointer grid-cols-[1fr_2fr_120px_110px_110px] gap-4 px-5 py-3.5 text-sm transition hover:bg-brand-surface/60"
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                >
                  <div>
                    <ActionBadge action={log.action} />
                  </div>
                  <span className="truncate text-brand-ink">{log.summary}</span>
                  <span className="truncate text-brand-muted">{log.performed_by || '—'}</span>
                  <span className="whitespace-nowrap text-brand-muted">{formatDate(log.created_at)}</span>
                  <span className="truncate text-brand-muted text-xs">
                    {log.resource_type ? `${log.resource_type} #${log.resource_id}` : '—'}
                  </span>
                </div>

                {/* Expandable details row */}
                {expanded === log.id && (
                  <div className="border-t border-dashed border-brand-border/50 bg-brand-surface/40 px-5 py-3">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-brand-muted">Details</p>
                    <pre className="overflow-x-auto rounded-lg border border-brand-border bg-white p-3 text-xs text-brand-ink">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                    {log.ip_address && (
                      <p className="mt-2 text-xs text-brand-muted">IP: {log.ip_address}</p>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ──────────────────────────────────────── */}
      {meta.total_pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-brand-muted">
          <span>
            Showing {((meta.page - 1) * meta.per_page) + 1}–{Math.min(meta.page * meta.per_page, meta.total)} of {meta.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={meta.page <= 1}
              onClick={() => goToPage(meta.page - 1)}
              className="rounded-lg border border-brand-border p-1.5 transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-medium text-brand-ink">
              {meta.page} / {meta.total_pages}
            </span>
            <button
              disabled={meta.page >= meta.total_pages}
              onClick={() => goToPage(meta.page + 1)}
              className="rounded-lg border border-brand-border p-1.5 transition hover:bg-brand-surface disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
