import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { matchesFilter, projectFilters, projects } from '../../data/projects'
import type { Project } from '../../data/types'
import { selectActiveProject, useUi } from '../../store/ui'
import { Reveal, SectionHeader } from '../ui/motion'

export function Projects() {
  const filter = useUi((s) => s.projectFilter)
  const set = useUi((s) => s.set)
  const visible = projects.filter((p) => matchesFilter(p, filter))
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { margin: '-20% 0px -20% 0px' })
  const reduced = useReducedMotion()

  // Idle showcase: while nobody is pointing at anything, step through projects so
  // the universe keeps demonstrating how each one connects to its stack.
  useEffect(() => {
    if (!inView || reduced) {
      set({ projectAuto: null })
      return
    }
    let i = 0
    const tick = () => {
      const { projectHover, projectFilter } = useUi.getState()
      if (projectHover) return
      const list = projects.filter((p) => matchesFilter(p, projectFilter))
      set({ projectAuto: list[i++ % list.length]?.id ?? null })
    }
    tick()
    const id = window.setInterval(tick, 3800)
    return () => window.clearInterval(id)
  }, [inView, reduced, set, filter])

  return (
    <section ref={sectionRef} id="projects" className="relative py-28 lg:min-h-[140svh]">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="scrim max-w-2xl lg:max-w-[48%]">
          <SectionHeader index="05" label="Projects" stage="Shipped to production" title="Project universe." />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
              Eight delivered systems. Each panel in the scene is wired to the technologies it runs on — point at one to
              trace its data path.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div role="group" aria-label="Filter projects" className="mt-8 flex flex-wrap gap-1.5">
              <LayoutGroup id="project-filter">
                {projectFilters.map((f) => {
                  const count = projects.filter((p) => matchesFilter(p, f.id)).length
                  const on = filter === f.id
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ projectFilter: f.id, projectHover: null })}
                      className={`relative rounded-lg px-3.5 py-2 font-mono text-[10.5px] font-semibold tracking-[0.16em] uppercase transition-colors ${
                        on ? 'text-ink-0' : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {on && (
                        <motion.span
                          layoutId="filter-pill"
                          className="absolute inset-0 rounded-lg bg-ice"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                      {!on && <span className="absolute inset-0 rounded-lg border border-white/10" />}
                      <span className="relative">
                        {f.label} <span className={on ? 'text-ink-0/60' : 'text-slate-600'}>{count}</span>
                      </span>
                    </button>
                  )
                })}
              </LayoutGroup>
            </div>
          </Reveal>

          {/* Grid on desktop, horizontal carousel on small screens. */}
          <motion.ul
            layout
            className="snap-carousel -mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((p) => (
                <ProjectCard key={p.id} project={p} index={projects.indexOf(p)} />
              ))}
            </AnimatePresence>
          </motion.ul>
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const set = useUi((s) => s.set)
  const active = useUi((s) => selectActiveProject(s) === project.id)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="w-[82%] shrink-0 snap-start sm:w-auto"
    >
      <button
        type="button"
        data-cursor="view"
        data-block-3d
        onPointerEnter={() => set({ projectHover: project.id })}
        onPointerLeave={() => set({ projectHover: null })}
        onFocus={() => set({ projectHover: project.id })}
        onBlur={() => set({ projectHover: null })}
        onClick={() => set({ openProject: project.id })}
        aria-haspopup="dialog"
        className={`glass group flex h-full w-full flex-col rounded-2xl p-5 text-left transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 ${
          active ? '!border-brand/35 shadow-[0_0_0_1px_rgb(95_212_244/0.08),0_20px_40px_-20px_rgb(95_212_244/0.25)]' : ''
        }`}
      >
        <span className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-slate-500 uppercase">
          <span>P/{String(index + 1).padStart(2, '0')}</span>
          <span className={active ? 'text-brand' : ''}>{project.platform}</span>
        </span>
        <span className="mt-4 block text-base font-semibold text-white">{project.name}</span>
        {project.client && <span className="mt-0.5 block font-mono text-[11px] text-slate-500">{project.client}</span>}
        <span className="mt-3 block text-[13px] leading-relaxed text-slate-400">{project.blurb}</span>
        <span className="mt-4 block font-mono text-[10.5px] leading-relaxed text-brand/80">{project.flow.join(' → ')}</span>
        <span className="mt-auto flex items-center gap-1.5 pt-5 font-mono text-[10px] font-semibold tracking-[0.18em] text-slate-300 uppercase">
          Details
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </span>
      </button>
    </motion.li>
  )
}
