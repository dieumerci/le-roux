class AppointmentNoConfirmationJob < ApplicationJob
  queue_as :default

  # Run on the morning of appointment day (e.g. 07:30) to auto-cancel
  # any appointments that received a 24h reminder but never replied.
  # Only cancels `scheduled` status — `confirmed` means the patient
  # explicitly replied YES and must not be touched.
  def perform
    today = Date.current

    # Only consider appointments that:
    #   - are today
    #   - are still in `scheduled` status (not confirmed)
    #   - had at least one reminder sent (confirmation_log exists)
    appointments = Appointment
      .where(status: :scheduled)
      .where(start_time: today.all_day)
      .joins(:confirmation_logs)
      .where(confirmation_logs: { outcome: nil })
      .distinct
      .includes(:patient)

    Rails.logger.info(
      "[NoConfirmationJob] Found #{appointments.count} unconfirmed appointment(s) on #{today}"
    )

    template_service = begin
      WhatsappTemplateService.new
    rescue StandardError
      nil
    end

    appointments.each do |appointment|
      begin
        appointment.cancelled!

        appointment.confirmation_logs.create!(
          method: "system",
          outcome: "auto_cancelled",
          attempts: appointment.confirmation_logs.count,
          flagged: true,
          notes: "Auto-cancelled: no confirmation received before appointment day"
        )

        AuditService.log(
          action: "appointment.auto_cancelled",
          summary: "Auto-cancelled unconfirmed appointment for #{appointment.patient.full_name} on #{appointment.start_time.strftime('%-d %b %Y at %H:%M')}",
          resource: appointment,
          details: { reason: "No confirmation received after 24h reminder" },
          performed_by: "System"
        )

        notify_patient(template_service, appointment)
        notify_google_calendar(appointment)

        Rails.logger.info(
          "[NoConfirmationJob] Auto-cancelled appointment #{appointment.id} for #{appointment.patient.phone}"
        )
      rescue StandardError => e
        Rails.logger.error(
          "[NoConfirmationJob] Failed to cancel appointment #{appointment.id}: #{e.message}"
        )
      end
    end
  end

  private

  def notify_patient(template_service, appointment)
    return unless template_service

    patient  = appointment.patient
    day_name = appointment.start_time.strftime("%A")
    date_str = appointment.start_time.strftime("%-d %B %Y")
    time_str = appointment.start_time.strftime("%H:%M")
    lang     = patient.preferred_language || "en"

    body = if lang == "af"
      <<~MSG.strip
        Hallo #{patient.first_name},

        Aangesien ons nie 'n bevestiging ontvang het nie, het ons jou afspraak vir #{day_name}, #{date_str} om #{time_str} gekanselleer.

        As jy steeds 'n afspraak wil bespreek, is jy welkom om ons te antwoord en ons sal jou help.

        Dr Chalita & span
      MSG
    else
      <<~MSG.strip
        Hi #{patient.first_name},

        As we did not receive a confirmation, we have cancelled your appointment on #{day_name}, #{date_str} at #{time_str}.

        If you would still like to book, please reply here and we will get you sorted.

        Dr Chalita & team
      MSG
    end

    template_service.send_text(patient.phone, body)
  rescue StandardError => e
    Rails.logger.warn("[NoConfirmationJob] Patient notification failed for #{appointment.id}: #{e.message}")
  end

  def notify_google_calendar(appointment)
    return unless appointment.google_event_id.present?

    GoogleCalendarService.new.cancel_appointment(
      appointment.google_event_id,
      reason_category: "no_confirmation",
      reason_details: "Auto-cancelled: no reply to 24h reminder"
    )
  rescue StandardError => e
    Rails.logger.warn("[NoConfirmationJob] Google Calendar cancel skipped for #{appointment.id}: #{e.message}")
  end
end
