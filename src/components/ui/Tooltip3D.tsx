import { AnimatePresence, motion } from 'motion/react'
import { useUi } from '../../store/ui'

/** One floating tooltip for every 3D object, positioned beside the pointer. */
export function Tooltip3D() {
  const tip = useUi((s) => s.tooltip)
  const flip = tip ? tip.x > window.innerWidth - 300 : false

  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          key={tip.title}
          role="tooltip"
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="glass glass-blur pointer-events-none fixed z-[150] max-w-[260px] rounded-xl px-4 py-3"
          style={{
            left: flip ? tip.x - 20 : tip.x + 20,
            top: tip.y + 18,
            translate: flip ? '-100% 0' : '0 0',
          }}
        >
          <p className="font-mono text-[11px] font-semibold tracking-[0.18em] text-ice uppercase">{tip.title}</p>
          {tip.lines.map((l, i) => (
            <p key={i} className={i === 0 ? 'mt-1.5 text-xs text-slate-300' : 'mt-1 font-mono text-[11px] text-brand/85'}>
              {l}
            </p>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
