import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { categoryStyles } from '../../data/categoryStyles'
import { projectCategories, projects } from '../../data/projects'
import type { Project, ProjectCategory } from '../../data/types'
import { ProjectCard } from '../ui/ProjectCard'
import { ProjectModal } from '../ui/ProjectModal'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

type Filter = ProjectCategory | 'All'

const FILTERS: Filter[] = ['All', ...projectCategories]

export function Projects() {
  const [filter, setFilter] = useState<Filter>('All')
  const [selected, setSelected] = useState<Project | null>(null)

  const visible = useMemo(
    () => (filter === 'All' ? projects : projects.filter((p) => p.category === filter)),
    [filter],
  )

  return (
    <section
      id="projects"
      className="scroll-mt-24 border-y border-paper-3 bg-paper-2/40 py-20 md:py-28 dark:border-white/6 dark:bg-ink-1/40"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="04"
          title="Projects"
          subtitle="Client work and internal platforms, grouped by where they run. Open any card for the detail."
        />

        <Reveal className="mb-8 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const isActive = filter === f
            const count = f === 'All' ? projects.length : projects.filter((p) => p.category === f).length
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={isActive}
                className={`relative rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-brand/50 bg-brand/10 text-brand'
                    : 'border-paper-3 text-slate-500 hover:text-slate-900 dark:border-white/10 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {f !== 'All' && (
                  <span className={`mr-2 inline-block size-1.5 rounded-full align-middle ${categoryStyles[f].dot}`} />
                )}
                {f}
                <span className="ml-1.5 font-mono text-xs opacity-60">{count}</span>
              </button>
            )
          })}
        </Reveal>

        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ProjectCard project={p} onOpen={() => setSelected(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  )
}
