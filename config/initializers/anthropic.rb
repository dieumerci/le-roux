Anthropic.configure do |config|
  config.access_token = ENV.fetch("ANTHROPIC_API_KEY", "")
  config.request_timeout = 2
end
