class ApplicationController < ActionController::Base
  include InertiaRails::Controller

  # Phase 9.6 sub-area #6 — shared Inertia props.
  #
  # Exposes the unread notification count to every Inertia page so
  # the navbar bell badge stays accurate on every navigation without
  # needing a separate fetch. Evaluated per-request inside the block.
  inertia_share do
    { unread_notifications_count: safe_unread_count }
  end

  private

  # Defensive wrapper: if the notifications table isn't present yet
  # (fresh dev clone before `db:migrate`) we shouldn't blow up every
  # page render.
  def safe_unread_count
    Notification.unread.count
  rescue ActiveRecord::StatementInvalid
    0
  end
end
