import { useEffect, useRef, useState } from 'react'
import { type CursorMode, useUi } from '../../store/ui'

const LABEL: Partial<Record<CursorMode, string>> = { view: 'View', explore: 'Explore' }

/**
 * A small glowing dot that grows into an outline over interactive elements.
 * DOM elements opt into labels with `data-cursor="view|explore"`; 3D objects
 * set `cursor3d` in the store. Positions are written straight to the DOM — no
 * React re-render per mouse move.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [domMode, setDomMode] = useState<CursorMode>('default')
  const cursor3d = useUi((s) => s.cursor3d)
  const mode: CursorMode = domMode !== 'default' ? domMode : (cursor3d ?? 'default')

  useEffect(() => {
    document.documentElement.classList.add('has-cursor')
    const pos = { x: -100, y: -100 }
    const lag = { x: -100, y: -100 }
    let frame = 0
    let visible = false

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible && dot.current && ring.current) {
        visible = true
        lag.x = pos.x
        lag.y = pos.y
        dot.current.style.opacity = '1'
        ring.current.style.opacity = '1'
      }
      const el = (e.target as Element).closest?.('[data-cursor], a, button, [role="button"], summary, label')
      const tagged = el?.getAttribute('data-cursor') as CursorMode | null
      setDomMode(tagged ?? (el ? 'hover' : 'default'))
    }
    const leave = () => {
      visible = false
      if (dot.current && ring.current) {
        dot.current.style.opacity = '0'
        ring.current.style.opacity = '0'
      }
    }
    const tick = () => {
      lag.x += (pos.x - lag.x) * 0.2
      lag.y += (pos.y - lag.y) * 0.2
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      if (ring.current) ring.current.style.transform = `translate3d(${lag.x}px, ${lag.y}px, 0)`
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  const label = LABEL[mode]
  const size = label ? 64 : mode === 'hover' ? 40 : 18

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]">
      <div ref={dot} className="absolute top-0 left-0 opacity-0 transition-opacity duration-200">
        <div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full bg-brand transition-[width,height,opacity] duration-300"
          style={{
            width: mode === 'default' ? 6 : 4,
            height: mode === 'default' ? 6 : 4,
            opacity: label ? 0 : 1,
            boxShadow: '0 0 12px 2px rgb(95 212 244 / 0.55)',
          }}
        />
      </div>
      <div ref={ring} className="absolute top-0 left-0 opacity-0 transition-opacity duration-200">
        <div
          className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-[10px] font-semibold tracking-[0.18em] text-ice uppercase transition-[width,height,border-color,background-color] duration-300 ease-out"
          style={{
            width: size,
            height: size,
            borderColor: mode === 'default' ? 'rgb(95 212 244 / 0.25)' : 'rgb(95 212 244 / 0.7)',
            backgroundColor: label ? 'rgb(8 16 30 / 0.55)' : 'transparent',
          }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
