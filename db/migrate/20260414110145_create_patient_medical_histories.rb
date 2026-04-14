class CreatePatientMedicalHistories < ActiveRecord::Migration[8.1]
  # Phase 9.6 sub-area #4 — Patient Records.
  #
  # Extracted into a separate 1:1 table rather than widening the
  # patients table because:
  #   - Medical history is edited by a different UI surface (records
  #     panel on PatientShow) and it keeps updates/audit scopes clean.
  #   - Most patients (walk-ins, quick bookings) won't have one yet —
  #     keeping the base patients row lean avoids nullable bloat.
  #   - Later phases may add file attachments / signed consent forms
  #     hanging off this record without touching the core patient row.
  def change
    create_table :patient_medical_histories do |t|
      t.references :patient, null: false, foreign_key: true, index: { unique: true }

      t.text   :allergies
      t.text   :chronic_conditions
      t.text   :current_medications
      t.string :blood_type
      t.string :emergency_contact_name
      t.string :emergency_contact_phone
      t.string :insurance_provider
      t.string :insurance_policy_number
      t.text   :dental_notes
      t.date   :last_dental_visit

      t.timestamps
    end
  end
end
