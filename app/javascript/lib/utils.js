import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges class names with Tailwind conflict resolution.
 * Use in place of bare template strings whenever Tailwind classes may collide.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-brand-brown text-white', className)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
