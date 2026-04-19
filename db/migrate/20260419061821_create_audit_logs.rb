class CreateAuditLogs < ActiveRecord::Migration[8.1]
  def change
    create_table :audit_logs do |t|
      t.string  :action,        null: false
      t.string  :resource_type
      t.bigint  :resource_id
      t.string  :summary,       null: false
      t.jsonb   :details,       default: {}
      t.string  :performed_by
      t.string  :ip_address

      t.timestamps
    end

    add_index :audit_logs, :action
    add_index :audit_logs, [ :resource_type, :resource_id ]
    add_index :audit_logs, :created_at
    add_index :audit_logs, :performed_by
  end
end
