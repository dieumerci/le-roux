require "rails_helper"

RSpec.describe WhatsappService do
  let(:service) { described_class.new }
  let(:ai_service) { double("AiService") }

  before do
    # Stub AI service
    allow(AiService).to receive(:new).and_return(ai_service)
    allow(ai_service).to receive(:process_message)

    # Stub WhatsappTemplateService to not require Twilio creds
    allow(WhatsappTemplateService).to receive(:new).and_raise(StandardError)
  end

  describe "#handle_incoming" do
    context "with a new patient" do
      it "creates a patient and conversation, and processes through AI for multi-turn support" do
        allow(ai_service).to receive(:process_message).and_return({
          response: "I'd love to help you book an appointment. What date works best for you?",
          intent: "book",
          entities: {}
        })

        result = service.handle_incoming(
          from: "+27611111111",
          message: "I want to book an appointment"
        )

        expect(result[:response]).to include("book an appointment")
        expect(result[:intent]).to eq("book")
        expect(ai_service).to have_received(:process_message)

        patient = Patient.find_by(phone: "+27611111111")
        expect(patient).to be_present
        expect(patient.conversations.count).to eq(1)
      end
    end

    context "with an existing patient" do
      let!(:patient) { create(:patient, phone: "+27622222222") }

      it "reuses existing patient and active conversation" do
        conversation = create(:conversation, patient: patient, channel: "whatsapp", status: "active")

        allow(ai_service).to receive(:process_message).and_return({
          response: "Sure, let me check availability!",
          intent: "book",
          entities: { date: "2026-04-20", time: "10:00" }
        })

        result = service.handle_incoming(
          from: "+27622222222",
          message: "Monday at 10am please"
        )

        expect(result[:response]).to include("availability")
        expect(patient.conversations.count).to eq(1) # reused, not new
      end
    end

    context "with a confirmation intent" do
      let!(:patient) { create(:patient, phone: "+27633333333") }

      it "confirms a scheduled appointment for today" do
        appointment = create(:appointment,
          patient: patient,
          start_time: Time.current + 2.hours,
          end_time: Time.current + 2.5.hours,
          status: :scheduled
        )

        allow(ai_service).to receive(:process_message).and_return({
          response: "Great, your appointment is confirmed!",
          intent: "confirm",
          entities: {}
        })

        service.handle_incoming(from: "+27633333333", message: "Confirm")

        appointment.reload
        expect(appointment.status).to eq("confirmed")
        expect(appointment.confirmation_logs.count).to eq(1)
        expect(appointment.confirmation_logs.first.outcome).to eq("confirmed")
      end
    end

    context "with an FAQ intent" do
      it "processes FAQ questions through AI for natural multi-turn conversations" do
        allow(ai_service).to receive(:process_message).and_return({
          response: "We're open Monday to Friday 8am–5pm, and Saturdays 8am–12pm.",
          intent: "faq",
          entities: {}
        })

        result = service.handle_incoming(
          from: "+27644444444",
          message: "What are your hours?"
        )

        expect(result[:response]).to include("Monday to Friday")
        expect(result[:intent]).to eq("faq")
        expect(ai_service).to have_received(:process_message)
      end
    end

    context "when the AI provider is temporarily unavailable" do
      it "returns a helpful fallback response and stores it in the conversation" do
        allow(ai_service).to receive(:process_message)
          .and_raise(AiService::Error, "Response generation failed: the server responded with status 529")

        result = service.handle_incoming(
          from: "+27655555555",
          message: "I want to book an appointment"
        )

        expect(result[:intent]).to eq("book")
        expect(result[:response]).to include("preferred day and time")

        patient = Patient.find_by(phone: "+27655555555")
        conversation = patient.conversations.order(:created_at).last

        expect(conversation.messages.length).to eq(2)
        expect(conversation.messages.first["role"]).to eq("user")
        expect(conversation.messages.last["role"]).to eq("assistant")
        expect(conversation.messages.last["content"]).to include("preferred day and time")
      end

      it "answers office hours locally when AI is unavailable" do
        allow(ai_service).to receive(:process_message)
          .and_raise(AiService::Error, "Intent classification failed: the server responded with status 529")

        result = service.handle_incoming(
          from: "+27655555556",
          message: "What are your hours?"
        )

        expect(result[:intent]).to eq("faq")
        expect(result[:response]).to include(AiService::FAQ["hours"])
      end

      it "answers pricing locally when AI is unavailable" do
        allow(ai_service).to receive(:process_message)
          .and_raise(AiService::Error, "Intent classification failed: the server responded with status 529")

        result = service.handle_incoming(
          from: "+27655555557",
          message: "How much is a consultation?"
        )

        expect(result[:intent]).to eq("faq")
        expect(result[:response]).to include(AiService::PRICING["consultation"])
      end
    end
  end
end
