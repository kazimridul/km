import { GraduationCap } from 'lucide-react'
import { achievement, education } from '../../data/education'
import { CountUp, Reveal, SectionHeader } from '../ui/motion'

export function Education() {
  return (
    <section id="education" className="relative flex min-h-[110svh] items-center py-28">
      <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8">
        {/* Narrow screens: leave the top of the viewport to the trophy. */}
        <div className="scrim w-full max-w-2xl pt-[26svh] lg:max-w-[46%] lg:pt-0">
          <SectionHeader index="06" label="Education & Achievements" stage="The foundation" title="Foundations." />

          <Reveal delay={0.1}>
            <div data-block-3d className="glass mt-8 rounded-2xl p-6 sm:p-8">
              <p className="eyebrow">
                {achievement.year} · {achievement.title}
              </p>
              <div className="mt-5 flex items-end gap-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase">Rank</p>
                  <CountUp
                    value={Number(achievement.rank)}
                    className="mt-1 block bg-gradient-to-b from-white to-brand/70 bg-clip-text font-mono text-7xl leading-none font-semibold tracking-tight text-transparent sm:text-8xl"
                  />
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5 font-mono text-xs">
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">Team</dt>
                  <dd className="mt-1 text-slate-200">{achievement.team}</dd>
                </div>
                <div>
                  <dt className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">Coach</dt>
                  <dd className="mt-1 text-slate-200">{achievement.coach}</dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <ul className="mt-4 space-y-3">
            {education.map((e, i) => (
              <li key={e.title}>
                <Reveal delay={0.15 + i * 0.08}>
                  <div className="glass flex items-start gap-4 rounded-2xl p-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-brand/20 bg-brand/[0.06] text-brand">
                      <GraduationCap className="size-4.5" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold">{e.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-400">{e.institution}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
