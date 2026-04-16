class AddTagsToConversations < ActiveRecord::Migration[8.0]
  def change
    add_column :conversations, :tags, :jsonb, default: [], null: false
  end
end
