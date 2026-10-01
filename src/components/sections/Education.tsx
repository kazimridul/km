import { GraduationCap, Trophy } from 'lucide-react'
import { achievement, education } from '../../data/education'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

export function Education() {
  return (
    <section id="education" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading index="05" title="Education & Achievements" />

      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal className="space-y-5">
          {education.map((c) => (
            <div key={c.title} className="surface flex gap-4 p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                <GraduationCap className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.institution}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="surface relative h-full overflow-hidden p-6">
            <div aria-hidden className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/10 blur-2xl" />
            <div className="relative">
              <span className="grid size-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Trophy className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold">
                ICPC Dhaka Regional <span className="font-mono text-sm text-slate-400">{achievement.year}</span>
              </h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Competed in the International Collegiate Programming Contest regional round.
              </p>

              <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-paper-3 bg-paper-3 dark:border-white/8 dark:bg-white/8">
                {[
                  { label: 'Rank', value: achievement.rank },
                  { label: 'Team', value: achievement.team },
                  { label: 'Coach', value: achievement.coach },
                ].map((row) => (
                  <div key={row.label} className="bg-paper-1 px-3 py-3.5 text-center dark:bg-ink-1">
                    <dt className="text-[10px] font-medium tracking-wider text-slate-400 uppercase dark:text-slate-500">
                      {row.label}
                    </dt>
                    <dd className="mt-1 truncate font-mono text-sm font-semibold text-slate-900 dark:text-white" title={row.value}>
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
