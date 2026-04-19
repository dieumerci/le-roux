require "csv"

class AuditLogsController < ApplicationController
  PER_PAGE = 50

  def index
    scope = AuditLog.filtered(
      action:       params[:action_filter],
      performed_by: params[:performed_by],
      date_from:    parse_date(params[:date_from]),
      date_to:      parse_date(params[:date_to])
    )

    total  = scope.count
    page   = [ params[:page].to_i, 1 ].max
    offset = (page - 1) * PER_PAGE
    logs   = scope.limit(PER_PAGE).offset(offset).to_a

    distinct_actions    = AuditLog.distinct.order(:action).pluck(:action)
    distinct_performers = AuditLog.distinct.order(:performed_by).pluck(:performed_by).compact

    render inertia: "AuditLog", props: {
      logs: logs.map { |l| log_props(l) },
      meta: {
        total: total,
        page: page,
        per_page: PER_PAGE,
        total_pages: (total.to_f / PER_PAGE).ceil
      },
      filters: {
        action_filter: params[:action_filter],
        performed_by: params[:performed_by],
        date_from: params[:date_from],
        date_to: params[:date_to]
      },
      distinct_actions: distinct_actions,
      distinct_performers: distinct_performers
    }
  end

  def export
    scope = AuditLog.filtered(
      action:       params[:action_filter],
      performed_by: params[:performed_by],
      date_from:    parse_date(params[:date_from]),
      date_to:      parse_date(params[:date_to])
    )

    logs = scope.limit(10_000).to_a

    csv = CSV.generate(headers: true) do |csv|
      csv << [ "ID", "Timestamp", "Action", "Summary", "Resource Type", "Resource ID", "Performed By", "IP Address", "Details" ]
      logs.each do |l|
        csv << [
          l.id,
          l.created_at.strftime("%Y-%m-%d %H:%M:%S"),
          l.action,
          l.summary,
          l.resource_type,
          l.resource_id,
          l.performed_by,
          l.ip_address,
          l.details.to_json
        ]
      end
    end

    send_data csv,
      filename: "audit-log-#{Date.current.iso8601}.csv",
      type: "text/csv",
      disposition: "attachment"
  end

  private

  def log_props(log)
    {
      id: log.id,
      action: log.action,
      summary: log.summary,
      resource_type: log.resource_type,
      resource_id: log.resource_id,
      performed_by: log.performed_by,
      ip_address: log.ip_address,
      details: log.details,
      created_at: log.created_at.iso8601
    }
  end

  def parse_date(value)
    Date.iso8601(value) if value.present?
  rescue ArgumentError
    nil
  end
end
