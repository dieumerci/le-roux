# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_13_082833) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "appointments", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "end_time", null: false
    t.string "google_event_id"
    t.text "notes"
    t.bigint "patient_id", null: false
    t.string "reason"
    t.datetime "start_time", null: false
    t.integer "status", default: 0, null: false
    t.datetime "updated_at", null: false
    t.index ["google_event_id"], name: "index_appointments_on_google_event_id", unique: true
    t.index ["patient_id"], name: "index_appointments_on_patient_id"
    t.index ["start_time"], name: "index_appointments_on_start_time"
    t.index ["status"], name: "index_appointments_on_status"
  end

  create_table "call_logs", force: :cascade do |t|
    t.text "ai_response"
    t.string "caller_number"
    t.datetime "created_at", null: false
    t.integer "duration"
    t.string "intent"
    t.bigint "patient_id"
    t.string "status"
    t.text "transcript"
    t.string "twilio_call_sid"
    t.datetime "updated_at", null: false
    t.index ["caller_number"], name: "index_call_logs_on_caller_number"
    t.index ["patient_id"], name: "index_call_logs_on_patient_id"
    t.index ["twilio_call_sid"], name: "index_call_logs_on_twilio_call_sid", unique: true
  end

  create_table "doctor_schedules", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.time "break_end"
    t.time "break_start"
    t.datetime "created_at", null: false
    t.integer "day_of_week"
    t.time "end_time"
    t.time "start_time"
    t.datetime "updated_at", null: false
    t.index ["day_of_week"], name: "index_doctor_schedules_on_day_of_week", unique: true
  end

  create_table "patients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date_of_birth"
    t.string "email"
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.text "notes"
    t.string "phone", null: false
    t.datetime "updated_at", null: false
    t.index ["last_name", "first_name"], name: "index_patients_on_last_name_and_first_name"
    t.index ["phone"], name: "index_patients_on_phone", unique: true
  end

  add_foreign_key "appointments", "patients"
  add_foreign_key "call_logs", "patients"
end
