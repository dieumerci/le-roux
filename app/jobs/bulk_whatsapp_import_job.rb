class BulkWhatsappImportJob < ApplicationJob
  queue_as :default

  # Files are saved to tmp/imports/ by the controller then cleaned up here.
  # owner_name and patient_phone are passed through for TXT parsing.
  def perform(file_path:, original_filename:, owner_name: nil, patient_phone: nil)
    unless File.exist?(file_path)
      Rails.logger.error("[BulkImport] File not found: #{file_path}")
      create_notification("Import failed", "Import file not found. Please try uploading again.", level: "danger")
      return
    end

    ext = File.extname(original_filename).downcase

    result = if ext == ".zip"
      # Re-wrap the file path as a simple IO-like object the import service accepts
      import_zip_from_path(file_path, owner_name: owner_name, patient_phone: patient_phone)
    else
      WhatsappImportService.import_file(
        file_path,
        owner_name: owner_name,
        patient_phone: patient_phone
      )
    end

    summary = "#{result.created} created, #{result.updated} updated"
    summary += ", #{result.skipped} skipped" if result.skipped.positive?
    summary += " — #{result.errors.size} error(s)" if result.errors.any?

    create_notification(
      "Import complete — #{original_filename}",
      summary,
      level: result.errors.any? ? "warning" : "success"
    )

    Rails.logger.info("[BulkImport] #{original_filename}: #{summary}")
  rescue WhatsappImportService::ImportError => e
    Rails.logger.error("[BulkImport] Import failed for #{original_filename}: #{e.message}")
    create_notification("Import failed — #{original_filename}", e.message, level: "danger")
  rescue StandardError => e
    Rails.logger.error("[BulkImport] Unexpected error for #{original_filename}: #{e.class}: #{e.message}")
    create_notification("Import error — #{original_filename}", "An unexpected error occurred. Check logs for details.", level: "danger")
    raise
  ensure
    FileUtils.rm_f(file_path) if file_path.present?
  end

  private

  def import_zip_from_path(file_path, owner_name:, patient_phone:)
    file_io = File.open(file_path, "rb")
    file_io.define_singleton_method(:original_filename) { File.basename(file_path) }

    WhatsappImportService.import_zip(file_io, owner_name: owner_name, patient_phone: patient_phone)
  ensure
    file_io&.close
  end

  def create_notification(title, body, level: "info")
    Notification.create!(
      category: "system",
      level:    level,
      title:    title,
      body:     body
    )
  rescue StandardError => e
    Rails.logger.warn("[BulkImport] Could not create notification: #{e.message}")
  end
end
