import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { categoryStyles } from '../../data/categoryStyles'
import type { Project } from '../../data/types'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useLockBodyScroll(true)

  useEffect(() => {
    closeRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      // Keep focus inside the dialog while it's open.
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const style = categoryStyles[project.category]

  return (
    <motion.div
      className="fixed inset-0 z-60 flex items-end justify-center p-0 sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-ink-0/70 backdrop-blur-sm" />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ y: 28, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-paper-3 bg-paper-1 p-6 shadow-2xl sm:rounded-2xl sm:p-8 dark:border-white/10 dark:bg-ink-1"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`chip ${style.badge}`}>
              <span className={`size-1.5 rounded-full ${style.dot}`} />
              {project.category}
            </span>
            <h3 id="project-modal-title" className="mt-3 text-2xl font-bold">
              {project.name}
            </h3>
            {project.client && (
              <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{project.client}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-paper-3 text-slate-500 transition-colors hover:text-brand dark:border-white/10 dark:text-slate-400"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{project.blurb}</p>

        <h4 className="mt-7 font-mono text-[11px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          What I did
        </h4>
        <ul className="mt-3 space-y-2.5">
          {project.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/70" />
              {b}
            </li>
          ))}
        </ul>

        <h4 className="mt-7 font-mono text-[11px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
          Stack
        </h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {project.tech.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
