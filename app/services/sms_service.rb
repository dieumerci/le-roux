class SmsService
  class Error < StandardError; end

  PRACTICE_ADDRESS = "Unit 2, Amorosa Office Park, Corner of Doreen Rd & Lawrence Rd, Amorosa, Johannesburg, 2040".freeze
  MAP_LINK = "https://www.google.com/maps/place/Dr+Chalita+Johnson+le+Roux/@-26.0958593,27.8679389,15z".freeze

  class << self
    def send_confirmation(appointment)
      patient = appointment.patient
      time_str = appointment.start_time.strftime("%A %-d %B at %H:%M")
      arrive = (appointment.start_time - 15.minutes).strftime("%H:%M")

      body = "Dr Chalita le Roux — Appointment confirmed for #{time_str}. " \
             "Please arrive at #{arrive}. " \
             "Location: #{PRACTICE_ADDRESS}. " \
             "Map: #{MAP_LINK}"

      send_sms(patient.phone, body)
    end

    def send_reminder(appointment)
      patient = appointment.patient
      time_str = appointment.start_time.strftime("%H:%M")

      body = "Reminder: You have an appointment tomorrow at #{time_str} " \
             "with Dr Chalita le Roux. " \
             "Reply YES to confirm or call us to reschedule. " \
             "Location: #{PRACTICE_ADDRESS}"

      send_sms(patient.phone, body)
    end

    def send_cancellation(appointment)
      patient = appointment.patient
      date_str = appointment.start_time.strftime("%A %-d %B")

      body = "Dr Chalita le Roux — Your appointment on #{date_str} " \
             "has been cancelled. Contact us to rebook."

      send_sms(patient.phone, body)
    end

    private

    def send_sms(to_phone, body)
      return unless twilio_configured?

      formatted = to_phone.start_with?("+") ? to_phone : "+#{to_phone}"

      client.messages.create(
        from: ENV.fetch("TWILIO_SMS_NUMBER"),
        to: formatted,
        body: body
      )
    rescue Twilio::REST::TwilioError => e
      Rails.logger.error("[SMS] Failed to send to #{to_phone}: #{e.message}")
      raise Error, "SMS send failed: #{e.message}"
    end

    def twilio_configured?
      ENV["TWILIO_ACCOUNT_SID"].present? &&
        ENV["TWILIO_AUTH_TOKEN"].present? &&
        ENV["TWILIO_SMS_NUMBER"].present?
    end

    def client
      @client ||= Twilio::REST::Client.new(
        ENV.fetch("TWILIO_ACCOUNT_SID"),
        ENV.fetch("TWILIO_AUTH_TOKEN")
      )
    end
  end
end
