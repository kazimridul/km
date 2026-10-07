import { Canvas, events as pointerEvents, type RootState, useFrame, useThree } from '@react-three/fiber'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import type * as THREE from 'three'
import { tierScale } from '../lib/device'
import { onStationChange, scroll } from '../lib/scroll'
import { useUi } from '../store/ui'
import { Background, Lighting } from './Atmosphere'
import { CameraRig } from './CameraRig'
import { FOG_COLOR, FOG_DENSITY, isStationLive, motionPrefs } from './shared'
import { AboutDiagram } from './stations/AboutDiagram'
import { CommNode } from './stations/CommNode'
import { ExperienceRail } from './stations/ExperienceRail'
import { HeroNetwork } from './stations/HeroNetwork'
import { ProjectUniverse } from './stations/ProjectUniverse'
import { StackGalaxy } from './stations/StackGalaxy'
import { Trophy } from './stations/Trophy'

/**
 * The DOM element under the pointer. The canvas sits behind the HTML and
 * listens on #root, so without this a click on a button would also hit
 * whatever 3D object happens to be behind it.
 */
let domTarget: Element | null = null
const BLOCKING = 'a, button, input, textarea, select, [role="dialog"], [data-block-3d]'

function trackDomTarget() {
  const set = (e: PointerEvent) => (domTarget = e.target as Element)
  window.addEventListener('pointermove', set, { capture: true, passive: true })
  window.addEventListener('pointerdown', set, { capture: true, passive: true })
  return () => {
    window.removeEventListener('pointermove', set, { capture: true })
    window.removeEventListener('pointerdown', set, { capture: true })
  }
}

function visibleDeep(o: THREE.Object3D | null) {
  for (let n = o; n; n = n.parent) if (!n.visible) return false
  return true
}

const filteredEvents = (store: Parameters<typeof pointerEvents>[0]) => ({
  ...pointerEvents(store),
  filter: (hits: THREE.Intersection[]) => {
    if (domTarget?.closest(BLOCKING)) return []
    return hits.filter((h) => visibleDeep(h.object))
  },
})

/** Renders its children only while the camera is near this station. */
function Station({ index, children }: { index: number; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (ref.current) ref.current.visible = isStationLive(index)
  })
  return <group ref={ref}>{children}</group>
}

/** Under reduced motion the loop is on-demand: redraw on section changes and UI state changes. */
function DemandInvalidator() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!motionPrefs.reduced) return
    let last = -1
    const offStation = onStationChange((s) => {
      const i = Math.floor(s)
      if (i !== last) {
        last = i
        invalidate()
      }
    })
    const offUi = useUi.subscribe(() => invalidate())
    return () => {
      offStation()
      offUi()
    }
  }, [invalidate])
  return null
}

/**
 * Frame-rate watchdog. Chrome can run WebGL in software while still reporting
 * the real GPU's name, so the boot-time tier check isn't enough: if frames stay
 * slow, step the DPR down, and if that doesn't help, retire the 3D world for the
 * static backdrop rather than leave the visitor with a slideshow.
 */
function FpsWatchdog({ dpr, setDpr }: { dpr: number; setDpr: (d: number) => void }) {
  const acc = useRef({ frames: 0, time: 0, warm: 0, strikes: 0 })
  useFrame((_, dt) => {
    if (motionPrefs.reduced) return
    const a = acc.current
    // Skip the first seconds (shader compiles, font loading) and tab-switch gaps.
    if (a.warm < 4) {
      a.warm += Math.min(dt, 0.25)
      return
    }
    if (dt > 0.5) return
    a.frames++
    a.time += dt
    if (a.time < 2) return
    const fps = a.frames / a.time
    a.frames = 0
    a.time = 0
    a.strikes = fps < 24 ? a.strikes + 1 : 0
    if (a.strikes < 2) return
    a.strikes = 0
    if (dpr > 1) setDpr(Math.max(1, dpr - 0.25))
    else if (fps < 15) useUi.getState().set({ tier: 'off' })
  })
  return null
}

/** Clears transient hover state when the pointer leaves the window. */
function HoverReset() {
  useEffect(() => {
    const reset = () => useUi.getState().set({ heroHover: null, techHover: null, cursor3d: null, tooltip: null })
    document.documentElement.addEventListener('pointerleave', reset)
    return () => document.documentElement.removeEventListener('pointerleave', reset)
  }, [])
  return null
}

/**
 * On narrow screens the scene sits behind full-width copy, so it steps back
 * for text-heavy sections and comes forward where the 3D is the content.
 */
const NARROW_PRESENCE = [1, 0.6, 0.75, 0.4, 0.4, 1, 0.55]

function useNarrowPresence() {
  const [presence, setPresence] = useState(1)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)')
    let last = -1
    const apply = (s: number) => {
      const i = Math.min(NARROW_PRESENCE.length - 1, Math.floor(s))
      if (i === last) return
      last = i
      setPresence(mq.matches ? NARROW_PRESENCE[i] : 1)
    }
    const off = onStationChange(apply)
    const onMq = () => {
      last = -1
      apply(scroll.s)
    }
    mq.addEventListener('change', onMq)
    apply(scroll.s)
    return () => {
      off()
      mq.removeEventListener('change', onMq)
    }
  }, [])
  return presence
}

export default function World() {
  const tier = useUi((s) => s.tier)
  const reduced = useUi((s) => s.reducedMotion)
  const [dprCap, setDprCap] = useState(tier === 'high' ? 1.5 : tier === 'medium' ? 1.25 : 1)
  const [shown, setShown] = useState(false)
  const presence = useNarrowPresence()

  useEffect(() => trackDomTarget(), [])

  const onCreated = (state: RootState) => {
    state.gl.setClearColor(0x000000, 0)
    // Dev-only handle for profiling from the console.
    if (import.meta.env.DEV) (window as unknown as { __r3f: RootState }).__r3f = state
    // Two frames in, the first draw has landed — fade the canvas in over the static backdrop.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setShown(true)
        useUi.getState().set({ worldReady: true })
      }),
    )
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[1200ms] ease-out"
      style={{ opacity: shown ? presence : 0 }}
    >
      <Canvas
        eventSource={document.getElementById('root')!}
        eventPrefix="client"
        events={filteredEvents}
        dpr={[1, dprCap]}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance', stencil: false }}
        camera={{ fov: 42, near: 0.1, far: 140, position: [0, 0.6, 9.5] }}
        onCreated={onCreated}
      >
        <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
        <FpsWatchdog dpr={dprCap} setDpr={setDprCap} />
        <DemandInvalidator />
        <HoverReset />
        <Lighting />
        <CameraRig />
        <Background density={tierScale[tier]} />
        <Station index={0}>
          <HeroNetwork />
        </Station>
        <Station index={1}>
          <AboutDiagram />
        </Station>
        <Station index={2}>
          <ExperienceRail />
        </Station>
        <Station index={3}>
          <StackGalaxy />
        </Station>
        <Station index={4}>
          <ProjectUniverse />
        </Station>
        <Station index={5}>
          <Trophy />
        </Station>
        <Station index={6}>
          <CommNode />
        </Station>
      </Canvas>
    </div>
  )
}
