class ApplicationJob < ActiveJob::Base
  retry_on ActiveRecord::Deadlocked, wait: 5.seconds, attempts: 3
  retry_on ActiveRecord::StatementInvalid, wait: 10.seconds, attempts: 2
  discard_on ActiveJob::DeserializationError

  rescue_from StandardError do |e|
    Rails.logger.error(
      "[#{self.class.name}] Unhandled error: #{e.class}: #{e.message}\n" \
      "#{e.backtrace&.first(5)&.join("\n")}"
    )
    raise
  end
end
