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

    it 'does not create an empty medical history row when nested fields are blank' do
      expect {
        post patients_path, params: {
          patient: base_attrs.merge(
            medical_history_attributes: {
              allergies: nil,
              chronic_conditions: nil,
              current_medications: nil,
              blood_type: nil,
              emergency_contact_name: nil,
              emergency_contact_phone: nil,
              insurance_provider: nil,
              insurance_policy_number: nil,
              dental_notes: nil,
              last_dental_visit: nil
            }
          )
        }
      }.to change(Patient, :count).by(1)
        .and change(PatientMedicalHistory, :count).by(0)
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

    it 'upgrades an auto-created placeholder patient with the same phone' do
      placeholder = create(:patient,
        first_name: 'WhatsApp',
        last_name: 'Patient',
        phone: base_attrs[:phone],
        email: nil,
        date_of_birth: nil,
        notes: nil
      )

      expect {
        post patients_path, params: {
          patient: base_attrs.merge(
            medical_history_attributes: {
              allergies: 'Penicillin',
              blood_type: 'O+'
            }
          )
        }
      }.not_to change(Patient, :count)

      expect(response).to have_http_status(:see_other)
      expect(response.headers['Location']).to end_with(patient_path(placeholder))

      placeholder.reload
      expect(placeholder.first_name).to eq('Alice')
      expect(placeholder.last_name).to eq('Ndlovu')
      expect(placeholder.email).to eq('alice@example.com')
      expect(placeholder.medical_history&.blood_type).to eq('O+')
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

    it 'does not overwrite an existing non-placeholder patient with the same phone' do
      existing = create(:patient,
        first_name: 'Existing',
        last_name: 'Patient',
        phone: base_attrs[:phone]
      )

      expect {
        post patients_path,
          params: { patient: base_attrs },
          headers: { 'X-Inertia' => 'true', 'X-Requested-With' => 'XMLHttpRequest' }
      }.not_to change(Patient, :count)

      expect(response).to have_http_status(:see_other)
      expect(session[:inertia_errors]).to include(phone: /already belongs/)

      existing.reload
      expect(existing.first_name).to eq('Existing')
      expect(existing.last_name).to eq('Patient')
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

    it 'does not create an empty medical history row when demographic-only edits submit blank nested fields' do
      expect {
        patch patient_path(patient), params: {
          patient: {
            first_name: 'Updated',
            medical_history_attributes: {
              allergies: nil,
              chronic_conditions: nil,
              current_medications: nil,
              blood_type: nil,
              emergency_contact_name: nil,
              emergency_contact_phone: nil,
              insurance_provider: nil,
              insurance_policy_number: nil,
              dental_notes: nil,
              last_dental_visit: nil
            }
          }
        }
      }.not_to change(PatientMedicalHistory, :count)

      expect(patient.reload.first_name).to eq('Updated')
      expect(patient.medical_history).to be_nil
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
