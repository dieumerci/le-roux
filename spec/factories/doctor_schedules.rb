FactoryBot.define do
  factory :doctor_schedule do
    sequence(:day_of_week) { |n| n % 7 }
    start_time { Time.parse("08:00") }
    end_time { Time.parse("17:00") }
    break_start { Time.parse("12:00") }
    break_end { Time.parse("13:00") }
    active { true }

    trait :saturday do
      day_of_week { 6 }
      start_time { Time.parse("08:00") }
      end_time { Time.parse("12:00") }
      break_start { nil }
      break_end { nil }
    end

    trait :closed do
      active { false }
      start_time { nil }
      end_time { nil }
      break_start { nil }
      break_end { nil }
    end
  end
end
