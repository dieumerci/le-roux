module AuditService
  # Log an auditable action. Never raises — audit failures must never
  # interrupt the primary request flow.
  #
  # @param action [String]        e.g. "appointment.created", "patient.updated"
  # @param summary [String]       Human-readable one-liner shown in the dashboard
  # @param resource [ActiveRecord::Base, nil]  the affected record (optional)
  # @param details [Hash]         arbitrary diff/metadata stored as JSONB
  # @param performed_by [String]  display name of the actor
  # @param ip_address [String]    request remote IP
  def self.log(action:, summary:, resource: nil, details: {}, performed_by: nil, ip_address: nil)
    AuditLog.create!(
      action: action,
      resource_type: resource&.class&.name,
      resource_id: resource&.id,
      summary: summary,
      details: details,
      performed_by: performed_by,
      ip_address: ip_address
    )
  rescue StandardError => e
    Rails.logger.warn("[AuditService] Failed to write audit log: #{e.message}")
    nil
  end
end
