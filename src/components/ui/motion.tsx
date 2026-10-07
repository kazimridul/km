import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { type ReactNode, useEffect, useRef } from 'react'
import { isFinePointer } from '../../lib/device'

const EASE = [0.16, 1, 0.3, 1] as const

/** Fade + rise + a touch of depth on scroll into view, once. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduced = useReducedMotion()
  if (reduced) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Staggered word reveal for headings. Screen readers get the plain text via
 * aria-label; the animated spans are hidden from them.
 */
export function WordReveal({
  text,
  as: Tag = 'span',
  className,
  delay = 0,
  immediate = false,
}: {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  delay?: number
  /** Animate on mount instead of on scroll into view (hero). */
  immediate?: boolean
}) {
  const reduced = useReducedMotion()
  if (reduced) return <Tag className={className}>{text}</Tag>
  const words = text.split(' ')
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-40px' } }
  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...trigger}
        transition={{ staggerChildren: 0.06, delayChildren: delay }}
        className="inline"
      >
        {words.map((w, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className="inline-block"
              variants={{ hidden: { y: '105%', opacity: 0 }, show: { y: '0%', opacity: 1 } }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Tag>
  )
}

/** Counts up from zero when scrolled into view. */
export function CountUp({ value, suffix = '', className }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduced = useReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduced) {
      el.textContent = `${value}${suffix}`
      return
    }
    const controls = animate(0, value, {
      duration: value > 50 ? 1.8 : 1.2,
      ease: EASE,
      onUpdate: (v) => (el.textContent = `${Math.round(v)}${suffix}`),
    })
    return () => controls.stop()
  }, [inView, reduced, value, suffix])

  return (
    <span ref={ref} className={className} aria-label={`${value}${suffix}`}>
      {reduced ? `${value}${suffix}` : `0${suffix}`}
    </span>
  )
}

/** Pulls its child gently toward the cursor; springs back on leave. Fine pointers only. */
export function Magnetic({ children, strength = 0.28 }: { children: ReactNode; strength?: number }) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  if (reduced || !isFinePointer()) return <>{children}</>

  return (
    <motion.div
      className="inline-flex"
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * strength)
        y.set((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/** Mono eyebrow + heading used at the top of every section. */
export function SectionHeader({
  index,
  label,
  stage,
  title,
  className = '',
}: {
  index: string
  label: string
  stage: string
  title: string
  className?: string
}) {
  return (
    <header className={className}>
      <Reveal>
        <p className="eyebrow flex items-center gap-3">
          <span className="text-slate-500">{index}</span>
          <span className="h-px w-8 bg-brand/40" />
          <span>{label}</span>
          <span className="hidden text-slate-500 sm:inline">· {stage}</span>
        </p>
      </Reveal>
      <WordReveal
        as="h2"
        text={title}
        className="mt-5 text-3xl leading-[1.12] font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]"
      />
    </header>
  )
}
