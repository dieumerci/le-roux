require "rails_helper"

RSpec.describe "Webhooks::Whatsapp", type: :request do
  let(:ai_service) { double("AiService") }

  before do
    allow(AiService).to receive(:new).and_return(ai_service)
    allow(ai_service).to receive(:process_message).and_return({
      response: "Hi! How can I help you today?",
      intent: "other",
      entities: {}
    })

    # Stub template service to not require Twilio creds
    allow(WhatsappTemplateService).to receive(:new).and_raise(StandardError)
  end

  describe "POST /webhooks/whatsapp" do
    let(:valid_params) do
      {
        "From" => "whatsapp:+27612345678",
        "Body" => "Hello, I want to book",
        "To" => "whatsapp:+14155238886",
        "MessageSid" => "SM_test_123"
      }
    end

    it "returns 200 with empty TwiML response" do
      post "/webhooks/whatsapp", params: valid_params

      expect(response).to have_http_status(:ok)
      expect(response.content_type).to include("text/xml")
      expect(response.body).to include("<Response")
      # Response is empty TwiML — actual reply sent async via job
      expect(response.body).not_to include("<Message>")
    end

    it "enqueues a WhatsappReplyJob" do
      expect {
        post "/webhooks/whatsapp", params: valid_params
      }.to have_enqueued_job(WhatsappReplyJob)
    end

    it "returns bad request when From is missing" do
      post "/webhooks/whatsapp", params: { "Body" => "Hello" }
      expect(response).to have_http_status(:bad_request)
    end

    it "returns bad request when Body is missing" do
      post "/webhooks/whatsapp", params: { "From" => "whatsapp:+27612345678" }
      expect(response).to have_http_status(:bad_request)
    end

    it "handles button payload from quick replies" do
      params = valid_params.merge("ButtonPayload" => "confirm", "Body" => "")
      post "/webhooks/whatsapp", params: params

      expect(response).to have_http_status(:ok)
    end

    context "when an error occurs" do
      before do
        allow(WhatsappReplyJob).to receive(:perform_later).and_raise(StandardError, "Something broke")
      end

      it "still returns 200 with empty TwiML" do
        post "/webhooks/whatsapp", params: valid_params

        expect(response).to have_http_status(:ok)
        expect(response.body).to include("<Response")
      end
    end
  end
end
