import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { roles } from '../../data/experience'
import type { Role } from '../../data/types'
import { Reveal, SectionHeader } from '../ui/motion'

const current = roles[roles.length - 1]

/**
 * Each milestone block is roughly a viewport tall: as it scrolls past, the
 * camera rides the 3D rail to the matching year, so the card always appears
 * beside its node.
 */
export function Experience() {
  return (
    <section id="experience" className="relative pt-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="scrim max-w-2xl lg:max-w-[46%]">
          <SectionHeader index="03" label="Experience" stage="Systems connect" title="Career timeline, 2020 → now." />
          <Reveal delay={0.1}>
            <div className="glass mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-5 py-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">Currently</p>
                <p className="mt-1 text-sm font-medium text-white">
                  {current.title} · {current.company}
                </p>
              </div>
              <div className="h-8 w-px bg-white/10" aria-hidden="true" />
              <div>
                <p className="font-mono text-2xl font-semibold text-ice">5+</p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">Years engineering</p>
              </div>
            </div>
          </Reveal>
        </div>

        <ol className="mt-10">
          {roles.map((r) => (
            <li key={r.company} data-rail className="flex min-h-[88svh] items-center py-10">
              <RoleCard role={r} />
            </li>
          ))}
          <li data-rail className="flex min-h-[70svh] items-center py-10">
            <Reveal className="w-full max-w-2xl lg:max-w-[46%]">
              <div className="glass rounded-2xl p-6 sm:p-8">
                <p className="font-mono text-4xl font-semibold text-ice/80">2026+</p>
                <p className="eyebrow mt-3">Next milestone</p>
                <p className="mt-3 text-base leading-relaxed text-slate-300">
                  Open to data engineering, backend engineering, cloud and data-driven projects.
                </p>
                <a href="#contact" className="btn-ghost mt-6">
                  Start a conversation
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </li>
        </ol>
      </div>
    </section>
  )
}

function RoleCard({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <Reveal className="w-full max-w-2xl lg:max-w-[46%]">
      <article data-block-3d className="glass rounded-2xl p-6 sm:p-8">
        <div className="flex items-baseline justify-between gap-4">
          <p className="font-mono text-4xl font-semibold text-ice">{role.year}</p>
          <p className="font-mono text-[11px] tracking-[0.16em] text-slate-500 uppercase">{role.period}</p>
        </div>
        <h3 className="mt-4 text-xl font-semibold sm:text-2xl">{role.company}</h3>
        <p className="mt-1 text-sm text-brand">{role.title}</p>

        <ul className="mt-5 grid gap-x-4 gap-y-1.5 text-sm text-slate-300 sm:grid-cols-2">
          {role.focus.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <span className="size-1 shrink-0 rounded-full bg-brand/70" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>

        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Key technologies">
          {role.highlights.map((h) => (
            <li key={h} className="chip">
              {h}
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="btn-ghost mt-6 !py-2.5"
        >
          {open ? 'Hide experience' : 'View experience'}
          <ChevronDown className={`size-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-6 pt-6">
                {role.groups.map((g) => (
                  <div key={g.label}>
                    <h4 className="font-mono text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">{g.label}</h4>
                    <ul className="mt-3 space-y-2">
                      {g.bullets.map((b) => (
                        <li key={b} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-brand/60" aria-hidden="true" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </Reveal>
  )
}
