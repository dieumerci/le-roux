class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAILER_FROM_ADDRESS", "reception@drchalitaleroux.co.za")
  layout "mailer"
end
