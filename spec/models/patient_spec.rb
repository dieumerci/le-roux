require "rails_helper"

RSpec.describe Patient, type: :model do
  describe "phone normalization" do
    it "normalizes whitespace and adds a leading plus before validation" do
      patient = build(:patient, phone: "27 82 123 4567")

      patient.validate

      expect(patient.phone).to eq("+27821234567")
      expect(patient.errors[:phone]).to be_empty
    end
  end

  describe "#auto_created_placeholder_profile?" do
    it "returns true for WhatsApp-created placeholder profiles" do
      patient = build(:patient,
        first_name: "WhatsApp",
        last_name: "Patient",
        email: nil,
        date_of_birth: nil,
        notes: nil
      )

      expect(patient.auto_created_placeholder_profile?).to be(true)
    end

    it "returns false once meaningful profile data exists" do
      patient = build(:patient,
        first_name: "WhatsApp",
        last_name: "Patient",
        email: "real@example.com"
      )

      expect(patient.auto_created_placeholder_profile?).to be(false)
    end
  end
end
