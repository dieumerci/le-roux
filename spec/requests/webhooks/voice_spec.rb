require "rails_helper"

RSpec.describe "Webhooks::Voice", type: :request do
  let(:voice_service) { instance_double(VoiceService) }

  before do
    allow(VoiceService).to receive(:new).and_return(voice_service)
  end

  let(:base_params) do
    {
      "CallSid"    => "CA_test_123",
      "From"       => "+27821234567",
      "To"         => "+27111234567",
      "CallStatus" => "ringing"
    }
  end

  # ── Incoming ──────────────────────────────────────────────────────────

  describe "POST /webhooks/voice" do
    let(:greeting_twiml) do
      Twilio::TwiML::VoiceResponse.new { |r| r.say(message: "Hello") }.to_xml
    end

    before do
      allow(voice_service).to receive(:handle_incoming).and_return(greeting_twiml)
    end

    it "returns 200 with TwiML content" do
      post "/webhooks/voice", params: base_params

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/xml")
      expect(response.body).to include("<Response>")
    end

    it "delegates to VoiceService with call_sid and caller" do
      post "/webhooks/voice", params: base_params

      expect(voice_service).to have_received(:handle_incoming).with(
        call_sid: "CA_test_123",
        caller:   "+27821234567"
      )
    end

    context "when an error occurs" do
      before { allow(voice_service).to receive(:handle_incoming).and_raise(StandardError, "boom") }

      it "returns error TwiML and does not raise" do
        post "/webhooks/voice", params: base_params

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("<Response>")
        expect(response.body).to include("technical issue")
      end
    end
  end

  # ── Gather ────────────────────────────────────────────────────────────

  describe "POST /webhooks/voice/gather" do
    let(:response_twiml) do
      Twilio::TwiML::VoiceResponse.new { |r| r.say(message: "Booking response") }.to_xml
    end

    before do
      allow(voice_service).to receive(:handle_gather).and_return(response_twiml)
    end

    let(:gather_params) do
      base_params.merge(
        "SpeechResult" => "I want to book an appointment",
        "Confidence"   => "0.9"
      )
    end

    it "returns 200 with TwiML content" do
      post "/webhooks/voice/gather", params: gather_params

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/xml")
    end

    it "delegates to VoiceService with speech and confidence" do
      post "/webhooks/voice/gather", params: gather_params

      expect(voice_service).to have_received(:handle_gather).with(
        call_sid:      "CA_test_123",
        speech_result: "I want to book an appointment",
        confidence:    0.9
      )
    end

    context "when an error occurs" do
      before { allow(voice_service).to receive(:handle_gather).and_raise(StandardError, "boom") }

      it "returns error TwiML" do
        post "/webhooks/voice/gather", params: gather_params

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("something went wrong")
      end
    end
  end

  # ── Status ────────────────────────────────────────────────────────────

  describe "POST /webhooks/voice/status" do
    before do
      allow(voice_service).to receive(:handle_status)
    end

    it "returns 200" do
      post "/webhooks/voice/status", params: base_params.merge("CallStatus" => "completed", "CallDuration" => "45")

      expect(response).to have_http_status(:ok)
    end

    it "delegates to VoiceService" do
      post "/webhooks/voice/status", params: base_params.merge("CallStatus" => "completed", "CallDuration" => "45")

      expect(voice_service).to have_received(:handle_status).with(
        call_sid:    "CA_test_123",
        call_status: "completed",
        duration:    45
      )
    end

    context "when an error occurs" do
      before { allow(voice_service).to receive(:handle_status).and_raise(StandardError) }

      it "still returns 200 (status callbacks must not fail)" do
        post "/webhooks/voice/status", params: base_params

        expect(response).to have_http_status(:ok)
      end
    end
  end

  # ── Confirmation ──────────────────────────────────────────────────────

  describe "POST /webhooks/voice/confirmation" do
    let(:appointment) { create(:appointment) }
    let(:confirmation_twiml) do
      Twilio::TwiML::VoiceResponse.new { |r| r.say(message: "Reminder") }.to_xml
    end

    before do
      allow(voice_service).to receive(:confirmation_twiml).and_return(confirmation_twiml)
    end

    it "returns TwiML for a valid appointment" do
      post "/webhooks/voice/confirmation",
           params: base_params.merge(appointment_id: appointment.id)

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/xml")
    end

    it "passes the appointment to VoiceService" do
      post "/webhooks/voice/confirmation",
           params: base_params.merge(appointment_id: appointment.id)

      expect(voice_service).to have_received(:confirmation_twiml).with(appointment)
    end

    it "passes nil to VoiceService when appointment is not found" do
      post "/webhooks/voice/confirmation",
           params: base_params.merge(appointment_id: 999999)

      expect(voice_service).to have_received(:confirmation_twiml).with(nil)
    end
  end

  # ── Confirmation gather ───────────────────────────────────────────────

  describe "POST /webhooks/voice/confirmation_gather" do
    let(:appointment) { create(:appointment) }
    let(:result_twiml) do
      Twilio::TwiML::VoiceResponse.new { |r| r.say(message: "Confirmed") }.to_xml
    end

    before do
      allow(voice_service).to receive(:handle_confirmation_gather).and_return(result_twiml)
    end

    it "returns TwiML" do
      post "/webhooks/voice/confirmation_gather",
           params: base_params.merge(appointment_id: appointment.id, "Digits" => "1")

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/xml")
    end

    it "delegates to VoiceService with digits and appointment_id" do
      post "/webhooks/voice/confirmation_gather",
           params: base_params.merge(appointment_id: appointment.id, "Digits" => "1")

      expect(voice_service).to have_received(:handle_confirmation_gather).with(
        call_sid:       "CA_test_123",
        digits:         "1",
        appointment_id: appointment.id.to_s
      )
    end
  end
end
