import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { scroll } from '../lib/scroll'
import { useUi } from '../store/ui'
import { buildKeyframes, DWELL, fovFor } from './layout'
import { C, k, motionPrefs, worldTargets } from './shared'

/**
 * Scroll drives a path through keyframes; the camera chases that path with
 * critically-damped smoothing so flights stay cinematic, never jerky. On top:
 * a small pointer parallax, hero node focus, and a lean toward hovered stack
 * clusters.
 */
export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const light = useRef<THREE.PointLight>(null)
  const [milestones, setMilestones] = useState(scroll.milestones)
  const seenVersion = useRef(scroll.version)

  const curves = useMemo(() => {
    const frames = buildKeyframes(size.width, size.height, milestones)
    return {
      s: frames.map((f) => f.s),
      pos: new THREE.CatmullRomCurve3(
        frames.map((f) => f.pos),
        false,
        'centripetal',
      ),
      look: new THREE.CatmullRomCurve3(
        frames.map((f) => f.look),
        false,
        'centripetal',
      ),
    }
  }, [size.width, size.height, milestones])

  useEffect(() => {
    camera.fov = fovFor(size.width >= 1024)
    camera.updateProjectionMatrix()
  }, [camera, size.width])

  const state = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      targetPos: new THREE.Vector3(),
      targetLook: new THREE.Vector3(),
      parallax: new THREE.Vector2(),
      tmp: new THREE.Vector3(),
      initialised: false,
    }),
    [],
  )

  useFrame((three, dt) => {
    // Experience cards moved (resize, expand): re-key the rail flight to their new positions.
    if (scroll.version !== seenVersion.current) {
      seenVersion.current = scroll.version
      if (scroll.milestones.some((m, i) => Math.abs(m - (milestones[i] ?? -1)) > 0.005)) setMilestones([...scroll.milestones])
    }
    let s = scroll.s
    if (motionPrefs.reduced) s = DWELL[Math.min(DWELL.length - 1, Math.floor(s))]

    // Map s to a curve parameter: linear between keyframes, eased near each one so
    // the camera settles at a section instead of sweeping straight past.
    const ks = curves.s
    const clamped = THREE.MathUtils.clamp(s, ks[0], ks[ks.length - 1])
    let i = 0
    while (i < ks.length - 2 && clamped > ks[i + 1]) i++
    const t = (clamped - ks[i]) / (ks[i + 1] - ks[i])
    const eased = THREE.MathUtils.lerp(t, t * t * (3 - 2 * t), 0.6)
    const u = (i + eased) / (ks.length - 1)

    curves.pos.getPoint(u, state.targetPos)
    curves.look.getPoint(u, state.targetLook)

    const ui = useUi.getState()

    // Hero focus: lean partway toward the selected node while still in the hero —
    // a slight zoom that keeps the platform in its half of the screen.
    if (ui.heroFocus && s < 0.95) {
      const node = worldTargets.get(`hero:${ui.heroFocus}`)
      if (node) {
        const w = (1 - THREE.MathUtils.smoothstep(s, 0.6, 0.95)) * 0.35
        state.tmp.copy(node).sub(state.targetPos).multiplyScalar(w)
        state.targetPos.add(state.tmp)
        state.targetLook.lerp(node, w)
      }
    }

    // Stack: lean toward the cluster the user is exploring.
    if (ui.clusterHover && Math.abs(s - 3.55) < 0.5) {
      const c = worldTargets.get(`cluster:${ui.clusterHover}`)
      if (c) {
        state.targetLook.lerp(c, 0.28)
        state.tmp.copy(c).sub(state.targetPos).multiplyScalar(0.14)
        state.targetPos.add(state.tmp)
      }
    }

    // Pointer parallax — fine pointers only, never under reduced motion.
    if (motionPrefs.finePointer && !motionPrefs.reduced) {
      state.parallax.x += (three.pointer.x * 0.5 - state.parallax.x) * k(2.2, dt)
      state.parallax.y += (three.pointer.y * 0.3 - state.parallax.y) * k(2.2, dt)
      state.targetPos.x += state.parallax.x
      state.targetPos.y += state.parallax.y
      state.targetLook.x += state.parallax.x * 0.25
      state.targetLook.y += state.parallax.y * 0.25
    }

    if (!state.initialised) {
      state.pos.copy(state.targetPos)
      state.look.copy(state.targetLook)
      state.initialised = true
    }

    state.pos.lerp(state.targetPos, k(2.4, dt))
    state.look.lerp(state.targetLook, k(2.9, dt))
    camera.position.copy(state.pos)
    camera.lookAt(state.look)

    // A soft key light rides with the point of interest.
    if (light.current) light.current.position.set(state.look.x + 2, state.look.y + 3, state.look.z + 4)
  })

  return <pointLight ref={light} color={C.cyan} intensity={18} distance={22} decay={1.6} />
}
