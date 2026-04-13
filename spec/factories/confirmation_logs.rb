FactoryBot.define do
  factory :confirmation_log do
    appointment
    add_attribute(:method) { "voice" }
    outcome { "confirmed" }
    attempts { 1 }
    flagged { false }

    trait :flagged do
      outcome { "no_answer" }
      flagged { true }
    end

    trait :whatsapp do
      add_attribute(:method) { "whatsapp" }
    end
  end
end
