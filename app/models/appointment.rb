class Appointment < ApplicationRecord
  belongs_to :patient
  has_one :cancellation_reason, dependent: :destroy
  has_many :confirmation_logs, dependent: :destroy

  enum :status, {
    scheduled: 0,
    confirmed: 1,
    completed: 2,
    cancelled: 3,
    no_show: 4,
    rescheduled: 5
  }

  validates :start_time, presence: true
  validates :end_time, presence: true
  validates :google_event_id, uniqueness: true, allow_nil: true
  validate :end_time_after_start_time

  scope :upcoming, -> { where("start_time > ?", Time.current).where.not(status: :cancelled).order(:start_time) }
  scope :for_date, ->(date) { where(start_time: date.all_day) }

  private

  def end_time_after_start_time
    return if start_time.blank? || end_time.blank?

    if end_time <= start_time
      errors.add(:end_time, "must be after start time")
    end
  end
end
