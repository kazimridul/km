import { ArrowUpRight } from 'lucide-react'
import { categoryStyles } from '../../data/categoryStyles'
import type { Project } from '../../data/types'

export function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const style = categoryStyles[project.category]
  const shown = project.tech.slice(0, 4)
  const overflow = project.tech.length - shown.length

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View details for ${project.name}`}
      className="surface group flex h-full flex-col p-6 text-left transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`chip ${style.badge}`}>
          <span className={`size-1.5 rounded-full ${style.dot}`} />
          {project.category}
        </span>
        <ArrowUpRight className="size-4 shrink-0 text-slate-300 transition-colors group-hover:text-brand dark:text-slate-600" />
      </div>

      <h3 className="mt-4 text-lg font-bold">{project.name}</h3>
      {project.client && (
        <p className="mt-0.5 font-mono text-xs text-slate-400 dark:text-slate-500">{project.client}</p>
      )}

      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{project.blurb}</p>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {shown.map((t) => (
          <li key={t} className="chip text-[11px]">
            {t}
          </li>
        ))}
        {overflow > 0 && <li className="chip text-[11px] text-slate-400">+{overflow}</li>}
      </ul>
    </button>
  )
}
