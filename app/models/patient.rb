class Patient < ApplicationRecord
  has_many :appointments, dependent: :destroy
  has_many :call_logs, dependent: :nullify
  has_many :conversations, dependent: :destroy

  # Phase 9.6 sub-area #4 — optional 1:1 medical history record.
  # `autosave: true` so nested attributes posted from the Patient form
  # are persisted inside the parent save; `dependent: :destroy` keeps
  # records clean if a patient is ever deleted.
  has_one :medical_history,
          class_name: "PatientMedicalHistory",
          dependent: :destroy,
          autosave: true

  # Allow the PatientsController to accept nested medical_history
  # attributes in one form submission. `_destroy` is intentionally
  # not wired — the patient record owns the history, so clearing it
  # is done by blanking the fields rather than deleting the row.
  accepts_nested_attributes_for :medical_history, update_only: true

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :phone, presence: true, uniqueness: true,
            format: { with: /\A\+?\d{10,15}\z/, message: "must be a valid phone number" }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  def full_name
    "#{first_name} #{last_name}"
  end

  # Convenience accessor — returns the existing record or a new
  # unsaved one so views / props can always call the same getter
  # without nil checks.
  def medical_history_or_build
    medical_history || build_medical_history
  end
end
