class ConfirmationLog < ApplicationRecord
  belongs_to :appointment

  METHODS = %w[voice whatsapp].freeze
  OUTCOMES = %w[confirmed rescheduled cancelled no_answer voicemail unclear].freeze

  validates :method, presence: true, inclusion: { in: METHODS }
  validates :outcome, inclusion: { in: OUTCOMES }, allow_nil: true

  scope :flagged, -> { where(flagged: true) }
  scope :for_today, -> { joins(:appointment).where(appointments: { start_time: Time.current.all_day }) }
end
