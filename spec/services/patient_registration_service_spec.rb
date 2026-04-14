require "rails_helper"

RSpec.describe PatientRegistrationService do
  describe "#call" do
    let(:base_attributes) do
      {
        first_name: "Alice",
        last_name: "Ndlovu",
        phone: "+27821234567",
        email: "alice@example.com",
        date_of_birth: "1992-04-15",
        notes: "New patient intake"
      }
    end

    it "creates a brand-new patient" do
      result = described_class.new(attributes: base_attributes).call

      expect(result).to be_success
      expect(result).to be_created
      expect(result).not_to be_upgraded_placeholder
      expect(result.patient).to be_persisted
      expect(result.patient.first_name).to eq("Alice")
    end

    it "does not create an empty medical history row when all nested fields are blank" do
      expect {
        described_class.new(attributes: base_attributes.merge(
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
        )).call
      }.to change(Patient, :count).by(1)
        .and change(PatientMedicalHistory, :count).by(0)

      expect(Patient.last.medical_history).to be_nil
    end

    it "upgrades an auto-created placeholder patient that matches by phone" do
      placeholder = create(:patient,
        first_name: "WhatsApp",
        last_name: "Patient",
        phone: base_attributes[:phone],
        email: nil,
        date_of_birth: nil,
        notes: nil
      )

      expect {
        result = described_class.new(attributes: base_attributes.merge(
          medical_history_attributes: {
            allergies: "Penicillin",
            blood_type: "O+"
          }
        )).call

        expect(result).to be_success
        expect(result).not_to be_created
        expect(result).to be_upgraded_placeholder
      }.not_to change(Patient, :count)

      placeholder.reload
      expect(placeholder.first_name).to eq("Alice")
      expect(placeholder.last_name).to eq("Ndlovu")
      expect(placeholder.email).to eq("alice@example.com")
      expect(placeholder.medical_history&.allergies).to eq("Penicillin")
      expect(placeholder.medical_history&.blood_type).to eq("O+")
    end

    it "matches an existing placeholder when the submitted phone omits the leading plus" do
      placeholder = create(:patient,
        first_name: "WhatsApp",
        last_name: "Patient",
        phone: "+27821234567",
        email: nil,
        date_of_birth: nil,
        notes: nil
      )

      result = described_class.new(attributes: base_attributes.merge(phone: "27821234567")).call

      expect(result).to be_success
      expect(result).to be_upgraded_placeholder
      expect(result.patient.id).to eq(placeholder.id)
      expect(result.patient.phone).to eq("+27821234567")
    end

    it "returns a validation error for a real duplicate patient" do
      existing = create(:patient, phone: base_attributes[:phone], first_name: "Existing", last_name: "Person")

      result = described_class.new(attributes: base_attributes).call

      expect(result).not_to be_success
      expect(result.patient).not_to be_persisted
      expect(result.existing_patient).to eq(existing)
      expect(result.patient.errors[:phone]).to include("already belongs to an existing patient record")
    end
  end
end
