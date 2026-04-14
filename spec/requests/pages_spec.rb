require 'rails_helper'

RSpec.describe 'Pages', type: :request do
  describe 'GET /' do
    it 'returns 200' do
      get '/'
      expect(response).to have_http_status(:ok)
    end

    it 'renders the inertia page data with Dashboard component' do
      get '/'
      expect(response.body).to include('Dashboard')
      expect(response.body).to include('data-page=')
    end

    it 'includes vite tags and app element' do
      get '/'
      expect(response.body).to include('vite')
      expect(response.body).to include('id="app"')
    end

    it 'includes dashboard stats in props' do
      get '/'
      expect(response.body).to include('todays_appointments')
      expect(response.body).to include('pending_confirmations')
    end
  end
end
