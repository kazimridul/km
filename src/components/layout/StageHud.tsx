import { useEffect, useRef, useState } from 'react'
import { sections } from '../../data/sections'
import { onStationChange, scroll } from '../../lib/scroll'

/**
 * Bottom-left system readout: which stage of the "pipeline" the visitor is in.
 * Decorative (the nav carries the same information), so it's hidden from AT.
 */
export function StageHud() {
  const [index, setIndex] = useState(0)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      onStationChange((s) => {
        setIndex(Math.min(sections.length - 1, Math.floor(s)))
        if (bar.current) bar.current.style.transform = `scaleX(${scroll.progress})`
      }),
    [],
  )

  const stage = sections[index]
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-6 left-6 z-30 hidden xl:block">
      <div className="glass rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.2em] uppercase">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          <span className="text-slate-500">
            {stage.index} / {String(sections.length).padStart(2, '0')}
          </span>
          <span className="text-slate-200">{stage.stage}</span>
        </div>
        <div className="mt-2.5 h-px w-full overflow-hidden bg-white/10">
          <div ref={bar} className="h-full origin-left bg-brand/70" style={{ transform: 'scaleX(0)' }} />
        </div>
      </div>
    </div>
  )
}
