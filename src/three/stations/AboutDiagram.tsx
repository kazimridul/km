import { RoundedBox } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { type PillarId, pillars } from '../../data/profile'
import { useUi } from '../../store/ui'
import { FlowParticles } from '../FlowParticles'
import { STATIONS } from '../layout'
import { HitSphere, Label, Pipe } from '../primitives'
import { bowedCurve, C, isStationLive, k, materials, motionPrefs } from '../shared'
import { CloudCluster } from './HeroNetwork'

const STATION = 1

const POS: Record<PillarId, [number, number, number]> = {
  data: [-1.55, 1.05, 0.4],
  backend: [1.55, 1.1, -0.45],
  cloud: [1.4, -1.05, 0.35],
  automation: [-1.45, -1.0, -0.35],
}

const EDGES: [PillarId, PillarId][] = [
  ['data', 'backend'],
  ['backend', 'cloud'],
  ['cloud', 'automation'],
  ['automation', 'data'],
  ['data', 'cloud'],
  ['backend', 'automation'],
]

/** Stacked platters — data layers, gently breathing apart. */
function DataLayers() {
  const metal = useMemo(() => materials.metal(), [])
  const ring = useMemo(
    () => new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.8, toneMapped: false }),
    [],
  )
  const refs = useRef<THREE.Group[]>([])
  useFrame((state) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    const t = state.clock.elapsedTime
    refs.current.forEach((g, i) => {
      g.position.y = (i - 1.5) * 0.17 + Math.sin(t * 0.9 + i * 0.6) * 0.025
      g.rotation.y = t * 0.1 * (i % 2 ? 1 : -1)
    })
  })
  return (
    <group rotation-x={0.42}>
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          ref={(g) => {
            if (g) refs.current[i] = g
          }}
          position-y={(i - 1.5) * 0.17}
        >
          <mesh material={metal}>
            <cylinderGeometry args={[0.5, 0.5, 0.05, 48]} />
          </mesh>
          <mesh rotation-x={Math.PI / 2} position-y={0.027} material={ring}>
            <torusGeometry args={[0.44, 0.004, 4, 64, Math.PI * (0.6 + i * 0.3)]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Three server blades with status LEDs. */
function ServerBlades() {
  const metal = useMemo(() => materials.metal(), [])
  const leds = useRef<THREE.MeshBasicMaterial[]>([])
  useFrame((state) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    const t = state.clock.elapsedTime
    leds.current.forEach((m, i) => {
      m.opacity = 0.35 + 0.65 * (Math.sin(t * (1.5 + (i % 3) * 0.7) + i * 2.1) > 0.2 ? 1 : 0.2)
    })
  })
  return (
    <group rotation-x={0.3} rotation-y={-0.35}>
      {[0, 1, 2].map((row) => (
        <group key={row} position-y={(row - 1) * 0.2}>
          <RoundedBox args={[1, 0.14, 0.56]} radius={0.025} smoothness={2} material={metal} />
          {[0, 1, 2].map((j) => (
            <mesh key={j} position={[0.28 + j * 0.07, 0, 0.283]}>
              <circleGeometry args={[0.014, 10]} />
              <meshBasicMaterial
                ref={(m) => {
                  if (m) leds.current[row * 3 + j] = m
                }}
                color={j === 2 ? C.blue : C.cyan}
                transparent
                toneMapped={false}
              />
            </mesh>
          ))}
          <mesh position={[-0.2, 0, 0.283]}>
            <planeGeometry args={[0.42, 0.018]} />
            <meshBasicMaterial color={C.dim} transparent opacity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** A gear inside a cycle ring with a packet orbiting it — continuous automation. */
function AutomationCycle() {
  const metal = useMemo(() => {
    const m = materials.metal()
    m.flatShading = true
    return m
  }, [])
  const gear = useRef<THREE.Mesh>(null)
  const orbit = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    if (gear.current) gear.current.rotation.y -= dt * 0.4
    if (orbit.current) orbit.current.rotation.z += dt * 0.8
  })
  return (
    <group>
      <group rotation-x={Math.PI / 2}>
        <mesh ref={gear} material={metal}>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 10]} />
        </mesh>
      </group>
      <mesh>
        <torusGeometry args={[0.3, 0.006, 6, 10]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh rotation-x={0}>
        <torusGeometry args={[0.52, 0.006, 6, 80]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <group ref={orbit}>
        <mesh position={[0.52, 0, 0]} rotation-z={Math.PI}>
          <coneGeometry args={[0.045, 0.12, 12]} />
          <meshBasicMaterial color={C.ice} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Pillar({ id, index }: { id: PillarId; index: number }) {
  const pillar = pillars.find((p) => p.id === id)!
  const group = useRef<THREE.Group>(null)
  const title = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const items = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const base = useMemo(() => new THREE.Vector3(...POS[id]), [id])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !isStationLive(STATION)) return
    const hover = useUi.getState().pillarHover
    const active = hover === id
    const dim = hover !== null && !active
    const t = state.clock.elapsedTime
    const bob = motionPrefs.reduced ? 0 : Math.sin(t * 0.6 + index * 1.4) * 0.07
    g.position.y += (base.y + bob - g.position.y) * k(4, dt)
    g.position.z += (base.z + (active ? 0.35 : 0) - g.position.z) * k(5, dt)
    const s = active ? 1.1 : dim ? 0.94 : 1
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k(6, dt))
    if (!motionPrefs.reduced) g.rotation.y = Math.sin(t * 0.25 + index) * 0.25 + (motionPrefs.finePointer ? state.pointer.x * 0.2 : 0)
    if (title.current) title.current.fillOpacity += ((dim ? 0.35 : 1) - title.current.fillOpacity) * k(6, dt)
    if (items.current) items.current.fillOpacity += ((dim ? 0.2 : active ? 0.95 : 0.6) - items.current.fillOpacity) * k(6, dt)
  })

  const set = useUi((s) => s.set)
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    set({ pillarHover: id, cursor3d: 'hover' })
  }
  const onOut = () => {
    if (useUi.getState().pillarHover === id) set({ pillarHover: null, cursor3d: null })
  }

  return (
    <group ref={group} position={POS[id]}>
      {id === 'data' && <DataLayers />}
      {id === 'backend' && <ServerBlades />}
      {id === 'cloud' && <CloudCluster scale={0.75} />}
      {id === 'automation' && <AutomationCycle />}
      <Label ref={title} position-y={-0.78} fontSize={0.13} color={C.ice} letterSpacing={0.2}>
        {pillar.title.toUpperCase()}
      </Label>
      <Label ref={items} position-y={-0.98} fontSize={0.068} color={C.label} fillOpacity={0.6}>
        {pillar.items.join('  ·  ').toUpperCase()}
      </Label>
      <HitSphere radius={0.7} onPointerOver={onOver} onPointerOut={onOut} />
    </group>
  )
}

export function AboutDiagram() {
  const group = useRef<THREE.Group>(null)
  const curves = useMemo(
    () => EDGES.map(([a, b]) => bowedCurve(new THREE.Vector3(...POS[a]), new THREE.Vector3(...POS[b]), 0.12, 0.1)),
    [],
  )
  const opacity = useMemo(() => curves.map(() => ({ current: 0.25 })), [curves])
  const weights = useRef(curves.map(() => 1))
  const paths = useMemo(() => curves.map((c) => c.getSpacedPoints(48)), [curves])

  useFrame((state, dt) => {
    if (!group.current || !isStationLive(STATION)) return
    if (!motionPrefs.reduced) {
      group.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.08) * 0.18 - group.current.rotation.y) * k(1.5, dt)
    }
    const hover = useUi.getState().pillarHover
    EDGES.forEach(([a, b], i) => {
      const on = hover === a || hover === b
      opacity[i].current = !hover ? 0.25 : on ? 0.7 : 0.06
      weights.current[i] = !hover ? 1 : on ? 1 : 0.12
    })
  })

  return (
    <group ref={group} position={STATIONS[STATION].anchor}>
      {curves.map((c, i) => (
        <Pipe key={i} curve={c} opacity={opacity[i]} station={STATION} radius={0.009} />
      ))}
      {pillars.map((p, i) => (
        <Pillar key={p.id} id={p.id} index={i} />
      ))}
      <FlowParticles paths={paths} count={4} speed={0.9} weights={weights} station={STATION} />
    </group>
  )
}
