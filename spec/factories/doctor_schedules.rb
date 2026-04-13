FactoryBot.define do
  factory :doctor_schedule do
    sequence(:day_of_week) { |n| n % 7 }
    start_time { Tod::TimeOfDay.new(8, 0) rescue "08:00" }
    end_time { Tod::TimeOfDay.new(17, 0) rescue "17:00" }
    break_start { Tod::TimeOfDay.new(12, 0) rescue "12:00" }
    break_end { Tod::TimeOfDay.new(13, 0) rescue "13:00" }
    active { true }

    trait :saturday do
      day_of_week { 6 }
      start_time { Tod::TimeOfDay.new(8, 0) rescue "08:00" }
      end_time { Tod::TimeOfDay.new(12, 0) rescue "12:00" }
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
