import React from 'react'
import { Link, router } from '@inertiajs/react'
import DashboardLayout from '../layouts/DashboardLayout'

export default function Patients({ patients, search, total }) {
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      router.get('/patients', { search: e.target.value || undefined }, { preserveState: true })
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-brown">Patients</h1>
        <p className="text-gray-500 mt-1 text-sm">{total} registered patients</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email… (press Enter)"
          defaultValue={search}
          onKeyDown={handleSearch}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-taupe/25 focus:border-brand-taupe transition-colors"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients?.length > 0 ? patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-taupe/50 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="min-w-0 mr-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-brand-brown transition-colors truncate">
                  {patient.full_name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
                {patient.email && <p className="text-xs text-gray-400 mt-0.5 truncate">{patient.email}</p>}
              </div>
              <span className="flex-shrink-0 bg-brand-gold/15 text-brand-brown text-xs font-semibold px-2 py-1 rounded-full">
                {patient.appointment_count} appts
              </span>
            </div>
            {patient.last_visit && (
              <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
                Last visit: {new Date(patient.last_visit).toLocaleDateString('en-ZA')}
              </p>
            )}
          </Link>
        )) : (
          <div className="col-span-3 text-center py-16 text-gray-400 text-sm">
            {search ? 'No patients match your search' : 'No patients registered yet'}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
