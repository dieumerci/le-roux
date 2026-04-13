class CreateDoctorSchedules < ActiveRecord::Migration[8.1]
  def change
    create_table :doctor_schedules do |t|
      t.integer :day_of_week
      t.time :start_time
      t.time :end_time
      t.time :break_start
      t.time :break_end
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :doctor_schedules, :day_of_week, unique: true
  end
end
