class CreateAppointments < ActiveRecord::Migration[8.1]
  def change
    create_table :appointments do |t|
      t.references :patient, null: false, foreign_key: true
      t.datetime :start_time, null: false
      t.datetime :end_time, null: false
      t.integer :status, null: false, default: 0
      t.string :google_event_id
      t.string :reason
      t.text :notes

      t.timestamps
    end

    add_index :appointments, :google_event_id, unique: true
    add_index :appointments, :start_time
    add_index :appointments, :status
  end
end
