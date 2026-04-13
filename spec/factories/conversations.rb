FactoryBot.define do
  factory :conversation do
    patient
    channel { "whatsapp" }
    status { "active" }
    messages { [] }
    started_at { Time.current }

    trait :closed do
      status { "closed" }
      ended_at { Time.current }
    end

    trait :voice do
      channel { "voice" }
    end
  end
end
