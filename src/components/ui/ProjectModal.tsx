import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { Fragment, useEffect, useRef } from 'react'
import { projectFilters } from '../../data/projects'
import type { Project } from '../../data/types'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'

/** Platform plus filter tags, without repeating "Backend" twice. */
function eyebrow(p: Project) {
  const labels = [p.platform, ...p.tags.map((t) => projectFilters.find((f) => f.id === t)!.label)]
  return [...new Map(labels.map((l) => [l.toLowerCase(), l])).values()].join(' · ')
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useLockBodyScroll(true)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
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
    return () => {
      document.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0 bg-ink-0/75 backdrop-blur-md" />

      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={{ y: 40, opacity: 0, scale: 0.97, rotateX: 6 }}
        animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
        exit={{ y: 24, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1200 }}
        className="glass relative max-h-[88svh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-ink-1/95 p-6 sm:rounded-3xl sm:p-9"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{eyebrow(project)}</p>
            <h3 id="project-modal-title" className="mt-3 text-2xl font-semibold sm:text-3xl">
              {project.name}
            </h3>
            {project.client && <p className="mt-1 font-mono text-xs text-slate-500">{project.client}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition-colors hover:text-white"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-slate-300">{project.blurb}</p>

        <h4 className="mt-8 font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Data path</h4>
        <ol className="mt-3 flex flex-wrap items-center gap-2" aria-label="Technology chain">
          {project.flow.map((t, i) => (
            <Fragment key={t}>
              {i > 0 && (
                <li aria-hidden="true" className="h-px w-4 bg-brand/40" />
              )}
              <li className="rounded-lg border border-brand/25 bg-brand/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-ice">{t}</li>
            </Fragment>
          ))}
        </ol>

        <h4 className="mt-8 font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">What I did</h4>
        <ul className="mt-3 space-y-2.5">
          {project.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-sm leading-relaxed text-slate-300">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-brand/70" aria-hidden="true" />
              {b}
            </li>
          ))}
        </ul>

        <h4 className="mt-8 font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">Stack</h4>
        <ul className="mt-3 flex flex-wrap gap-1.5">
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
