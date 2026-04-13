class CallLog < ApplicationRecord
  belongs_to :patient, optional: true

  validates :twilio_call_sid, presence: true, uniqueness: true
  validates :caller_number, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :with_intent, ->(intent) { where(intent: intent) }
end
