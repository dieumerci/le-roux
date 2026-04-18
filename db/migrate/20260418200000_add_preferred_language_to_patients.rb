class AddPreferredLanguageToPatients < ActiveRecord::Migration[8.1]
  def change
    add_column :patients, :preferred_language, :string, limit: 5
    add_index :patients, :preferred_language
  end
end
