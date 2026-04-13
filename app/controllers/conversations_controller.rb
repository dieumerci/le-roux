class ConversationsController < ApplicationController
  def index
    conversations = Conversation.includes(:patient).order(updated_at: :desc)
    conversations = conversations.by_channel(params[:channel]) if params[:channel].present?
    conversations = conversations.where(status: params[:status]) if params[:status].present?

    render inertia: "Conversations", props: {
      conversations: conversations.limit(50).map { |c| conversation_props(c) },
      filters: { channel: params[:channel], status: params[:status] }
    }
  end

  def show
    conversation = Conversation.includes(:patient).find(params[:id])

    render inertia: "ConversationShow", props: {
      conversation: detailed_conversation_props(conversation)
    }
  end

  private

  def conversation_props(conversation)
    {
      id: conversation.id,
      patient_name: conversation.patient.full_name,
      patient_phone: conversation.patient.phone,
      channel: conversation.channel,
      status: conversation.status,
      message_count: conversation.messages&.length || 0,
      last_message: conversation.messages&.last&.dig("content")&.truncate(80),
      started_at: conversation.started_at&.iso8601,
      updated_at: conversation.updated_at.iso8601
    }
  end

  def detailed_conversation_props(conversation)
    {
      id: conversation.id,
      patient_name: conversation.patient.full_name,
      patient_phone: conversation.patient.phone,
      patient_id: conversation.patient_id,
      channel: conversation.channel,
      status: conversation.status,
      messages: conversation.messages || [],
      started_at: conversation.started_at&.iso8601,
      ended_at: conversation.ended_at&.iso8601
    }
  end
end
