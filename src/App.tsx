import { AnimatePresence } from 'motion/react'
import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { Footer } from './components/layout/Footer'
import { Nav } from './components/layout/Nav'
import { StageHud } from './components/layout/StageHud'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Education } from './components/sections/Education'
import { Experience } from './components/sections/Experience'
import { Hero } from './components/sections/Hero'
import { Projects } from './components/sections/Projects'
import { Stack } from './components/sections/Stack'
import { Backdrop } from './components/ui/Backdrop'
import { CustomCursor } from './components/ui/CustomCursor'
import { ProjectModal } from './components/ui/ProjectModal'
import { Tooltip3D } from './components/ui/Tooltip3D'
import { projects } from './data/projects'
import { detectTier, isFinePointer, prefersReducedMotion, tierScale } from './lib/device'
import { motionPrefs } from './lib/motionPrefs'
import { startScrollTracking } from './lib/scroll'
import { useUi } from './store/ui'

// three.js + R3F are the heaviest part of the bundle; they load after first paint
// so the copy (and LCP) never waits on WebGL.
const World = lazy(() => import('./three/World'))

function useBoot() {
  const [boot] = useState(() => {
    const reduced = prefersReducedMotion()
    const tier = detectTier()
    const finePointer = isFinePointer()
    motionPrefs.reduced = reduced
    motionPrefs.finePointer = finePointer
    motionPrefs.scale = tierScale[tier]
    useUi.getState().set({ tier, reducedMotion: reduced })
    return { reduced, tier, finePointer }
  })
  useEffect(() => startScrollTracking(), [])
  return boot
}

/** Mounts the 3D world once the browser is idle after load. */
function useIdleMount(enabled: boolean) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const go = () => !cancelled && setReady(true)
    const schedule = () =>
      'requestIdleCallback' in window ? window.requestIdleCallback(go, { timeout: 1500 }) : setTimeout(go, 300)
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => {
      cancelled = true
    }
  }, [enabled])
  return ready
}

export default function App() {
  const { tier: bootTier, reduced, finePointer } = useBoot()
  // The watchdog in World can downgrade to 'off' at runtime.
  const tier = useUi((s) => s.tier)
  const mountWorld = useIdleMount(bootTier !== 'off') && tier !== 'off'
  const openId = useUi((s) => s.openProject)
  const set = useUi((s) => s.set)
  const open = projects.find((p) => p.id === openId)
  const close = useCallback(() => set({ openProject: null }), [set])

  return (
    <>
      <Backdrop />
      {mountWorld && (
        <Suspense fallback={null}>
          <World />
        </Suspense>
      )}
      {finePointer && !reduced && <CustomCursor />}
      <Tooltip3D />

      <Nav />
      <StageHud />
      <main id="main" className="relative z-10">
        <Hero />
        <About />
        <Experience />
        <Stack />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />

      <AnimatePresence>{open && <ProjectModal key={open.id} project={open} onClose={close} />}</AnimatePresence>
    </>
  )
}
