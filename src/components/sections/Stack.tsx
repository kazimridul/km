import { stackClusters } from '../../data/stack'
import { useUi } from '../../store/ui'
import { Reveal, SectionHeader } from '../ui/motion'

/**
 * The galaxy is the visual; this column is its legend and the accessible
 * version of the same data. Hovering or focusing a cluster turns the camera
 * toward it in the scene.
 */
export function Stack() {
  const hover = useUi((s) => s.clusterHover)
  const tier = useUi((s) => s.tier)
  const set = useUi((s) => s.set)

  return (
    <section id="stack" className="relative flex min-h-[125svh] items-center py-28">
      <div className="mx-auto flex w-full max-w-7xl justify-end px-5 sm:px-8">
        <div className="scrim w-full max-w-2xl lg:max-w-[44%]">
          <SectionHeader index="04" label="Technology" stage="Applications are built" title="The engineering stack." />
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-slate-400">
              Eight clusters orbiting one core. {tier !== 'off' && 'Hover a technology in the scene for what it does, or pick a cluster below.'}
            </p>
          </Reveal>

          <ul className="mt-8 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-1/50">
            {stackClusters.map((c, i) => (
              <li key={c.id}>
                <Reveal delay={0.04 * i}>
                  <button
                    type="button"
                    data-cursor="explore"
                    data-block-3d
                    aria-label={`${c.title}: ${c.techs.map((t) => t.name).join(', ')}`}
                    onClick={() => set({ clusterHover: c.id })}
                    onPointerEnter={() => set({ clusterHover: c.id })}
                    onPointerLeave={() => set({ clusterHover: null })}
                    onFocus={() => set({ clusterHover: c.id })}
                    onBlur={() => set({ clusterHover: null })}
                    className={`group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 px-5 py-3.5 text-left transition-colors ${
                      hover === c.id ? 'bg-brand/[0.06]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-600">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span
                        className={`block font-mono text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors ${
                          hover === c.id ? 'text-brand' : 'text-ice'
                        }`}
                      >
                        {c.title}
                      </span>
                      <span className="mt-1 block text-sm text-slate-400">{c.techs.map((t) => t.name).join(' · ')}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-600">{c.techs.length}</span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
