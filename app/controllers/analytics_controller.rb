class AnalyticsController < ApplicationController
  def index
    render inertia: "Analytics", props: {
      cancellation_stats: cancellation_stats,
      booking_stats: booking_stats,
      channel_stats: channel_stats
    }
  end

  private

  def cancellation_stats
    reasons = CancellationReason.group(:reason_category).count
    total_cancelled = Appointment.where(status: :cancelled).count

    {
      by_reason: CancellationReason::CATEGORIES.map { |cat|
        { category: cat, count: reasons[cat] || 0 }
      },
      total_cancelled: total_cancelled,
      cancellation_rate: calculate_rate(total_cancelled, Appointment.count)
    }
  end

  def booking_stats
    now = Date.current
    last_30_days = (now - 30.days)..now

    appointments_range = Appointment.where(created_at: last_30_days)
    {
      total_bookings_30d: appointments_range.count,
      completed_30d: appointments_range.where(status: :completed).count,
      no_shows_30d: appointments_range.where(status: :no_show).count,
      conversion_rate: calculate_rate(
        appointments_range.where(status: [:completed, :confirmed, :scheduled]).count,
        appointments_range.count
      )
    }
  end

  def channel_stats
    whatsapp = Conversation.by_channel("whatsapp").count
    voice = Conversation.by_channel("voice").count
    total = whatsapp + voice

    {
      whatsapp: whatsapp,
      voice: voice,
      whatsapp_pct: calculate_rate(whatsapp, total),
      voice_pct: calculate_rate(voice, total)
    }
  end

  def calculate_rate(numerator, denominator)
    return 0 if denominator.zero?
    ((numerator.to_f / denominator) * 100).round(1)
  end
end
