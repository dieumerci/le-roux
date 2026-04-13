class CreateConversations < ActiveRecord::Migration[8.1]
  def change
    create_table :conversations do |t|
      t.string :channel, null: false
      t.references :patient, null: false, foreign_key: true
      t.string :status, default: "active", null: false
      t.jsonb :messages, default: []
      t.datetime :started_at
      t.datetime :ended_at

      t.timestamps
    end

    add_index :conversations, :channel
    add_index :conversations, :status
  end
end
