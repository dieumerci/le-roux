class PatientsController < ApplicationController
  # Client-side DataTable handles search, sort, filter and pagination,
  # so we ship the full patient list (capped for safety). For a single
  # dental practice this is well under a megabyte of JSON.
  LIST_ROW_LIMIT = 500

  # A patient is "Active" if they've had any appointment in the last
  # 6 months OR have an upcoming one. Otherwise "Inactive".
  ACTIVE_WINDOW_MONTHS = 6

  def index
    patients = Patient
      .includes(:appointments)
      .order(:last_name, :first_name)
      .limit(LIST_ROW_LIMIT)

    render inertia: "Patients", props: {
      patients: patients.map { |p| patient_list_props(p) },
      stats: {
        total: Patient.count,
        active: Patient.joins(:appointments)
          .where("appointments.start_time >= ?", ACTIVE_WINDOW_MONTHS.months.ago)
          .distinct.count,
        new_this_month: Patient.where(created_at: Time.current.beginning_of_month..).count
      }
    }
  end

  def show
    patient = Patient.find(params[:id])
    appointments = patient.appointments.order(start_time: :desc).limit(20)
    conversations = patient.conversations.order(updated_at: :desc).limit(10)

    render inertia: "PatientShow", props: {
      patient: patient_detail_props(patient),
      appointments: appointments.map { |a| appointment_props(a) },
      conversations: conversations.map { |c| conversation_props(c) }
    }
  end

  private

  # Props for the DataTable list — augments the base patient columns
  # with derived fields the screenshot reference shows:
  #   - code: "P001" style id, padded for tidy display
  #   - age: computed from date_of_birth
  #   - status: Active / Inactive based on appointment recency
  #   - next_appointment: nearest upcoming appointment ISO date
  #   - appointment_count: for power-user sorting / filtering
  def patient_list_props(patient)
    now  = Time.current
    all  = patient.appointments
    last_visit = all.select { |a| a.start_time < now }
                    .max_by(&:start_time)
    next_appt  = all.select { |a| a.start_time >= now && a.status.to_s != "cancelled" }
                    .min_by(&:start_time)

    active =
      (last_visit && last_visit.start_time >= ACTIVE_WINDOW_MONTHS.months.ago) ||
      next_appt.present?

    {
      id: patient.id,
      code: "P#{patient.id.to_s.rjust(3, '0')}",
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email,
      age: age_from(patient.date_of_birth),
      status: active ? "active" : "inactive",
      appointment_count: all.size,
      last_visit: last_visit&.start_time&.iso8601,
      next_appointment: next_appt&.start_time&.iso8601
    }
  end

  def age_from(dob)
    return nil if dob.nil?
    today = Date.current
    age = today.year - dob.year
    age -= 1 if today < dob + age.years
    age
  end

  def patient_detail_props(patient)
    {
      id: patient.id,
      first_name: patient.first_name,
      last_name: patient.last_name,
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email,
      date_of_birth: patient.date_of_birth&.iso8601,
      notes: patient.notes,
      created_at: patient.created_at.iso8601
    }
  end

  def appointment_props(appointment)
    {
      id: appointment.id,
      start_time: appointment.start_time.iso8601,
      end_time: appointment.end_time.iso8601,
      status: appointment.status,
      reason: appointment.reason
    }
  end

  def conversation_props(conversation)
    {
      id: conversation.id,
      channel: conversation.channel,
      status: conversation.status,
      message_count: conversation.messages&.length || 0,
      started_at: conversation.started_at&.iso8601,
      updated_at: conversation.updated_at.iso8601
    }
  end
end
