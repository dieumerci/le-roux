class CancellationReason < ApplicationRecord
  belongs_to :appointment

  CATEGORIES = %w[cost timing fear transport other].freeze

  validates :reason_category, presence: true, inclusion: { in: CATEGORIES }

  scope :by_category, ->(category) { where(reason_category: category) }
end
