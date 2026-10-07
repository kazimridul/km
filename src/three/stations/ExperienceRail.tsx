import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { scroll, stationWeight } from '../../lib/scroll'
import { FlowParticles } from '../FlowParticles'
import { RAIL } from '../layout'
import { Glow, Label, Pipe } from '../primitives'
import { C, isStationLive, k, materials, motionPrefs } from '../shared'

const STATION = 2

/**
 * A physical engineering rail running into Z-space. Milestones are rings the
 * camera rides through; behind it, a data pipeline brightens while you're in
 * the section and sinks back into the haze as you leave.
 */
export function ExperienceRail() {
  const ties = useMemo(() => {
    const verts: number[] = []
    for (let z = RAIL.z0; z >= RAIL.z1; z -= 0.8) verts.push(-0.16, 0, z, 0.16, 0, z)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  const railCurves = useMemo(
    () =>
      [-0.12, 0.12].map(
        (x) => new THREE.LineCurve3(new THREE.Vector3(x, 0, RAIL.z0), new THREE.Vector3(x, 0, RAIL.z1)),
      ),
    [],
  )
  const railOpacity = useMemo(() => ({ current: 0.55 }), [])
  const pulse = useRef<THREE.Group>(null)
  const sparkPath = useMemo(() => [new THREE.Vector3(0, 0, RAIL.z0), new THREE.Vector3(0, 0, RAIL.z1)], [])

  useFrame((_, dt) => {
    if (!pulse.current || !isStationLive(STATION)) return
    // "You are here" marker tracks the camera's progress along the rail.
    const [a, , b] = scroll.milestones.length === 3 ? scroll.milestones : [2.22, 2.58, 2.86]
    const p = THREE.MathUtils.clamp((scroll.s - a) / (b - a), 0, 1)
    const z = THREE.MathUtils.lerp(RAIL.milestones[0].z, RAIL.milestones[2].z, p)
    pulse.current.position.z += (z - pulse.current.position.z) * k(3, dt)
  })

  return (
    <group position={[RAIL.x, RAIL.y, 0]}>
      {railCurves.map((c, i) => (
        <Pipe key={i} curve={c} radius={0.01} opacity={railOpacity} station={STATION} segments={8} />
      ))}
      <lineSegments geometry={ties}>
        <lineBasicMaterial color={C.cyanDeep} transparent opacity={0.35} depthWrite={false} />
      </lineSegments>
      <FlowParticles paths={[sparkPath]} count={10} speed={4} size={30} trail={4} station={STATION} />

      <group ref={pulse} position-z={RAIL.milestones[0].z}>
        <Glow scale={1.4} opacity={0.6} />
        <pointLight color={C.cyan} intensity={6} distance={6} decay={1.8} />
      </group>

      {RAIL.milestones.map((m, i) => (
        <Milestone key={m.label} label={m.label} caption={m.caption} z={m.z} future={i === RAIL.milestones.length - 1} />
      ))}

      {/* Company spans along the rail. */}
      <Label position={[0.55, 0.08, (RAIL.milestones[0].z + RAIL.milestones[1].z) / 2]} rotation-y={-Math.PI / 2} fontSize={0.14} color={C.dim} letterSpacing={0.4}>
        NAZTECH INC · 2020 — 2022
      </Label>
      <Label position={[0.55, 0.08, (RAIL.milestones[1].z + RAIL.milestones[2].z) / 2]} rotation-y={-Math.PI / 2} fontSize={0.14} color={C.dim} letterSpacing={0.4}>
        BE DATA SOLUTIONS · 2022 — PRESENT
      </Label>

      <BackgroundPipeline />
    </group>
  )
}

function Milestone({ label, caption, z, future }: { label: string; caption: string; z: number; future: boolean }) {
  const ring = useRef<THREE.Mesh>(null)
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const year = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const sub = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const metal = useMemo(() => materials.metal(), [])
  useFrame((state, dt) => {
    if (!ring.current || !mat.current || !isStationLive(STATION)) return
    // Brighten as the camera approaches.
    const camZ = state.camera.position.z - 8.5
    const near = 1 - THREE.MathUtils.clamp(Math.abs(camZ - z) / 9, 0, 1)
    mat.current.opacity += ((future ? 0.25 : 0.3) + near * 0.6 - mat.current.opacity) * k(4, dt)
    // Far milestones bunch up at the vanishing point — keep their labels quiet until approached.
    const labelTarget = 0.08 + near * near * 0.92
    if (year.current) year.current.fillOpacity += (labelTarget - year.current.fillOpacity) * k(4, dt)
    if (sub.current) sub.current.fillOpacity += (labelTarget - sub.current.fillOpacity) * k(4, dt)
    if (!motionPrefs.reduced) ring.current.rotation.z += dt * (future ? 0.1 : 0.04)
  })
  return (
    <group position-z={z}>
      <mesh ref={ring}>
        <torusGeometry args={[0.62, future ? 0.006 : 0.014, 8, 96, future ? Math.PI * 1.6 : Math.PI * 2]} />
        <meshBasicMaterial ref={mat} color={C.cyan} transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh material={metal}>
        <sphereGeometry args={[0.11, 24, 24]} />
      </mesh>
      <Glow scale={0.9} opacity={future ? 0.25 : 0.5} />
      <Label ref={year} position={[-0.85, 0.85, 0]} fontSize={0.34} color={C.ice} letterSpacing={0.02} anchorX="right">
        {label}
      </Label>
      <Label ref={sub} position={[-0.85, 0.52, 0]} fontSize={0.085} color={C.label} letterSpacing={0.25} anchorX="right">
        {caption}
      </Label>
    </group>
  )
}

const PIPE_STAGES = ['API', 'QUEUE', 'PROCESSING', 'DATABASE', 'REPORT'] as const

function StageShape({ stage }: { stage: (typeof PIPE_STAGES)[number] }) {
  const metal = useMemo(() => materials.metal(), [])
  const glass = useMemo(() => materials.glass(), [])
  switch (stage) {
    case 'API':
      return <RoundedBox args={[0.5, 0.34, 0.1]} radius={0.03} material={metal} />
    case 'QUEUE':
      return (
        <mesh rotation-x={Math.PI / 2} material={glass}>
          <capsuleGeometry args={[0.16, 0.5, 6, 14]} />
        </mesh>
      )
    case 'PROCESSING':
      return (
        <mesh>
          <icosahedronGeometry args={[0.32, 0]} />
          <meshBasicMaterial color={C.cyan} wireframe transparent opacity={0.4} toneMapped={false} />
        </mesh>
      )
    case 'DATABASE':
      return (
        <mesh material={metal}>
          <cylinderGeometry args={[0.26, 0.26, 0.42, 32]} />
        </mesh>
      )
    case 'REPORT':
      return <RoundedBox args={[0.42, 0.56, 0.05]} radius={0.03} material={glass} />
  }
}

function BackgroundPipeline() {
  const group = useRef<THREE.Group>(null)
  const fade = useRef(0.25)
  const points = useMemo(
    () => PIPE_STAGES.map((_, i) => new THREE.Vector3(3.8 + Math.sin(i * 1.3) * 0.5, 1.7 + (i % 2) * 0.5, RAIL.z0 - 4 - i * 6.5)),
    [],
  )
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, 'centripetal'), [points])
  const path = useMemo(() => [curve.getSpacedPoints(160)], [curve])
  const opacity = useMemo(() => ({ current: 0.1 }), [])

  useFrame((_, dt) => {
    if (!group.current || !isStationLive(STATION)) return
    const target = 0.2 + stationWeight(STATION, 1) * 0.8
    fade.current += (target - fade.current) * k(3, dt)
    opacity.current = 0.35 * fade.current
    // Fade every material in the group with the section.
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material & { opacity: number; userData: { base?: number } }
      if (!m || Array.isArray(m) || o.userData.skipFade) return
      if (m.userData.base === undefined) {
        m.userData.base = m.transparent ? m.opacity : 1
        m.transparent = true
      }
      m.opacity = m.userData.base * fade.current
    })
  })

  return (
    <>
      <Pipe curve={curve} radius={0.01} opacity={opacity} station={STATION} segments={160} color={C.blue} />
      <FlowParticles paths={path} count={14} speed={2.2} station={STATION} fade={fade} color="#9fdcff" />
      <group ref={group}>
        {PIPE_STAGES.map((s, i) => (
          <group key={s} position={points[i]}>
            <StageShape stage={s} />
            <Label position-y={-0.5} fontSize={0.1} color={C.label} letterSpacing={0.25}>
              {s}
            </Label>
          </group>
        ))}
      </group>
    </>
  )
}
