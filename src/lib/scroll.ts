import { sectionIds } from '../data/sections'

/**
 * Scroll position expressed as a fractional "station": section i spans
 * [i, i + 1) as the viewport's centre line crosses it. The 3D camera, station
 * visibility and the HUD all read this one number.
 *
 * Kept outside React on purpose — it changes every scroll event and the WebGL
 * loop reads it every frame, so routing it through state would re-render the
 * tree for nothing.
 */
export const scroll = {
  s: 0.5,
  /** 0..1 across the whole document. */
  progress: 0,
  /** Station value at which each `[data-rail]` card is centred in the viewport. */
  milestones: [] as number[],
  /** Bumped whenever layout is re-measured, so consumers can rebuild derived data. */
  version: 0,
}

type Listener = (s: number) => void
const listeners = new Set<Listener>()

export function onStationChange(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

let bounds: { top: number; height: number }[] = []

function measure() {
  bounds = sectionIds.map((id) => {
    const el = document.getElementById(id)
    if (!el) return { top: 0, height: 1 }
    const r = el.getBoundingClientRect()
    return { top: r.top + window.scrollY, height: Math.max(1, r.height) }
  })
  scroll.milestones = [...document.querySelectorAll<HTMLElement>('[data-rail]')].map((el) => {
    const r = el.getBoundingClientRect()
    return stationAt(r.top + window.scrollY + r.height / 2)
  })
  scroll.version++
}

/** Station value when the viewport centre line sits at document offset `line`. */
function stationAt(line: number) {
  let s = 0
  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i]
    if (line >= b.top) s = i + Math.min(1, (line - b.top) / b.height)
  }
  return s
}

function update() {
  if (bounds.length === 0) return
  const s = stationAt(window.scrollY + window.innerHeight * 0.5)
  scroll.s = s
  const max = document.documentElement.scrollHeight - window.innerHeight
  scroll.progress = max > 0 ? window.scrollY / max : 0
  listeners.forEach((fn) => fn(s))
}

let started = false

export function startScrollTracking() {
  if (started) return
  started = true

  let frame = 0
  const schedule = () => {
    if (frame) return
    frame = requestAnimationFrame(() => {
      frame = 0
      update()
    })
  }
  const remeasure = () => {
    measure()
    schedule()
  }

  remeasure()
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', remeasure)
  // Expanding an experience card or filtering projects changes section heights.
  new ResizeObserver(remeasure).observe(document.body)
}

/** 1 at a station's centre, easing to 0 at `reach` stations away. */
export function stationWeight(index: number, reach = 0.9) {
  const d = Math.abs(scroll.s - (index + 0.5))
  const t = Math.max(0, 1 - d / reach)
  return t * t * (3 - 2 * t)
}
