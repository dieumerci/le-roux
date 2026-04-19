class AuditLog < ApplicationRecord
  validates :action, :summary, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :for_resource, ->(type, id) { where(resource_type: type, resource_id: id) }
  scope :by_action, ->(action) { where(action: action) }
  scope :by_performer, ->(name) { where(performed_by: name) }

  # Paginated query for the dashboard — 50 per page.
  def self.filtered(action: nil, performed_by: nil, date_from: nil, date_to: nil)
    scope = recent
    scope = scope.by_action(action) if action.present?
    scope = scope.by_performer(performed_by) if performed_by.present?
    scope = scope.where("created_at >= ?", date_from.beginning_of_day) if date_from.present?
    scope = scope.where("created_at <= ?", date_to.end_of_day) if date_to.present?
    scope
  end
end
