class PatientMedicalHistory < ApplicationRecord
  # 1:1 with Patient. See CreatePatientMedicalHistories migration for
  # the rationale for extracting this into its own table.
  belongs_to :patient

  # Whitelist blood types so the form renders a fixed dropdown and
  # bad data can't sneak in via the API. `nil`/blank is allowed —
  # a patient may not know their blood type.
  BLOOD_TYPES = %w[A+ A- B+ B- AB+ AB- O+ O-].freeze

  validates :blood_type, inclusion: { in: BLOOD_TYPES }, allow_blank: true
  validates :emergency_contact_phone,
            format: { with: /\A\+?\d{10,15}\z/, message: "must be a valid phone number" },
            allow_blank: true

  # True if the patient has provided any medical information at all —
  # used by PatientShow to decide whether to render the panel empty
  # state or the populated view.
  def any_data?
    [
      allergies, chronic_conditions, current_medications, blood_type,
      emergency_contact_name, emergency_contact_phone,
      insurance_provider, insurance_policy_number,
      dental_notes, last_dental_visit
    ].any?(&:present?)
  end
end
