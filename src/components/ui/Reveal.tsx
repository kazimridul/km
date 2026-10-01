import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Stagger helper — seconds to wait before this element animates in. */
  delay?: number
  className?: string
}

/**
 * Fade-and-rise on scroll into view, once. Collapses to a plain div when the
 * user prefers reduced motion so nothing animates and nothing starts hidden.
 */
export function Reveal({ children, delay = 0, className }: Props) {
  const reduced = useReducedMotion()

  if (reduced) return <div className={className}>{children}</div>

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
