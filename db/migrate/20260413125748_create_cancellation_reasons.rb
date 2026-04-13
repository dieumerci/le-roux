class CreateCancellationReasons < ActiveRecord::Migration[8.1]
  def change
    create_table :cancellation_reasons do |t|
      t.references :appointment, null: false, foreign_key: true
      t.string :reason_category, null: false
      t.text :details

      t.timestamps
    end

    add_index :cancellation_reasons, :reason_category
  end
end
