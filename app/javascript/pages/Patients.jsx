import React, { useMemo } from 'react'
import { Link } from '@inertiajs/react'
import { Eye, Users, UserCheck, UserPlus } from 'lucide-react'
import DashboardLayout from '../layouts/DashboardLayout'
import DataTable from '../components/DataTable'

// Phase 9.6 sub-area #3 — Patients list rebuilt on the shared DataTable.
// Columns match the reference screenshot: ID No. · Patient · Status · Due
// · Phone · Age · Next Appointment · Actions. "Due" is a placeholder until
// Phase 12 (billing) lands — we render an em-dash so the column reads as
// intentionally empty rather than broken.
const STATUS_OPTIONS = [
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function Patients({ patients = [], stats }) {
  // Memoised columns — see Appointments.jsx for the same rationale
  // (prevents tanstack from re-instantiating and wiping sort/column state).
  const columns = useMemo(() => [
    {
      accessorKey: 'code',
      header: 'ID No.',
      cell: ({ getValue }) => (
        <span className="text-sm font-medium text-gray-500">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'full_name',
      header: 'Patient Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-cream flex items-center justify-center flex-shrink-0">
            <span className="text-brand-brown text-xs font-semibold">
              {initials(row.original.full_name)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{row.original.full_name}</p>
            {row.original.email && (
              <p className="text-xs text-gray-400 truncate">{row.original.email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      filterFn: 'equals',
    },
    {
      id: 'due',
      header: 'Due',
      enableSorting: false,
      enableGlobalFilter: false,
      // Billing lands in Phase 12 — render a neutral placeholder so the
      // column reads as intentionally empty rather than missing.
      cell: () => <span className="text-sm text-gray-300">—</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">{getValue() || '—'}</span>
      ),
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600">{getValue() ?? '—'}</span>
      ),
    },
    {
      accessorKey: 'next_appointment',
      header: 'Next Appointment',
      // Sort chronologically; null/undefined always last.
      sortingFn: (a, b) => {
        const av = a.original.next_appointment
        const bv = b.original.next_appointment
        if (!av && !bv) return 0
        if (!av) return 1
        if (!bv) return -1
        return new Date(av) - new Date(bv)
      },
      cell: ({ getValue }) => {
        const v = getValue()
        if (!v) return <span className="text-sm text-gray-300">—</span>
        return (
          <span className="text-sm text-gray-700">
            {new Date(v).toLocaleDateString('en-ZA', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Action',
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Link
          href={`/patients/${row.original.id}`}
          title="View"
          aria-label="View patient"
          className="inline-flex p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <Eye size={15} />
        </Link>
      ),
    },
  ], [])

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown">Patients</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {stats?.total ?? 0} registered patients
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Patients"
          value={stats?.total ?? 0}
          icon={Users}
          color="text-brand-brown"
        />
        <StatCard
          label="Active"
          value={stats?.active ?? 0}
          icon={UserCheck}
          color="text-emerald-600"
        />
        <StatCard
          label="New This Month"
          value={stats?.new_this_month ?? 0}
          icon={UserPlus}
          color="text-amber-600"
        />
      </div>

      <DataTable
        columns={columns}
        data={patients}
        globalFilterPlaceholder="Search name, phone, email…"
        initialSort={[{ id: 'full_name', desc: false }]}
        pageSize={10}
        totalLabel="patients"
        emptyMessage="No patients registered yet"
        filters={({ setColumnFilter, getColumnFilter }) => (
          <>
            <select
              value={getColumnFilter('status')}
              onChange={(e) => setColumnFilter('status', e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {getColumnFilter('status') && (
              <button
                type="button"
                onClick={() => setColumnFilter('status', '')}
                className="text-xs text-gray-500 hover:text-brand-brown px-2"
              >
                Clear
              </button>
            )}
          </>
        )}
      />
    </DashboardLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center flex-shrink-0">
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = status === 'active'
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  )
}

function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('') || '·'
  )
}
