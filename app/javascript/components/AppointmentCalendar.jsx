import React, { useEffect, useMemo, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { CalendarRange, Clock3, Search, Sparkles } from 'lucide-react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { toast } from 'sonner'

const DEFAULT_CALENDAR_VIEW = 'timeGridWeek'

const STATUS_THEMES = {
  scheduled: {
    label: 'Scheduled',
    dot: 'bg-[#3164DE]',
    card: 'border border-[#3164DE]/15 bg-[#D6E0F8]/70 shadow-[0_22px_40px_-36px_rgba(49,100,222,0.95)]',
    avatar: 'bg-[#3164DE]',
    chip: 'border border-[#3164DE]/10 bg-white/85 text-[#3164DE]',
    reason: 'text-[#27457C]',
    meta: 'text-[#5C6E93]',
  },
  confirmed: {
    label: 'Confirmed',
    dot: 'bg-[#19A14E]',
    card: 'border border-[#19A14E]/15 bg-[#EAF8F0] shadow-[0_22px_40px_-36px_rgba(25,161,78,0.85)]',
    avatar: 'bg-[#19A14E]',
    chip: 'border border-[#19A14E]/10 bg-white/85 text-[#15823F]',
    reason: 'text-[#1D5D39]',
    meta: 'text-[#5E8570]',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-[#769BF5]',
    card: 'border border-[#769BF5]/15 bg-[#EEF4FF] shadow-[0_22px_40px_-36px_rgba(118,155,245,0.9)]',
    avatar: 'bg-[#769BF5]',
    chip: 'border border-[#769BF5]/10 bg-white/85 text-[#4A71D2]',
    reason: 'text-[#3556A9]',
    meta: 'text-[#6A7FAF]',
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-[#EF6161]',
    card: 'border border-[#EF6161]/15 bg-[#FFF1F1] shadow-[0_22px_40px_-36px_rgba(239,97,97,0.9)]',
    avatar: 'bg-[#EF6161]',
    chip: 'border border-[#EF6161]/10 bg-white/85 text-[#C14A4A]',
    reason: 'text-[#A84545]',
    meta: 'text-[#9F7272]',
  },
  no_show: {
    label: 'No show',
    dot: 'bg-[#8592AD]',
    card: 'border border-[#8592AD]/15 bg-[#F3F6FB] shadow-[0_22px_40px_-36px_rgba(133,146,173,0.9)]',
    avatar: 'bg-[#8592AD]',
    chip: 'border border-[#8592AD]/10 bg-white/85 text-[#6D7991]',
    reason: 'text-[#5A647A]',
    meta: 'text-[#8592AD]',
  },
  rescheduled: {
    label: 'Rescheduled',
    dot: 'bg-[#8A7BFF]',
    card: 'border border-[#8A7BFF]/15 bg-[#F2EEFF] shadow-[0_22px_40px_-36px_rgba(138,123,255,0.9)]',
    avatar: 'bg-[#8A7BFF]',
    chip: 'border border-[#8A7BFF]/10 bg-white/85 text-[#6C5FE4]',
    reason: 'text-[#5C4FD2]',
    meta: 'text-[#8A82BA]',
  },
}

// Initials for the avatar circle — "Jerome Bellingham" → "JB".
const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('') || '·'

const formatClock = (date) =>
  date.toLocaleTimeString('en-ZA', { hour: 'numeric', minute: '2-digit', hour12: true })

const formatRange = (start, end) => {
  return `${formatClock(start)} - ${formatClock(end)}`
}

const toMillis = (value) => {
  if (!value) return null
  const stamp = Date.parse(value)
  return Number.isNaN(stamp) ? null : stamp
}

export default function AppointmentCalendar({
  appointments = [],
  onEventClick,
  calendarMeta = {},
}) {
  const calendarRef = useRef(null)
  const loadedRangeRef = useRef({
    startMs: toMillis(calendarMeta.range_start),
    endMs: toMillis(calendarMeta.range_end),
    view: calendarMeta.view || DEFAULT_CALENDAR_VIEW,
  })
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadedRangeRef.current = {
      startMs: toMillis(calendarMeta.range_start),
      endMs: toMillis(calendarMeta.range_end),
      view: calendarMeta.view || DEFAULT_CALENDAR_VIEW,
    }
  }, [calendarMeta.range_start, calendarMeta.range_end, calendarMeta.view])

  // Filter appointments client-side by search text. Looks at patient
  // name, phone, reason, and status so a single input covers every
  // useful case without a dedicated dropdown. Case-insensitive.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return appointments
    return appointments.filter((apt) => {
      const haystack = [
        apt.patient_name,
        apt.patient_phone,
        apt.reason,
        apt.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [appointments, search])

  const statusSummary = useMemo(() => (
    Object.entries(STATUS_THEMES).map(([status, theme]) => ({
      status,
      label: theme.label,
      count: appointments.filter((appointment) => appointment.status === status).length,
      dot: theme.dot,
    }))
  ), [appointments])

  const events = useMemo(
    () =>
      filtered.map((apt) => ({
        id: String(apt.id),
        title: apt.patient_name,
        start: apt.start_time,
        end: apt.end_time,
        backgroundColor: '#FFFFFF',
        borderColor: 'transparent',
        extendedProps: {
          reason: apt.reason,
          status: apt.status,
          phone: apt.patient_phone,
        },
      })),
    [filtered]
  )

  // Drag-to-reschedule — PATCHes the server; reverts the UI drop on error.
  const handleEventDrop = (info) => {
    const payload = {
      appointment: {
        start_time: info.event.start.toISOString(),
        end_time:   info.event.end ? info.event.end.toISOString() : null,
      },
    }
    router.patch(`/appointments/${info.event.id}`, payload, {
      preserveScroll: true,
      onSuccess: () => toast.success('Appointment rescheduled'),
      onError: () => {
        info.revert()
        toast.error('Could not reschedule — reverted')
      },
    })
  }

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault()
    if (onEventClick) {
      onEventClick(info.event)
    } else {
      router.visit(`/appointments/${info.event.id}`)
    }
  }

  const handleDatesSet = (info) => {
    const anchorDate = info.view.currentStart
      ? info.view.currentStart.toISOString().slice(0, 10)
      : info.start.toISOString().slice(0, 10)
    const nextRange = {
      startMs: info.start.getTime(),
      endMs: info.end.getTime(),
      view: info.view.type,
    }

    if (
      loadedRangeRef.current.startMs === nextRange.startMs &&
      loadedRangeRef.current.endMs === nextRange.endMs &&
      loadedRangeRef.current.view === nextRange.view
    ) {
      return
    }

    loadedRangeRef.current = nextRange

    router.get('/appointments', {
      calendar_start: info.start.toISOString(),
      calendar_end: info.end.toISOString(),
      calendar_date: anchorDate,
      calendar_view: info.view.type,
    }, {
      only: ['calendar_appointments', 'calendar_meta'],
      preserveState: true,
      preserveScroll: true,
      replace: true,
    })
  }

  const renderEventContent = (arg) => {
    const { reason, status, phone } = arg.event.extendedProps
    const patient = arg.event.title
    const start = arg.event.start
    const end = arg.event.end || arg.event.start
    const theme = STATUS_THEMES[status] || STATUS_THEMES.scheduled

    return (
      <div className={`h-full w-full rounded-2xl p-3 text-[11px] leading-tight ${theme.card}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ${theme.avatar}`}
            >
              {initials(patient)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold tracking-tight text-[#393C4D]">
                {patient}
              </p>
              <p className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${theme.chip}`}>
                {theme.label}
              </p>
            </div>
          </div>
          <div className="rounded-full border border-white/70 bg-white/80 px-2 py-1 text-[10px] font-semibold text-[#393C4D] shadow-sm">
            {formatRange(start, end)}
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          <p className={`truncate text-[12px] font-semibold ${theme.reason}`}>
            {reason || 'General appointment'}
          </p>
          {phone && (
            <p className={`truncate text-[11px] ${theme.meta}`}>
              {phone}
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-medium text-[#8592AD]">
          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
          <span className="sr-only">{theme.label}</span>
          <Clock3 size={11} />
          <span>{formatClock(start)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="appointment-calendar overflow-hidden rounded-[30px] border border-[#D6E0F8] bg-white shadow-[0_32px_90px_-58px_rgba(57,60,77,0.45)]">
      <div className="border-b border-[#D6E0F8] bg-gradient-to-br from-[#D6E0F8]/80 via-white to-white px-6 py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B1C5F6] bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3164DE]">
              <Sparkles size={12} />
              Booking desk
            </div>
            <div>
              <h2 className="text-[1.9rem] font-semibold tracking-tight text-[#393C4D]">
                Clinic booking calendar
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8592AD]">
                Review live bookings, drag appointments to new times, and keep reception aligned with the diary at a glance.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 xl:min-w-[360px] xl:items-end">
            <div className="relative w-full max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8592AD]"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search patient, phone, reason…"
                className="w-full rounded-2xl border border-[#B1C5F6] bg-white px-11 py-3 text-sm text-[#393C4D] placeholder:text-[#8592AD] focus:border-[#3164DE] focus:outline-none focus:ring-4 focus:ring-[#B1C5F6]/45"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-medium text-[#8592AD] transition hover:bg-[#D6E0F8] hover:text-[#393C4D]"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <MetaChip icon={CalendarRange}>
                {filtered.length} visible bookings
              </MetaChip>
              <MetaChip>
                {appointments.length} in loaded window
              </MetaChip>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#D6E0F8] bg-white px-6 py-4">
        <div className="flex flex-wrap gap-2.5">
          {statusSummary.map((item) => (
            <div
              key={item.status}
              className="inline-flex items-center gap-2 rounded-full border border-[#D6E0F8] bg-[#F8FAFF] px-3 py-1.5 text-xs font-medium text-[#5E6B86]"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${item.dot}`} />
              <span>{item.label}</span>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#393C4D]">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-5 pt-5 md:px-6">
        {search && filtered.length === 0 && (
          <div className="mb-4 rounded-2xl border border-dashed border-[#B1C5F6] bg-[#F8FAFF] px-4 py-3 text-sm text-[#5E6B86]">
            No appointments in this calendar window match your current search.
          </div>
        )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={calendarMeta.view || DEFAULT_CALENDAR_VIEW}
        initialDate={calendarMeta.initial_date}
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'today prev,next timeGridWeek,timeGridDay,dayGridMonth',
        }}
        events={events}
        editable
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        datesSet={handleDatesSet}
        eventContent={renderEventContent}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        nowIndicator
        contentHeight={640}
        stickyHeaderDates
        slotDuration="00:30:00"
        weekends
        firstDay={1}
        buttonText={{ timeGridWeek: 'Week', timeGridDay: 'Day', dayGridMonth: 'Month' }}
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        slotLabelFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
      />
      </div>
    </div>
  )
}

function MetaChip({ children, icon: Icon }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#D6E0F8] bg-white px-3 py-1.5 text-xs font-medium text-[#5E6B86] shadow-sm">
      {Icon ? <Icon size={13} className="text-[#3164DE]" /> : null}
      {children}
    </span>
  )
}
