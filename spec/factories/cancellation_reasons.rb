FactoryBot.define do
  factory :cancellation_reason do
    appointment
    reason_category { "cost" }
    details { "Too expensive right now" }
  end
end
