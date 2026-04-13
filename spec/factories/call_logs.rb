FactoryBot.define do
  factory :call_log do
    sequence(:twilio_call_sid) { |n| "CA#{SecureRandom.hex(16)}" }
    sequence(:caller_number) { |n| "+2761000#{n.to_s.rjust(4, '0')}" }
    intent { "book_appointment" }
    duration { rand(30..300) }
    status { "completed" }
    transcript { "I'd like to book an appointment" }
    ai_response { "Sure, I can help you with that." }
    patient { nil }

    trait :with_patient do
      patient
    end
  end
end
