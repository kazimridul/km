import { skillGroups } from '../../data/skills'
import type { Skill } from '../../data/types'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

function SkillChip({ skill }: { skill: Skill }) {
  const Icon = skill.icon
  return (
    <li className="chip transition-colors hover:border-brand/45 hover:text-brand dark:hover:border-brand/45 dark:hover:text-brand">
      {Icon ? <Icon className="size-3.5 shrink-0" /> : <span className="size-1.5 shrink-0 rounded-full bg-brand/60" />}
      {skill.name}
    </li>
  )
}

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 border-y border-paper-3 bg-paper-2/40 py-20 md:py-28 dark:border-white/6 dark:bg-ink-1/40">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          index="02"
          title="Skills & Tooling"
          subtitle="The stack I reach for, grouped by what it actually does."
        />

        <div className="grid gap-5 md:grid-cols-2">
          {skillGroups.map((group, i) => (
            <Reveal
              key={group.title}
              delay={(i % 2) * 0.08}
              // The Cloud group carries three subgroups — give it the full row.
              className={group.subgroups ? 'md:col-span-2' : undefined}
            >
              <div className="surface h-full p-6">
                <h3 className="font-mono text-xs font-semibold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  {group.title}
                </h3>

                {group.skills && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.skills.map((s) => (
                      <SkillChip key={s.name} skill={s} />
                    ))}
                  </ul>
                )}

                {group.subgroups && (
                  <div className="mt-5 grid gap-5 sm:grid-cols-3">
                    {group.subgroups.map((sub) => (
                      <div key={sub.title}>
                        <h4 className="flex items-center gap-2 text-sm font-semibold">
                          <span className="h-4 w-0.5 rounded-full bg-linear-to-b from-brand to-accent" />
                          {sub.title}
                        </h4>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {sub.skills.map((s) => (
                            <SkillChip key={s.name} skill={s} />
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
