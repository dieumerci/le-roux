import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { Toaster } from 'sonner'
import { LanguageProvider } from '../lib/LanguageContext'

import '../styles/application.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-6xl font-bold text-red-500 mb-2">500</p>
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-8">
            An unexpected error occurred in the application. Refreshing the page may resolve the issue.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </a>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reload page
            </button>
          </div>
        </div>
      </div>
    )
  }
}

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('../pages/**/*.jsx', { eager: true })
    return pages[`../pages/${name}.jsx`]
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppErrorBoundary>
        <LanguageProvider initialServerLang={props.props?.ui_language}>
          <App {...props} />
          <Toaster position="top-right" richColors closeButton />
        </LanguageProvider>
      </AppErrorBoundary>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
