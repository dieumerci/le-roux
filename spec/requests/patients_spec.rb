require 'rails_helper'

RSpec.describe 'Patients', type: :request do
  describe 'GET /patients' do
    it 'renders the inertia patients page with stats' do
      create_list(:patient, 3)

      get patients_path

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /patients' do
    let(:base_attrs) do
      {
        first_name: 'Alice',
        last_name:  'Ndlovu',
        phone:      '+27821234567',
        email:      'alice@example.com',
        date_of_birth: '1992-04-15'
      }
    end

    it 'creates a patient without medical history' do
      expect {
        post patients_path, params: { patient: base_attrs }
      }.to change(Patient, :count).by(1)

      patient = Patient.last
      expect(patient.first_name).to eq('Alice')
      expect(patient.medical_history).to be_nil
      expect(response).to have_http_status(:see_other)
    end

    it 'creates a patient with nested medical history in one transaction' do
      expect {
        post patients_path, params: {
          patient: base_attrs.merge(
            medical_history_attributes: {
              allergies: 'Penicillin',
              blood_type: 'O+',
              emergency_contact_name: 'Sipho',
              emergency_contact_phone: '+27827654321'
            }
          )
        }
      }.to change(Patient, :count).by(1)
        .and change(PatientMedicalHistory, :count).by(1)

      patient = Patient.last
      expect(patient.medical_history.allergies).to eq('Penicillin')
      expect(patient.medical_history.blood_type).to eq('O+')
    end

    it 'rejects invalid phone numbers' do
      expect {
        post patients_path, params: { patient: base_attrs.merge(phone: 'not-a-phone') }
      }.not_to change(Patient, :count)

      expect(response).to have_http_status(:see_other)
      follow_redirect!
      expect(flash[:alert]).to be_present
    end

    it 'rejects invalid blood types' do
      expect {
        post patients_path, params: {
          patient: base_attrs.merge(
            medical_history_attributes: { blood_type: 'ZZ' }
          )
        }
      }.not_to change(Patient, :count)
    end
  end

  describe 'PATCH /patients/:id' do
    let!(:patient) { create(:patient) }

    it 'updates patient demographics' do
      patch patient_path(patient), params: {
        patient: { first_name: 'Updated', last_name: 'Name' }
      }

      expect(response).to have_http_status(:see_other)
      patient.reload
      expect(patient.first_name).to eq('Updated')
    end

    it 'creates a medical history on first edit' do
      expect {
        patch patient_path(patient), params: {
          patient: {
            medical_history_attributes: {
              allergies: 'Ibuprofen',
              blood_type: 'A-'
            }
          }
        }
      }.to change(PatientMedicalHistory, :count).by(1)

      expect(patient.reload.medical_history.allergies).to eq('Ibuprofen')
    end

    it 'updates an existing medical history in place' do
      mh = patient.create_medical_history!(allergies: 'Old', blood_type: 'B+')

      expect {
        patch patient_path(patient), params: {
          patient: {
            medical_history_attributes: { id: mh.id, allergies: 'New', blood_type: 'B-' }
          }
        }
      }.not_to change(PatientMedicalHistory, :count)

      mh.reload
      expect(mh.allergies).to eq('New')
      expect(mh.blood_type).to eq('B-')
    end

    it 'rejects invalid emergency contact phone' do
      patch patient_path(patient), params: {
        patient: {
          medical_history_attributes: { emergency_contact_phone: 'abc' }
        }
      }

      expect(response).to have_http_status(:see_other)
      follow_redirect!
      expect(flash[:alert]).to be_present
    end
  end
end
