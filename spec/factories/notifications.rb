FactoryBot.define do
  factory :notification do
    category { "system" }
    level    { "info" }
    title    { "Test notification" }
    body     { "Something happened" }
    url      { "/dashboard" }

    trait :unread do
      read_at { nil }
    end

    trait :read do
      read_at { Time.current }
    end
  end
end
