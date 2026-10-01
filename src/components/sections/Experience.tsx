import { AnimatePresence, motion } from 'motion/react'
import { Briefcase, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { roles } from '../../data/experience'
import type { Role } from '../../data/types'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <ul className="mt-3 space-y-2.5">
      {bullets.map((b) => (
        <li key={b} className="flex gap-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand/70" />
          {b}
        </li>
      ))}
    </ul>
  )
}

function GroupBlock({ group }: { group: Role['groups'][number] }) {
  return (
    <div>
      <h4 className="font-mono text-[11px] font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
        {group.label}
      </h4>
      <BulletList bullets={group.bullets} />
    </div>
  )
}

function RoleCard({ role }: { role: Role }) {
  const [expanded, setExpanded] = useState(false)
  const [first, ...rest] = role.groups
  const total = role.groups.reduce((n, g) => n + g.bullets.length, 0)

  return (
    <div className="surface p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{role.title}</h3>
          <p className="mt-0.5 text-sm font-medium text-brand">{role.company}</p>
        </div>
        <span className="chip whitespace-nowrap">{role.period}</span>
      </div>

      <div className="mt-5 space-y-6">
        <GroupBlock group={first} />

        <AnimatePresence initial={false}>
          {expanded && rest.length > 0 && (
            <motion.div
              key="rest"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-6 overflow-hidden"
            >
              {rest.map((g) => (
                <GroupBlock key={g.label} group={g} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-opacity hover:opacity-80"
        >
          {expanded ? 'Show less' : `Show all ${total} responsibilities`}
          <ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  )
}

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading index="03" title="Experience" subtitle="5+ years across data platform and backend engineering." />

      {/* Timeline rail sits behind the cards on md+, hidden on mobile. */}
      <div className="relative md:pl-14">
        <span
          aria-hidden
          className="absolute top-2 bottom-2 left-4.5 hidden w-px bg-linear-to-b from-brand via-accent/50 to-transparent md:block"
        />

        <div className="space-y-6">
          {roles.map((role, i) => (
            <Reveal key={role.company} delay={i * 0.08} className="relative">
              <span
                aria-hidden
                className="absolute top-7 -left-14 hidden size-9 place-items-center rounded-full border border-paper-3 bg-paper-1 text-brand md:grid dark:border-white/10 dark:bg-ink-2"
              >
                <Briefcase className="size-4" />
              </span>
              <RoleCard role={role} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
