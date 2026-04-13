class PagesController < ApplicationController
  def dashboard
    today = Date.current

    render inertia: "Dashboard", props: {
      stats: {
        todays_appointments: Appointment.for_date(today).count,
        pending_confirmations: Appointment.for_date(today).where(status: :scheduled).count,
        confirmed_today: Appointment.for_date(today).where(status: :confirmed).count,
        whatsapp_messages: Conversation.by_channel("whatsapp").where("updated_at >= ?", 7.days.ago).count,
        flagged_patients: ConfirmationLog.flagged.joins(:appointment).where(appointments: { start_time: today.all_day }).count
      },
      upcoming_appointments: Appointment.upcoming.limit(5).includes(:patient).map { |a|
        appointment_props(a)
      },
      system_status: {
        database: true,
        google_calendar: ENV["GOOGLE_CALENDAR_ID"].present?,
        twilio: ENV["TWILIO_ACCOUNT_SID"].present?,
        claude_ai: ENV["ANTHROPIC_API_KEY"].present?
      }
    }
  end

  private

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
end
