class CreatePracticeSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :practice_settings do |t|
      t.string :name,               null: false, default: "Dr Chalita le Roux Inc"
      t.string :phone
      t.string :email
      t.string :address_line1
      t.string :address_line2
      t.string :city
      t.string :map_link
      t.string :emergency_phone
      t.string :price_consultation
      t.string :price_check_up
      t.string :price_cleaning

      t.timestamps
    end
  end
end
