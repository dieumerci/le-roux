class AppointmentMailer < ApplicationMailer
  def confirmation(appointment)
    @appointment = appointment
    @patient = appointment.patient

    return unless @patient.email.present?

    mail(
      to: @patient.email,
      subject: "Appointment Confirmed — #{@appointment.start_time.strftime('%A, %-d %B %Y at %H:%M')}"
    )
  end

  def reminder(appointment)
    @appointment = appointment
    @patient = appointment.patient

    return unless @patient.email.present?

    mail(
      to: @patient.email,
      subject: "Reminder: Appointment Tomorrow — #{@appointment.start_time.strftime('%A, %-d %B %Y at %H:%M')}"
    )
  end

  def cancellation(appointment)
    @appointment = appointment
    @patient = appointment.patient

    return unless @patient.email.present?

    mail(
      to: @patient.email,
      subject: "Appointment Cancelled — #{@appointment.start_time.strftime('%A, %-d %B %Y')}"
    )
  end
end
