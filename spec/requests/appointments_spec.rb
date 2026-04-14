require 'rails_helper'

RSpec.describe 'Appointments', type: :request do
  describe 'PATCH /appointments/:id' do
    let!(:appointment) { create(:appointment) }
    let(:new_start) { 3.days.from_now.change(hour: 14, min: 0) }
    let(:new_end)   { 3.days.from_now.change(hour: 14, min: 30) }

    it 'reschedules a local appointment' do
      patch appointment_path(appointment), params: {
        appointment: {
          start_time: new_start.iso8601,
          end_time: new_end.iso8601
        }
      }

      expect(response).to have_http_status(:see_other)
      appointment.reload
      expect(appointment.start_time).to be_within(1.second).of(new_start)
      expect(appointment.end_time).to be_within(1.second).of(new_end)
    end

    it 'updates reason and notes without touching time' do
      original_start = appointment.start_time
      patch appointment_path(appointment), params: {
        appointment: { reason: 'Root canal', notes: 'Anxious patient' }
      }

      expect(response).to have_http_status(:see_other)
      appointment.reload
      expect(appointment.reason).to eq('Root canal')
      expect(appointment.notes).to eq('Anxious patient')
      expect(appointment.start_time).to be_within(1.second).of(original_start)
    end

    it 'rejects invalid times' do
      patch appointment_path(appointment), params: {
        appointment: { start_time: 'not-a-date', end_time: '' }
      }

      expect(response).to have_http_status(:see_other)
      expect(flash[:alert]).to be_present
    end

    it 'rejects end_time <= start_time' do
      patch appointment_path(appointment), params: {
        appointment: {
          start_time: new_start.iso8601,
          end_time: new_start.iso8601
        }
      }

      expect(response).to have_http_status(:see_other)
      expect(flash[:alert]).to be_present
    end

    context 'when the appointment is linked to a Google Calendar event' do
      let!(:appointment) { create(:appointment, :with_google_event) }

      it 'syncs via GoogleCalendarService' do
        fake_service = instance_double(GoogleCalendarService)
        allow(GoogleCalendarService).to receive(:new).and_return(fake_service)
        expect(fake_service).to receive(:reschedule_appointment)
          .with(appointment.google_event_id, new_start: kind_of(ActiveSupport::TimeWithZone), new_end: kind_of(ActiveSupport::TimeWithZone))

        patch appointment_path(appointment), params: {
          appointment: {
            start_time: new_start.iso8601,
            end_time: new_end.iso8601
          }
        }

        expect(response).to have_http_status(:see_other)
      end

      it 'still persists locally when Google sync raises' do
        fake_service = instance_double(GoogleCalendarService)
        allow(GoogleCalendarService).to receive(:new).and_return(fake_service)
        allow(fake_service).to receive(:reschedule_appointment).and_raise(StandardError, 'boom')

        expect(Rails.logger).to receive(:error).with(/Google sync failed/)

        patch appointment_path(appointment), params: {
          appointment: {
            start_time: new_start.iso8601,
            end_time: new_end.iso8601
          }
        }

        expect(response).to have_http_status(:see_other)
        appointment.reload
        expect(appointment.start_time).to be_within(1.second).of(new_start)
      end
    end
  end

  describe 'POST /appointments' do
    let!(:patient) { create(:patient) }
    let(:start_at) { 5.days.from_now.change(hour: 9, min: 0) }
    let(:end_at)   { 5.days.from_now.change(hour: 9, min: 30) }

    before do
      # Force the local-only branch for these specs — we don't want to
      # hit the Google Calendar service here; it's covered by its own
      # spec in spec/services.
      allow(ENV).to receive(:[]).and_call_original
      allow(ENV).to receive(:[]).with("GOOGLE_CALENDAR_ID").and_return(nil)
    end

    it 'creates a local appointment' do
      expect {
        post appointments_path, params: {
          appointment: {
            patient_id: patient.id,
            start_time: start_at.iso8601,
            end_time: end_at.iso8601,
            reason: 'Cleaning'
          }
        }
      }.to change(Appointment, :count).by(1)

      expect(response).to have_http_status(:see_other)
      appointment = Appointment.last
      expect(appointment.patient).to eq(patient)
      expect(appointment.reason).to eq('Cleaning')
      expect(appointment.status).to eq('scheduled')
    end

    it 'rejects invalid times without creating anything' do
      expect {
        post appointments_path, params: {
          appointment: {
            patient_id: patient.id,
            start_time: '',
            end_time: ''
          }
        }
      }.not_to change(Appointment, :count)

      expect(response).to have_http_status(:see_other)
      expect(flash[:alert]).to be_present
    end
  end

  describe 'PATCH /appointments/:id/cancel' do
    let!(:appointment) { create(:appointment) }

    it 'marks the appointment as cancelled' do
      patch cancel_appointment_path(appointment), params: {
        cancellation: { category: 'cost', details: 'Too expensive' }
      }

      expect(response).to have_http_status(:see_other)
      appointment.reload
      expect(appointment.status).to eq('cancelled')
      expect(appointment.cancellation_reason.reason_category).to eq('cost')
      expect(appointment.cancellation_reason.details).to eq('Too expensive')
    end

    it 'cancels without a reason when none is given' do
      patch cancel_appointment_path(appointment)

      expect(response).to have_http_status(:see_other)
      expect(appointment.reload.status).to eq('cancelled')
      expect(appointment.cancellation_reason).to be_nil
    end
  end

  describe 'PATCH /appointments/:id/confirm' do
    let!(:appointment) { create(:appointment, status: :scheduled) }

    it 'marks the appointment as confirmed' do
      patch confirm_appointment_path(appointment)

      expect(response).to have_http_status(:see_other)
      expect(appointment.reload.status).to eq('confirmed')
    end
  end
end
