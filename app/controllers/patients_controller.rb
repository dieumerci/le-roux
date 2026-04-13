class PatientsController < ApplicationController
  def index
    patients = Patient.order(:last_name, :first_name)

    if params[:search].present?
      patients = patients.where(
        "first_name ILIKE :q OR last_name ILIKE :q OR phone ILIKE :q OR email ILIKE :q",
        q: "%#{params[:search]}%"
      )
    end

    render inertia: "Patients", props: {
      patients: patients.limit(50).map { |p| patient_props(p) },
      search: params[:search] || "",
      total: patients.count
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

  def patient_props(patient)
    {
      id: patient.id,
      full_name: patient.full_name,
      phone: patient.phone,
      email: patient.email,
      appointment_count: patient.appointments.count,
      last_visit: patient.appointments.where(status: :completed).order(start_time: :desc).first&.start_time&.iso8601
    }
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
