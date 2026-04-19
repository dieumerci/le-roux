import React from 'react'
import { Link } from '@inertiajs/react'
import { AlertTriangle, FileQuestion, ServerCrash, ArrowLeft } from 'lucide-react'

const CONFIG = {
  404: {
    icon: FileQuestion,
    color: 'text-brand-primary',
    bg: 'bg-brand-primary/10',
    defaultTitle: 'Page not found',
    defaultMessage: "The page you're looking for doesn't exist or has been moved.",
  },
  422: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    defaultTitle: 'Request could not be processed',
    defaultMessage: 'Something about the request was invalid. Please go back and try again.',
  },
  500: {
    icon: ServerCrash,
    color: 'text-brand-danger',
    bg: 'bg-brand-danger/10',
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again or contact support if the issue persists.',
  },
}

export default function ErrorPage({ status = 500, title, message }) {
  const cfg = CONFIG[status] || CONFIG[500]
  const Icon = cfg.icon
  const displayTitle = title || cfg.defaultTitle
  const displayMessage = message || cfg.defaultMessage

  return (
    <div className="min-h-screen bg-brand-surface/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${cfg.bg}`}>
          <Icon size={36} className={cfg.color} />
        </div>

        {/* Status code */}
        <p className={`mb-2 text-6xl font-bold tracking-tight ${cfg.color}`}>{status}</p>

        {/* Title */}
        <h1 className="mb-3 text-2xl font-semibold text-brand-ink">{displayTitle}</h1>

        {/* Message */}
        <p className="mb-8 text-sm leading-6 text-brand-muted">{displayMessage}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary-dark"
          >
            <ArrowLeft size={15} />
            Back to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-5 py-2.5 text-sm font-semibold text-brand-ink shadow-sm transition-colors hover:bg-brand-surface"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  )
}
