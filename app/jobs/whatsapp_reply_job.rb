class WhatsappReplyJob < ApplicationJob
  queue_as :default

  def perform(from:, message:, twilio_params: {})
    result = WhatsappService.new.handle_incoming(
      from: from,
      message: message,
      twilio_params: twilio_params
    )

    # Send the AI response back via Twilio REST API
    send_reply(from, result[:response])
  rescue StandardError => e
    Rails.logger.error("[WhatsappReplyJob] Error processing message from #{from}: #{e.message}\n#{e.backtrace.first(5).join("\n")}")
    send_reply(from, "I'm sorry, something went wrong on our end. Please try again or call us directly.")
  end

  private

  def send_reply(to_phone, message)
    return if message.blank?

    WhatsappTemplateService.new.send_text(to_phone, message)
  rescue StandardError => e
    Rails.logger.error("[WhatsappReplyJob] Failed to send reply to #{to_phone}: #{e.message}")
  end
end
