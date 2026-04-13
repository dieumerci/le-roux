class CreateConfirmationLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :confirmation_logs do |t|
      t.references :appointment, null: false, foreign_key: true
      t.string :method, null: false
      t.string :outcome
      t.integer :attempts, default: 0, null: false
      t.boolean :flagged, default: false, null: false
      t.text :notes

      t.timestamps
    end

    add_index :confirmation_logs, :outcome
    add_index :confirmation_logs, :flagged
  end
end
