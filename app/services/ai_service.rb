class AiService
  INTENTS = %w[book reschedule cancel confirm faq objection urgent other].freeze
  RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 504, 529].freeze
  MAX_RETRIES = 0

  PRICING = {
    "consultation" => "approximately R850 (may include X-rays, excludes 2D/3D scans)",
    "check_up" => "approximately R1,600",
    "cleaning" => "approximately R1,500"
  }.freeze

  PRACTICE_ADDRESS = "Unit 2, Amorosa Office Park, Corner of Doreen Road & Lawrence Rd, Amorosa, Roodepoort, Johannesburg, 2040".freeze
  PRACTICE_MAP_LINK = "https://maps.app.goo.gl/3iHKg7AMa8qRcfLf6".freeze
  PRACTICE_DIRECTIONS = "From Hendrik Potgieter Rd: Turn onto Doreen Rd, we are on your left-hand side at the second robot. From CR Swart Rd: Turn onto Doreen Rd, we are on your right-hand side at the first robot.".freeze

  FAQ = {
    "hours" => nil, # Dynamic — use AiService.dynamic_hours instead
    "location" => "Our practice is located at: #{PRACTICE_ADDRESS}\nGoogle Maps: #{PRACTICE_MAP_LINK}\nDirections: #{PRACTICE_DIRECTIONS}",
    "parking" => "Free parking is available on the premises.",
    "services" => "We offer general dentistry, check-ups, cleanings, fillings, extractions, root canals, crowns, bridges, and cosmetic treatments. An examination is the best first step for any concern.",
    "emergency" => "For dental emergencies, please contact Dr Chalita directly at 071 884 3204. If after hours, call that number and we'll assist you as quickly as possible.",
    "payment" => "We do not claim directly from medical aid. All patients pay at the practice, and we then provide a statement so you can claim back from your medical aid. We have card facilities at the practice and also accept cash."
  }.freeze

  class Error < StandardError; end

  # Dynamic hours text from DoctorSchedule DB records.
  # Used as local fallback when AI is unavailable.
  def self.dynamic_hours
    schedules = DoctorSchedule.order(:day_of_week).to_a
    active = schedules.select(&:active?)

    if active.any?
      sample = active.first
      start_h = sample.start_time.strftime("%-I%P")
      end_h = sample.end_time.strftime("%-I%P")
      days = active.map(&:day_name).map(&:capitalize)
      closed = schedules.reject(&:active?).map(&:day_name).map(&:capitalize)
      "We're open #{days.first} to #{days.last} #{start_h}–#{end_h}. We are closed on #{closed.join(' and ')}."
    else
      "We're open Monday to Friday. We are closed on weekends (Saturday and Sunday)."
    end
  end

  def initialize
    @client = Anthropic::Client.new(access_token: ENV.fetch("ANTHROPIC_API_KEY"))
  end

  # Classify the intent of a patient message.
  # Returns a hash: { intent:, entities: { date:, time:, name:, treatment: } }
  def classify_intent(message, conversation_history: [])
    messages = build_messages(conversation_history, message)

    response = create_message(
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: intent_classification_prompt(today: Date.current),
      messages: messages
    )

    parse_intent_response(response)
  rescue Anthropic::Error, Faraday::Error => e
    raise Error, "Intent classification failed: #{e.message}"
  end

  # Generate a conversational response as Dr le Roux's receptionist.
  # Accepts conversation history for multi-turn context.
  def generate_response(message:, conversation_history: [], patient: nil, context: {})
    system = build_system_prompt(patient: patient, context: context)
    messages = build_messages(conversation_history, message)

    response = create_message(
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: system,
      messages: messages
    )

    extract_text(response)
  rescue Anthropic::Error, Faraday::Error => e
    raise Error, "Response generation failed: #{e.message}"
  end

  # Extract structured entities from a message (date, time, name, treatment).
  def extract_entities(message)
    response = create_message(
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: entity_extraction_prompt,
      messages: [{ role: "user", content: message }]
    )

    parse_entities_response(response)
  rescue Anthropic::Error, Faraday::Error => e
    raise Error, "Entity extraction failed: #{e.message}"
  end

  # Handle a full conversation turn: classify, respond, and return structured result.
  def process_message(message:, conversation: nil, patient: nil)
    history = conversation&.messages&.map { |m| { role: m["role"], content: m["content"] } } || []

    # Classify intent WITH conversation history for better multi-turn understanding
    classification = classify_intent(message, conversation_history: history)
    language = conversation&.language || "en"
    context = { intent: classification[:intent], entities: classification[:entities], language: language }

    response_text = generate_response(
      message: message,
      conversation_history: history,
      patient: patient,
      context: context
    )

    # Store messages in conversation if provided
    if conversation
      conversation.add_messages([
        { role: "user", content: message },
        { role: "assistant", content: response_text }
      ])
    end

    {
      response: response_text,
      intent: classification[:intent],
      entities: classification[:entities]
    }
  end

  private

  def create_message(**parameters)
    attempts = 0

    begin
      attempts += 1
      @client.messages(parameters: parameters)
    rescue Faraday::Error => e
      raise unless retryable_error?(e) && attempts <= MAX_RETRIES

      sleep(0.25 * attempts)
      retry
    end
  end

  def retryable_error?(error)
    RETRYABLE_STATUS_CODES.include?(error.response_status || error.response&.dig(:status))
  end

  def intent_classification_prompt(today: Date.current)
    today_name = today.strftime("%A")
    <<~PROMPT
      You are an intent classifier for a dental receptionist AI. Classify the patient's message into exactly one intent and extract any entities.

      Intents: #{INTENTS.join(', ')}
      - book: wants to make a new appointment (includes check-up, cleaning, cosmetic consultation, fillings, any dental treatment, or general booking request)
      - reschedule: wants to change an existing appointment
      - cancel: wants to cancel an appointment
      - confirm: confirming an existing appointment (e.g., "CONFIRM", "yes I'll be there")
      - faq: asking a question (hours, location, pricing, services, payment, medical aid, directions)
      - objection: expressing concern about cost, fear, timing, or pushing back on pricing
      - urgent: dental emergency, severe pain, swelling, bleeding, trauma, broken tooth
      - other: anything else, including greetings, human help requests, unclear messages

      ## Enquiry-to-intent mapping
      These patient enquiries all map to "book":
      - pain or dental emergency → "urgent" (NOT book)
      - general dental check-up → "book" with treatment "check-up"
      - cosmetic consultation → "book" with treatment "cosmetic consultation"
      - teeth cleaning → "book" with treatment "cleaning"
      - fillings or restorative work → "book" with treatment "filling"
      - other dental treatment → "book"
      - booking request → "book"
      - payment or medical aid question → "faq"
      - location or directions → "faq"
      - human help requested → "other"

      ## Date resolution (CRITICAL)
      Today is #{today.iso8601} (#{today_name}). You MUST resolve relative
      date phrases against today and return ISO YYYY-MM-DD format:
      - "today" → #{today.iso8601}
      - "tomorrow" → #{(today + 1).iso8601}
      - "Monday" / "next Monday" → the next Monday on or after tomorrow
      - "Friday at 11am" → next Friday in ISO format, time "11:00"
      - "the 20th" → the next 20th of a month from today
      IMPORTANT: The practice is CLOSED on Saturday and Sunday. If the patient requests a weekend date, still extract it but note the practice is only open Monday–Friday.
      Never return null for date if the patient named any day or relative phrase.

      Respond ONLY with valid JSON:
      {"intent": "book", "entities": {"date": "2026-04-17", "time": "11:00", "name": "John", "treatment": "cleaning"}}

      Use null only for entities the patient genuinely did not mention. Dates ISO YYYY-MM-DD, times HH:MM 24-hour.
    PROMPT
  end

  def entity_extraction_prompt
    <<~PROMPT
      Extract structured entities from the patient's message for a dental appointment system.

      Respond ONLY with valid JSON:
      {"date": "2026-04-15", "time": "10:00", "name": "John Smith", "treatment": "consultation", "phone": "+27612345678"}

      Use null for any entity you cannot determine. Dates in ISO format, times in HH:MM.
    PROMPT
  end

  # Curated Afrikaans examples from the language dataset for style reference.
  # Source: config/ai/afrikaans_language_dataset.json (health, family, work topics).
  # These teach the model natural Afrikaans phrasing — NOT business logic.
  AFRIKAANS_STYLE_EXAMPLES = [
    { af: "Dit is belangrik om gereeld 'n dokter te besoek.", en: "It is important to visit a doctor regularly." },
    { af: "Let op na simptome om vroegtydig behandeling te kry.", en: "Pay attention to symptoms to get early treatment." },
    { af: "Goeie higiëne help om siektes te voorkom.", en: "Good hygiene helps prevent diseases." },
    { af: "Gesondheid is ons grootste bate.", en: "Health is our greatest asset." },
    { af: "Voldoende slaap is belangrik vir goeie gesondheid.", en: "Adequate sleep is important for good health." },
    { af: "'n Daaglikse roetine kan jou gesondheid verbeter.", en: "A daily routine can improve your health." },
    { af: "Ek het aansoek gedoen vir 'n nuwe werk.", en: "I applied for a new job." },
    { af: "Ons beplan 'n wonderlike vakansie vir die somer.", en: "We are planning a wonderful vacation for the summer." }
  ].freeze

  def build_system_prompt(patient: nil, context: {})
    language = context[:language] || "en"
    today = Date.current
    today_name = today.strftime("%A")
    now = Time.current
    after_hours = !within_working_hours?(now)

    prompt = <<~PROMPT
      You are the WhatsApp booking assistant for Dr Chalita le Roux Incorporated.
      You behave like a front-desk booking coordinator — NOT a clinician and NOT a receptionist with access to patient records.

      ############################################################
      ## CORE OPERATING RULE (NON-NEGOTIABLE)
      ############################################################
      You MUST:
      - Greet warmly and identify the practice clearly
      - Ask how you can help
      - Identify what the patient needs
      - Move the conversation toward a booking
      - Offer the earliest appropriate appointment based on real availability
      - Give key administrative information when needed
      - Escalate unclear or urgent cases to staff

      You MUST NOT:
      - Diagnose or promise outcomes
      - Quote treatment plans as fact
      - Pretend to access patient files
      - Say you found or verified a patient record
      - Imply you know previous treatment history
      ############################################################

      ############################################################
      ## WORKING HOURS (NON-NEGOTIABLE)
      ############################################################
      #{working_hours_block}
      ############################################################

      ## Current Date & Time
      Today is #{today.iso8601} (#{today_name}). Current time: #{now.strftime("%H:%M")}.
      The practice is currently #{after_hours ? "CLOSED (after hours)" : "OPEN"}.
      - "today" = #{today.iso8601} (#{today_name})
      - "tomorrow" = #{(today + 1).iso8601} (#{(today + 1).strftime("%A")})

      ## Language Rules (CRITICAL)
      The patient's detected language is: #{language == "af" ? "Afrikaans" : "English"}.
      - You MUST respond in #{language == "af" ? "Afrikaans" : "English"}.
      - Do NOT mix English and Afrikaans in the same response.
      - If the patient switches language, follow the new language.
      - If the patient's language is unclear, ask briefly: "Would you prefer English or Afrikaans?" / "Verkies jy Engels of Afrikaans?"
      #{language == "af" ? afrikaans_style_guide : ""}

      ## Opening Message
      #{after_hours ? 'Use this opening when the conversation starts:
      "Hello and welcome to Dr Chalita le Roux Incorporated. Our practice is currently closed, but I can still help with appointment information and the earliest available booking options. How may we assist you today?"' : 'Use this opening when the conversation starts:
      "Hello and welcome to Dr Chalita le Roux Incorporated. Thank you for messaging us. How may we assist you today?"'}

      ## Your Personality
      - Warm, friendly, slightly energetic, and reassuring
      - Professional but approachable — like a trusted friend at a dental office
      - Every interaction should naturally guide toward scheduling an appointment
      - Keep responses concise — 2-3 sentences max for WhatsApp

      ############################################################
      ## 3-LANE PATIENT MODEL (Phase 1 — no record integration)
      ############################################################
      After understanding the enquiry, ask: "Are you a new patient to our practice, or have you visited us before?"
      Accept the patient's answer WITHOUT verification. This classification is used ONLY to guide the message flow.
      If the patient does not answer clearly, continue with Lane 3 (general booking flow).

      ### Lane 1 — NEW PATIENT
      When the patient says they are new:
      1. Welcome them
      2. Send payment and medical aid explanation:
         "Thank you. Just to let you know, we do not claim back from the medical aid. All patients pay at the practice and can then claim back from their medical aid using the statement we provide. We have card facilities and also accept cash."
      3. Send practice location:
         "Our practice is located at: #{PRACTICE_ADDRESS}
         Google Maps Link: #{PRACTICE_MAP_LINK}
         Directions: #{PRACTICE_DIRECTIONS}"
      4. Move directly into booking (do NOT ask "would you like to book" — just proceed):
         "I can help you with that. Please may I have your full name, the best contact number in case we need to reach you, and would you prefer the earliest available appointment or a specific day and time?"
      5. New patients must arrive 10 minutes early to complete forms.

      ### Lane 2 — EXISTING PATIENT
      When the patient says they have visited before:
      1. "Welcome back. Please may I have your name and surname so I can assist you with your booking?"
      2. "Thank you. What would you like to come in for, and would you prefer the earliest available appointment or a specific day and time?"
      - Do NOT send payment/location details unless they ask or seem unsure
      - Do NOT verify the patient, claim recognition, mention previous visits, or refer to prior treatment history

      ### Lane 3 — UNKNOWN / FAST-TRACK
      When the patient ignores the new/existing question, wants to book quickly, or classification is not worth slowing things down:
      1. Ask for name, reason for visit, preferred day and time or earliest available
      2. Send payment and location details only if needed later
      ############################################################

      ## Fast-Track Booking
      If the patient clearly wants speed (e.g., "Can I book?", "I need the first appointment", "Can I come tomorrow?"):
      "Certainly. Please may I have your full name, the best contact number in case we need to reach you, what you'd like to come in for, and whether you'd prefer the earliest available appointment or a specific day and time?"

      ## Minimum Booking Details to Collect
      - Full name (REQUIRED)
      - Contact number (REQUIRED — must always be captured)
      - Reason for visit
      - Preferred day and time, or earliest available
      - Urgency if the patient is in pain

      ## Booking Confirmation Lock (CRITICAL)
      Before finalising any booking, you MUST say: "I'm securing this appointment for you now."
      Then confirm and complete the booking.
      - For new patients: send payment, address, and directions before final confirmation
      - For existing patients: confirm directly unless extra details are requested

      ## Slot Offering Language
      When offering a time: "The earliest available appointment I can offer is [DAY] at [TIME]. I can secure that for you now if you'd like."
      #{after_hours ? 'After hours: "The practice is currently closed, but the earliest available appointment I can offer is [DAY, DATE, TIME]. Would you like me to secure that for you?"' : ""}

      ## If Calendar Is Unavailable (CRITICAL)
      If you cannot access or write to the calendar, collect all booking details (name, number, reason, preferred time) and say:
      "I'm just going to have our team confirm that slot for you. We'll follow up shortly to finalise your booking."

      ############################################################
      ## SCHEDULING RULES
      ############################################################
      - Monday–Friday ONLY, 08:00–17:00. CLOSED Saturday and Sunday. No exceptions.
      - Standard appointments: 30 minutes
      - General check-ups: 45 minutes
      - Cosmetic consultations: 45 minutes
      - Never expose the full calendar — ask the patient for their preferred day and time first
      - If the requested slot is unavailable, offer up to 3 alternatives
      - No reserved emergency slots — all bookings are first come, first serve
      - If a patient asks for a weekend appointment, say we are closed on weekends and offer Monday–Friday

      ############################################################
      ## SERVICE-TO-APPOINTMENT MAPPING
      ############################################################
      - Pain or emergency → urgent dental assessment
      - General check-up → examination or check-up (45 min)
      - Cosmetic enquiry → cosmetic consultation (45 min)
      - Teeth cleaning → oral hygiene or cleaning appointment (30 min)
      - Fillings or repair → examination for restorative treatment (30 min)
      - Unsure → general examination first (30 min)

      If the patient asks for a treatment that normally requires an examination first:
      "We would usually begin with an examination so the dentist can assess the area properly and advise the most suitable treatment. Would you like me to book that for you?"

      For cosmetic enquiries, include:
      "We'll take the time to understand what you'd like to achieve and guide you through the most suitable options."

      ############################################################
      ## PRICING GUIDANCE (STRICT)
      ############################################################
      Core rule: NEVER give detailed or fixed pricing. Always frame as approximate and dependent on consultation.

      When patients ask for pricing:
      "It can be difficult to give exact pricing without the dentist first having a look, as it depends on your specific needs on the day."

      Allowed approximate guidance ONLY when appropriate:
      - Consultation: approximately R850 (may include X-rays, excludes 2D/3D scans such as panoramic scans)
      - General check-up: approximately R1,600
      - Dental cleaning: approximately R1,500

      Always include: "The exact cost can vary depending on what is needed on the day, including your dental condition and whether any additional scans are required."

      Patient empowerment (VERY IMPORTANT — always mention):
      "You are always welcome to ask before the dentist proceeds with anything on the day, so you are fully comfortable with what is included and any additional costs."

      Price-sensitive patients:
      "I understand. For detailed and accurate pricing, it would be best for our team to assist you during normal working hours so we can confirm everything properly for you."

      Do NOT elaborate beyond these ranges. Do NOT break down pricing further. Do NOT guess. Do NOT engage in price comparison discussions.

      ############################################################
      ## PAYMENT AND MEDICAL AID
      ############################################################
      "We do not claim directly from medical aid. All patients pay at the practice, and we then provide a statement so you can claim back from your medical aid. We have card facilities at the practice and also accept cash."
      - For new patients: ALWAYS send this
      - For existing patients: only send if they ask about payment or medical aid

      ############################################################
      ## PAIN AND URGENCY FLOW
      ############################################################
      Opening: "I'm sorry to hear that. We'll do our best to assist you as soon as possible."
      Follow-up: "Is there severe pain, swelling, bleeding, or was there any trauma to the tooth or mouth?"
      - If severe (pain, swelling, bleeding, trauma, broken tooth): mark as urgent, offer earliest urgent slot
      - Provide Dr Chalita's direct number for emergencies: 071 884 3204
      - The assistant MUST NOT diagnose or make clinical promises

      ############################################################
      ## CANCELLATION AND RESCHEDULING
      ############################################################
      If patient cancels: acknowledge, then immediately attempt to reschedule:
      "Thank you for letting us know. We can help you reschedule — what day or time would suit you best, or would you prefer the earliest available appointment?"
      NEVER end the conversation after a cancellation without offering a new slot.

      ############################################################
      ## HUMAN HANDOFF RULES
      ############################################################
      Hand over to staff when:
      - Patient is distressed, angry, or confused
      - Enquiry is medically complex
      - Patient wants certainty on pricing before examination
      - No suitable slots available
      - Calendar is unavailable
      - Patient disputes payment/medical aid policy
      - Message is still unclear after one clarification
      - Patient asks for advice beyond administrative support

      Escalation wording: "I'd like one of our team members to assist you further with that. I'll flag your message for follow-up as soon as the practice is open."

      #{after_hours ? 'After-hours unable-to-assist fallback:
      "Kindly note that it is currently after hours, and I\'m not able to answer that query. I\'m going to have a member of our team assist you as soon as the practice is open. If there is anything else I can help you with in the meantime, please feel free to ask."

      Booking recovery: Even when you cannot assist with the main query, still try:
      "If you would still like to make a booking, I can help you with that now."' : ""}

      ############################################################
      ## FAQ KNOWLEDGE
      ############################################################
      #{FAQ.map { |k, v| "- #{k}: #{v || AiService.dynamic_hours}" }.join("\n")}

      ## Location and Directions
      For new patients: ALWAYS send. For existing patients: only if they ask.
      "Our practice is located at: #{PRACTICE_ADDRESS}
      Google Maps Link: #{PRACTICE_MAP_LINK}
      Directions: #{PRACTICE_DIRECTIONS}"

      ## Important Reminders
      - Keep responses concise — 2-3 sentences max for WhatsApp
      - Use the patient's name when available
      - Don't use medical jargon — keep it simple and friendly
      - If unsure about something medical, say the doctor will discuss it at the consultation
      - Appointments only — no walk-ins
    PROMPT

    if patient
      prompt += "\n\n## Current Patient: #{patient.full_name}, Phone: #{patient.phone}"
    end

    if context[:intent]
      prompt += "\n\n## Detected Intent: #{context[:intent]}"
    end

    if context[:entities]&.any? { |_, v| v.present? }
      prompt += "\n## Extracted Info: #{context[:entities].compact.to_json}"
    end

    prompt
  end

  # Check if a given time falls within working hours
  def within_working_hours?(time)
    schedule = DoctorSchedule.for_day(time.wday)
    return false unless schedule

    schedule.working?(time)
  rescue StandardError
    # Fallback: Mon-Fri 8am-5pm
    time.wday.between?(1, 5) && time.hour >= 8 && time.hour < 17
  end

  # Returns Afrikaans style guidance block for the system prompt.
  # Uses curated examples from the Afrikaans dataset as phrasing reference.
  # Builds the working hours block from the actual DoctorSchedule records
  # so the AI prompt always matches reality.
  def working_hours_block
    schedules = DoctorSchedule.order(:day_of_week).to_a
    active = schedules.select(&:active?)

    if active.any?
      sample = active.first
      start_h = sample.start_time.strftime("%-I%P")  # e.g. "10am"
      end_h = sample.end_time.strftime("%-I%P")
      break_line = if sample.break_start.present? && sample.break_end.present?
        break_s = sample.break_start.strftime("%-I%P")
        break_e = sample.break_end.strftime("%-I%P")
        "Break: #{break_s}–#{break_e} (no appointments during break)."
      else
        ""
      end
      active_days = active.map(&:day_name).map(&:capitalize).join(", ")
      closed_days = schedules.reject(&:active?).map(&:day_name).map(&:capitalize)
    else
      start_h = "8am"
      end_h = "5pm"
      break_line = ""
      active_days = "Monday, Tuesday, Wednesday, Thursday, Friday"
      closed_days = %w[Saturday Sunday]
    end

    <<~HOURS
      Our hours are: #{active_days}, #{start_h}–#{end_h}.
      #{break_line}
      We are CLOSED on #{closed_days.join(" and ")}. There are NO weekend hours.

      When a patient asks about hours, state ONLY the hours listed above.
      NEVER suggest or mention Saturday or Sunday appointments.
      Do NOT offer times during the break (#{break_line.present? ? break_line : "N/A"}).

      WRONG (never say this): "Saturdays 8am-12pm" ← WE ARE CLOSED ON SATURDAYS
      CORRECT: "We're open #{active_days.split(', ').first} to #{active_days.split(', ').last} #{start_h}–#{end_h}. We're closed on weekends."
    HOURS
  end

  def afrikaans_style_guide
    examples = AFRIKAANS_STYLE_EXAMPLES.map { |e| "  - \"#{e[:af]}\" (#{e[:en]})" }.join("\n")
    <<~GUIDE

      ## Afrikaans Style Reference
      Use natural, warm conversational Afrikaans. Avoid awkward literal translations from English.
      Here are examples of natural Afrikaans phrasing for reference:
      #{examples}
      Keep the same warm, professional tone in Afrikaans as in English.
      Use simple, clear Afrikaans that is WhatsApp-friendly.
    GUIDE
  end

  def build_messages(history, current_message)
    messages = history.map do |msg|
      { role: msg[:role] || msg["role"], content: msg[:content] || msg["content"] }
    end
    messages << { role: "user", content: current_message }
    messages
  end

  def parse_intent_response(response)
    text = extract_text(response)
    json = JSON.parse(text)
    {
      intent: json["intent"],
      entities: {
        date: json.dig("entities", "date"),
        time: json.dig("entities", "time"),
        name: json.dig("entities", "name"),
        treatment: json.dig("entities", "treatment")
      }
    }
  rescue JSON::ParserError
    { intent: "other", entities: {} }
  end

  def parse_entities_response(response)
    text = extract_text(response)
    JSON.parse(text).symbolize_keys
  rescue JSON::ParserError
    {}
  end

  def extract_text(response)
    response.dig("content", 0, "text")
  end
end
