class Conversation < ApplicationRecord
  belongs_to :patient

  validates :channel, presence: true, inclusion: { in: %w[whatsapp voice] }
  validates :status, presence: true

  scope :active, -> { where(status: "active") }
  scope :by_channel, ->(channel) { where(channel: channel) }
  scope :recent, -> { order(updated_at: :desc) }

  def add_message(role:, content:, timestamp: Time.current)
    self.messages ||= []
    self.messages << { role: role, content: content, timestamp: timestamp.iso8601 }
    save!
  end

  def close!
    update!(status: "closed", ended_at: Time.current)
  end
end
