class Patient < ApplicationRecord
  has_many :appointments, dependent: :destroy
  has_many :call_logs, dependent: :nullify

  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :phone, presence: true, uniqueness: true,
            format: { with: /\A\+?\d{10,15}\z/, message: "must be a valid phone number" }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true

  def full_name
    "#{first_name} #{last_name}"
  end
end
