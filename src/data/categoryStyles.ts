import type { ProjectCategory } from './types'

/** One colour per platform, reused by the filter pills, cards and modal. */
export const categoryStyles: Record<ProjectCategory, { dot: string; badge: string }> = {
  GCP: {
    dot: 'bg-sky-400',
    badge: 'border-sky-400/30 bg-sky-400/10 text-sky-500 dark:text-sky-300',
  },
  AWS: {
    dot: 'bg-amber-400',
    badge: 'border-amber-400/30 bg-amber-400/10 text-amber-600 dark:text-amber-300',
  },
  Azure: {
    dot: 'bg-blue-500',
    badge: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300',
  },
  Backend: {
    dot: 'bg-emerald-400',
    badge: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-600 dark:text-emerald-300',
  },
}
