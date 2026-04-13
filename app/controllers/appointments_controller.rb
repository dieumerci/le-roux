class AppointmentsController < ApplicationController
  def index
    appointments = Appointment.includes(:patient).order(start_time: :desc)
    appointments = apply_filters(appointments)

    render inertia: "Appointments", props: {
      appointments: appointments.limit(50).map { |a| appointment_props(a) },
      filters: filter_params.to_h,
      stats: {
        total: appointments.count,
        scheduled: appointments.where(status: :scheduled).count,
        confirmed: appointments.where(status: :confirmed).count,
        cancelled: appointments.where(status: :cancelled).count,
        completed: appointments.where(status: :completed).count
      }
    }
  end

  def show
    appointment = Appointment.includes(:patient, :cancellation_reason, :confirmation_logs).find(params[:id])

    render inertia: "AppointmentShow", props: {
      appointment: detailed_appointment_props(appointment)
    }
  end

  private

  def apply_filters(scope)
    scope = scope.where(status: filter_params[:status]) if filter_params[:status].present?
    scope = scope.for_date(Date.parse(filter_params[:date])) if filter_params[:date].present?
    if filter_params[:search].present?
      scope = scope.joins(:patient).where(
        "patients.first_name ILIKE :q OR patients.last_name ILIKE :q OR patients.phone ILIKE :q",
        q: "%#{filter_params[:search]}%"
      )
    end
    scope
  end

  def filter_params
    params.permit(:status, :date, :search)
  end

  def appointment_props(appointment)
    {
      id: appointment.id,
      patient_name: appointment.patient.full_name,
      patient_phone: appointment.patient.phone,
      start_time: appointment.start_time.iso8601,
      end_time: appointment.end_time.iso8601,
      status: appointment.status,
      reason: appointment.reason
    }
  end

  def detailed_appointment_props(appointment)
    appointment_props(appointment).merge(
      notes: appointment.notes,
      google_event_id: appointment.google_event_id,
      patient_id: appointment.patient_id,
      cancellation_reason: appointment.cancellation_reason&.then { |cr|
        { category: cr.reason_category, details: cr.details }
      },
      confirmation_logs: appointment.confirmation_logs.order(created_at: :desc).map { |cl|
        { method: cl.method, outcome: cl.outcome, attempts: cl.attempts, flagged: cl.flagged, created_at: cl.created_at.iso8601 }
      }
    )
  end
end
