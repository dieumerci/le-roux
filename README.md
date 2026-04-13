# Dr Le Roux AI Receptionist

An AI-powered phone receptionist for Dr Le Roux's medical practice. Built with Rails 8 (API-only), Twilio, Google Calendar, and Claude AI.

## What It Does

Patients call the practice phone number. The AI receptionist answers, understands their request using natural language processing, and handles:

- **Book appointments** — checks doctor availability on Google Calendar and books a slot
- **Reschedule appointments** — finds existing booking and moves it to a new time
- **Cancel appointments** — locates and removes the appointment
- **Answer FAQs** — office hours, location, services offered
- **Route urgent calls** — transfers to the doctor or on-call staff when needed

## Tech Stack

| Component | Technology |
|---|---|
| Framework | Rails 8.1.3 (API-only) |
| Ruby | 3.3.2 |
| Database | PostgreSQL |
| Voice/SMS | Twilio (`twilio-ruby`) |
| Calendar | Google Calendar API (`google-apis-calendar_v3`) |
| AI/NLU | Claude API (`anthropic` gem) |
| Background Jobs | Solid Queue (Rails 8 default) |
| Deployment | Kamal (Docker) |

## Prerequisites

- Ruby 3.3.2
- PostgreSQL
- Twilio account (with a phone number)
- Google Cloud project with Calendar API enabled
- Google service account JSON key file
- Anthropic API key (Claude)

## Setup

```bash
# Clone the repo
git clone https://github.com/your-username/dr-leroux-receptionist.git
cd dr-leroux-receptionist

# Install dependencies
bundle install

# Setup database
rails db:create db:migrate

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
```

## Environment Variables

Create a `.env` file in the project root with:

```env
# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Calendar
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_FILE=path/to/service-account.json

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=your_api_key

# Rails
RAILS_ENV=development
DATABASE_URL=postgres://localhost/dr_leroux_receptionist_development
```

## Running the App

```bash
# Start the server
bin/rails server

# For Twilio webhooks in development, use ngrok:
ngrok http 3000
# Then configure your Twilio phone number webhook to: https://your-ngrok-url.ngrok.io/twilio/voice
```

## Testing

```bash
bundle exec rspec
```

## Architecture

```
Incoming Call (Twilio)
  → POST /twilio/voice (webhook)
    → TwilioController gathers speech input
      → AI Service (Claude) interprets intent
        → Calendar Service checks/books/cancels on Google Calendar
          → TwiML response speaks result back to caller
```

## Project Roadmap

See [ROADMAP.md](ROADMAP.md) for the full development plan with phases and checklist.

## License

Private — All rights reserved.
