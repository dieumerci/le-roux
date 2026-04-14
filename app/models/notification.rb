class Notification < ApplicationRecord
  belongs_to :patient,      optional: true
  belongs_to :appointment,  optional: true
  belongs_to :conversation, optional: true

  # Whitelisted categories so the UI can map each to an icon / colour
  # without relying on free-text. Keep this list in sync with the
  # render switch in NotificationBell.jsx.
  CATEGORIES = %w[
    appointment_created
    appointment_cancelled
    appointment_confirmed
    appointment_rescheduled
    patient_created
    conversation_started
    system
  ].freeze

  LEVELS = %w[info success warning danger].freeze

  validates :category, presence: true, inclusion: { in: CATEGORIES }
  validates :level,    presence: true, inclusion: { in: LEVELS }
  validates :title,    presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  def read?
    read_at.present?
  end

  def mark_read!
    update!(read_at: Time.current) unless read?
  end
end
