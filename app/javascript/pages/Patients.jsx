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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500 mt-1">{total} registered patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, or email... (press Enter)"
          defaultValue={search}
          onKeyDown={handleSearch}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients?.length > 0 ? patients.map((patient) => (
          <Link
            key={patient.id}
            href={`/patients/${patient.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{patient.full_name}</h3>
                <p className="text-sm text-gray-500 mt-1">{patient.phone}</p>
                {patient.email && <p className="text-sm text-gray-400">{patient.email}</p>}
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                {patient.appointment_count} appts
              </span>
            </div>
            {patient.last_visit && (
              <p className="text-xs text-gray-400 mt-3">
                Last visit: {new Date(patient.last_visit).toLocaleDateString('en-ZA')}
              </p>
            )}
          </Link>
        )) : (
          <div className="col-span-3 text-center py-12 text-gray-400">
            {search ? 'No patients match your search' : 'No patients registered yet'}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
