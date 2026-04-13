FactoryBot.define do
  factory :patient do
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    sequence(:phone) { |n| "+2761000#{n.to_s.rjust(4, '0')}" }
    email { Faker::Internet.email }
    date_of_birth { Faker::Date.birthday(min_age: 18, max_age: 80) }
    notes { nil }
  end
end
