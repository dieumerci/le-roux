class SettingsController < ApplicationController
  SUPPORTED_LANGUAGES = %w[en af].freeze

  def index
    ps = PracticeSettings.instance

    page_data = dev_page_cache("settings", "index") do
      {
        schedules: DoctorSchedule.order(:day_of_week).map { |s|
          {
            id: s.id,
            day_name: s.day_name,
            day_of_week: s.day_of_week,
            start_time: s.start_time&.strftime("%H:%M"),
            end_time: s.end_time&.strftime("%H:%M"),
            break_start: s.break_start&.strftime("%H:%M"),
            break_end: s.break_end&.strftime("%H:%M"),
            active: s.active
          }
        },
        pricing: {
          consultation: ps.price_consultation,
          check_up: ps.price_check_up,
          cleaning: ps.price_cleaning
        },
        practice: {
          name:          ps.name,
          phone:         ps.phone,
          email:         ps.email,
          address_line1: ps.address_line1,
          address_line2: ps.address_line2,
          city:          ps.city,
          map_link:      ps.map_link,
          emergency_phone: ps.emergency_phone
        },
        notifications: {
          email_confirmations: true,
          email_reminders: true,
          sms_confirmations: ENV["TWILIO_SMS_NUMBER"].present?,
          sms_reminders: ENV["TWILIO_SMS_NUMBER"].present?,
          whatsapp_confirmations: true,
          whatsapp_reminders: true,
          reminder_hours_before: 24
        }
      }
    end

    render inertia: "Settings", props: page_data
  end

  # PATCH /settings/practice
  def update_practice
    ps = PracticeSettings.instance
    if ps.update(practice_params)
      expire_dev_page_cache("settings/index")
      AuditService.log(
        action: "settings.practice_updated",
        summary: "Updated practice details",
        performed_by: audit_performer,
        ip_address: request.remote_ip
      )
      redirect_to settings_path, notice: "Practice details saved", status: :see_other
    else
      redirect_to settings_path,
        alert: ps.errors.full_messages.to_sentence,
        inertia: { errors: ps.errors.to_hash(true).transform_values { |m| m.first } },
        status: :see_other
    end
  end

  # PATCH /settings/pricing
  def update_pricing
    ps = PracticeSettings.instance
    if ps.update(pricing_params)
      expire_dev_page_cache("settings/index")
      AuditService.log(
        action: "settings.pricing_updated",
        summary: "Updated pricing information",
        performed_by: audit_performer,
        ip_address: request.remote_ip
      )
      redirect_to settings_path, notice: "Pricing saved", status: :see_other
    else
      redirect_to settings_path,
        alert: ps.errors.full_messages.to_sentence,
        status: :see_other
    end
  end

  # POST /settings/language
  def update_language
    lang = params[:language].to_s.downcase
    session[:ui_language] = SUPPORTED_LANGUAGES.include?(lang) ? lang : "en"
    head :no_content
  end

  private

  def practice_params
    params.require(:practice).permit(:name, :phone, :email, :address_line1, :address_line2, :city, :map_link, :emergency_phone)
  end

  def pricing_params
    params.require(:pricing).permit(:price_consultation, :price_check_up, :price_cleaning)
  end
end
