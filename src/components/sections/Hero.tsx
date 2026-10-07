import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowRight, ArrowUpRight, Download, X } from 'lucide-react'
import { useEffect } from 'react'
import { heroNodeById } from '../../data/heroNetwork'
import { profile, stats } from '../../data/profile'
import { useUi } from '../../store/ui'
import { CountUp, Magnetic, WordReveal } from '../ui/motion'

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero() {
  const reduced = useReducedMotion()
  const fade = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, delay, ease: EASE } }

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col justify-end pb-10 lg:justify-center lg:pb-0">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        {/* Narrow screens: the 3D network takes the top of the viewport, copy sits below it. */}
        <div className="h-[36svh] lg:hidden" aria-hidden="true" />

        <div className="scrim max-w-2xl lg:max-w-[46%]">
          <motion.p {...fade(0.1)} className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-brand/50" />
            {profile.eyebrow}
          </motion.p>

          <WordReveal
            as="h1"
            immediate
            delay={0.2}
            text={profile.name}
            className="mt-6 bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.03em] text-transparent sm:text-6xl xl:text-7xl"
          />

          <motion.p {...fade(0.5)} className="mt-6 text-lg leading-snug font-light text-slate-200 sm:text-2xl">
            {profile.headline.map((line, i) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.p>

          <motion.p {...fade(0.65)} className="mt-5 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-[15px]">
            {profile.summary}
          </motion.p>

          <motion.div {...fade(0.8)} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#projects" className="btn-primary">
                View my work
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href={profile.resumePath} download className="btn-ghost">
                <Download className="size-3.5" aria-hidden="true" />
                Download CV
              </a>
            </Magnetic>
            <a
              href="#contact"
              className="group ml-1 inline-flex items-center gap-1.5 px-2 py-3 font-mono text-xs font-semibold tracking-[0.16em] text-brand uppercase"
            >
              Let's connect
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.dl {...fade(0.95)} className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <CountUp value={s.value} suffix={s.suffix} className="block font-mono text-2xl font-semibold text-ice sm:text-3xl" />
                  <span className="mt-1.5 block font-mono text-[10px] tracking-[0.18em] text-slate-500 uppercase">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>

      <HeroInspector />

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-slate-500 uppercase transition-colors hover:text-brand lg:flex"
      >
        Scroll
        <ArrowDown className="size-3.5 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  )
}

/**
 * Detail card for the node the visitor clicked in the 3D platform. Clicking
 * is never required — this just rewards exploration.
 */
function HeroInspector() {
  const focus = useUi((s) => s.heroFocus)
  const set = useUi((s) => s.set)
  const worldReady = useUi((s) => s.worldReady)
  const node = focus ? heroNodeById[focus] : null

  useEffect(() => {
    if (!focus) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && set({ heroFocus: null })
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, set])

  return (
    <div className="pointer-events-none absolute right-5 bottom-8 left-5 sm:left-auto sm:w-80 lg:right-10 lg:bottom-12">
      <AnimatePresence mode="wait">
        {node ? (
          <motion.div
            key={node.id}
            data-block-3d
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="glass glass-blur pointer-events-auto rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow !text-[10px]">Focused node · {node.label}</p>
                <p className="mt-2 text-base font-semibold text-white">{node.title}</p>
                <p className="mt-1 text-sm text-slate-400">{node.description}</p>
              </div>
              <button
                type="button"
                onClick={() => set({ heroFocus: null })}
                aria-label="Close node details"
                className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {node.tech.map((t) => (
                <li key={t} className="chip">
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        ) : (
          worldReady && (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.6, duration: 0.8 }}
              className="hidden text-right font-mono text-[10px] tracking-[0.22em] whitespace-nowrap text-slate-500 uppercase lg:block"
            >
              Hover a node to inspect · click to focus
            </motion.p>
          )
        )}
      </AnimatePresence>
    </div>
  )
}
