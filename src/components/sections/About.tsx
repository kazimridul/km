import { about, aboutQuote, pillars } from '../../data/profile'
import { useUi } from '../../store/ui'
import { Reveal, SectionHeader } from '../ui/motion'

export function About() {
  const hover = useUi((s) => s.pillarHover)
  const set = useUi((s) => s.set)

  return (
    <section id="about" className="relative flex min-h-[115svh] items-center py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="scrim max-w-2xl lg:max-w-[46%]">
          <SectionHeader
            index="02"
            label="About"
            stage="Data is processed"
            title="Systems that move, process, secure and transform data."
          />

          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-slate-300 sm:text-base">
            {about.map((p, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <p>{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15}>
            <blockquote className="mt-8 border-l border-brand/40 pl-5 text-sm leading-relaxed text-slate-400 italic">
              “{aboutQuote}”
            </blockquote>
          </Reveal>

          {/* Legend for the 3D diagram — hovering a pillar lights it up in the scene. */}
          <ul className="mt-10 grid grid-cols-2 gap-3" aria-label="Engineering pillars">
            {pillars.map((p, i) => (
              <li key={p.id}>
                <Reveal delay={0.06 * i} className="h-full">
                  <div
                    data-block-3d
                    onPointerEnter={() => set({ pillarHover: p.id })}
                    onPointerLeave={() => set({ pillarHover: null })}
                    className={`glass h-full rounded-xl p-4 transition-[border-color,transform] duration-300 ${
                      hover === p.id ? '-translate-y-0.5 !border-brand/40' : ''
                    }`}
                  >
                    <p className="font-mono text-[11px] font-semibold tracking-[0.2em] text-ice uppercase">{p.title}</p>
                    <p className="mt-2 font-mono text-[11px] leading-relaxed text-slate-400">{p.items.join(' · ')}</p>
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
