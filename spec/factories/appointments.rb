FactoryBot.define do
  factory :appointment do
    patient
    start_time { 1.day.from_now.change(hour: 10, min: 0) }
    end_time { 1.day.from_now.change(hour: 10, min: 30) }
    status { :scheduled }
    reason { "General consultation" }
    notes { nil }

    trait :confirmed do
      status { :confirmed }
    end

    trait :cancelled do
      status { :cancelled }
    end

    trait :with_google_event do
      sequence(:google_event_id) { |n| "google_event_#{n}" }
    end
  end
end
