import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { contactChannels } from '../../data/contact'
import { useUi } from '../../store/ui'
import { FlowParticles } from '../FlowParticles'
import { STATIONS } from '../layout'
import { Glow, HitSphere, Label, Pipe } from '../primitives'
import { bowedCurve, C, isStationLive, k, materials, motionPrefs } from '../shared'

const STATION = 6

const SLOTS: [number, number, number][] = [
  [-2.3, 1.25, 0.3],
  [2.35, 1.15, -0.4],
  [2.15, -1.35, 0.45],
  [-2.2, -1.3, -0.3],
]

/**
 * The communication terminal: a central node that wakes up and streams
 * packets toward whichever channel the visitor is pointing at.
 */
export function CommNode() {
  const channels = useMemo(() => contactChannels().filter((c) => c.node).slice(0, SLOTS.length), [])
  const coreMat = useRef<THREE.MeshStandardMaterial>(null)
  const shell = useRef<THREE.Mesh>(null)
  const rings = useRef<THREE.Group>(null)

  const links = useMemo(
    () =>
      channels.map((c, i) => ({
        id: c.id,
        curve: bowedCurve(new THREE.Vector3(), new THREE.Vector3(...SLOTS[i]), 0.12, 0.1),
      })),
    [channels],
  )
  const paths = useMemo(() => links.map((l) => l.curve.getSpacedPoints(40)), [links])
  const opacity = useMemo(() => links.map(() => ({ current: 0.2 })), [links])
  const weights = useRef(links.map(() => 0.25))
  const energy = useRef(0)

  useFrame((state, dt) => {
    if (!isStationLive(STATION)) return
    const hover = useUi.getState().contactHover
    energy.current += ((hover ? 1 : 0) - energy.current) * k(5, dt)
    links.forEach((l, i) => {
      const on = hover === l.id
      opacity[i].current = hover ? (on ? 0.85 : 0.08) : 0.22
      weights.current[i] = hover ? (on ? 1 : 0.05) : 0.25
    })
    const t = state.clock.elapsedTime
    if (coreMat.current) {
      const pulse = motionPrefs.reduced ? 0 : Math.sin(t * 2.2) * 0.15
      coreMat.current.emissiveIntensity = 0.55 + energy.current * 1.1 + pulse * 0.6
    }
    if (motionPrefs.reduced) return
    if (shell.current) {
      shell.current.rotation.y += dt * (0.12 + energy.current * 0.5)
      shell.current.rotation.x += dt * 0.04
    }
    if (rings.current) {
      rings.current.children.forEach((r, i) => (r.rotation.z += dt * (i ? -0.15 : 0.2) * (1 + energy.current * 2)))
    }
  })

  return (
    <group position={STATIONS[STATION].anchor}>
      <mesh>
        <sphereGeometry args={[0.2, 40, 40]} />
        <meshStandardMaterial ref={coreMat} color="#041018" emissive={C.cyan} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <Glow scale={1.8} opacity={0.35} />
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={C.metal} metalness={0.9} roughness={0.3} wireframe />
      </mesh>
      <group ref={rings}>
        <mesh rotation-x={1.2}>
          <torusGeometry args={[0.95, 0.006, 6, 96]} />
          <meshBasicMaterial color={C.cyan} transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh rotation-x={-0.6} rotation-y={0.8}>
          <torusGeometry args={[1.12, 0.004, 6, 96]} />
          <meshBasicMaterial color={C.blue} transparent opacity={0.4} toneMapped={false} />
        </mesh>
      </group>

      {links.map((l, i) => (
        <Pipe key={l.id} curve={l.curve} radius={0.008} opacity={opacity[i]} station={STATION} />
      ))}
      {channels.map((c, i) => (
        <Destination key={c.id} id={c.id} label={c.label.toUpperCase()} href={c.href} external={c.external} download={c.download} pos={SLOTS[i]} />
      ))}
      <FlowParticles paths={paths} count={6} speed={2.2} weights={weights} station={STATION} />
    </group>
  )
}

function Destination({
  id,
  label,
  href,
  external,
  download,
  pos,
}: {
  id: string
  label: string
  href: string
  external?: boolean
  download?: boolean
  pos: [number, number, number]
}) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.MeshBasicMaterial>(null)
  const metal = useMemo(() => {
    const m = materials.metal()
    m.flatShading = true
    return m
  }, [])

  useFrame((state, dt) => {
    if (!group.current || !isStationLive(STATION)) return
    const on = useUi.getState().contactHover === id
    const s = on ? 1.25 : 1
    group.current.scale.setScalar(group.current.scale.x + (s - group.current.scale.x) * k(6, dt))
    if (!motionPrefs.reduced) group.current.rotation.y += dt * (on ? 1.2 : 0.3)
    group.current.position.y = motionPrefs.reduced ? 0 : Math.sin(state.clock.elapsedTime * 0.7 + pos[0]) * 0.05
    if (ring.current) ring.current.opacity += ((on ? 1 : 0.35) - ring.current.opacity) * k(6, dt)
  })

  const set = useUi((s) => s.set)
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (download) {
      const a = document.createElement('a')
      a.href = href
      a.download = ''
      a.click()
    } else if (external) window.open(href, '_blank', 'noopener,noreferrer')
    else window.location.href = href
  }

  return (
    <group position={pos}>
      <group ref={group}>
        <mesh material={metal}>
          <octahedronGeometry args={[0.15, 0]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.26, 0.005, 6, 48]} />
          <meshBasicMaterial ref={ring} color={C.cyan} transparent opacity={0.35} toneMapped={false} />
        </mesh>
      </group>
      <Label position-y={-0.42} fontSize={0.1} color={C.ice} letterSpacing={0.25}>
        {label}
      </Label>
      <HitSphere
        radius={0.45}
        onPointerOver={(e) => {
          e.stopPropagation()
          set({ contactHover: id, cursor3d: 'hover' })
        }}
        onPointerOut={() => {
          if (useUi.getState().contactHover === id) set({ contactHover: null, cursor3d: null })
        }}
        onClick={onClick}
      />
    </group>
  )
}
