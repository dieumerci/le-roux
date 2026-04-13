class CreateCallLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :call_logs do |t|
      t.string :twilio_call_sid
      t.string :caller_number
      t.string :intent
      t.integer :duration
      t.string :status
      t.text :transcript
      t.text :ai_response
      t.references :patient, null: true, foreign_key: true

      t.timestamps
    end

    add_index :call_logs, :twilio_call_sid, unique: true
    add_index :call_logs, :caller_number
  end
end
