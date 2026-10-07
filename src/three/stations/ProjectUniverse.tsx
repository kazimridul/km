import { RoundedBox } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { matchesFilter, projects } from '../../data/projects'
import type { Project } from '../../data/types'
import { selectActiveProject, useUi } from '../../store/ui'
import { FlowParticles } from '../FlowParticles'
import { STATIONS } from '../layout'
import { Glow, Label, Polyline } from '../primitives'
import { C, isStationLive, k, lineMaterial, materials, motionPrefs, roundedRectPoints } from '../shared'

const STATION = 4
const W = 2.1
const H = 1.2
const Z_JITTER = [0.6, -0.5, 0.2, -0.8, 0.9, -0.2, 0.4, -0.6]

/** Constellation slots for n visible panels — a staggered grid at varied depth. */
function slots(n: number) {
  const rows = n <= 3 ? 1 : n <= 6 ? 2 : 3
  const perRow = Math.ceil(n / rows)
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / perRow)
    const c = i % perRow
    const inRow = Math.min(perRow, n - r * perRow)
    return new THREE.Vector3(
      (c - (inRow - 1) / 2) * 2.55 + (r % 2 ? 0.4 : -0.2),
      ((rows - 1) / 2 - r) * 1.62,
      Z_JITTER[i % Z_JITTER.length],
    )
  })
}

type Filter = Parameters<typeof matchesFilter>[1]
const targetCache = new Map<Filter, Map<string, { pos: THREE.Vector3; on: boolean }>>()

/** Where every panel should be for a filter: matches fill the slots, the rest recede. */
function targetsFor(filter: Filter) {
  let cached = targetCache.get(filter)
  if (!cached) targetCache.set(filter, (cached = computeTargets(filter)))
  return cached
}

function computeTargets(filter: Filter) {
  const all = slots(projects.length)
  const visible = projects.filter((p) => matchesFilter(p, filter))
  const shown = slots(visible.length)
  return new Map(
    projects.map((p, i) => {
      const vi = visible.indexOf(p)
      if (vi >= 0) return [p.id, { pos: shown[vi], on: true }]
      const home = all[i]
      return [p.id, { pos: new THREE.Vector3(home.x * 1.1, home.y * 0.8, home.z - 6), on: false }]
    }),
  )
}

/** Every technology gets a node on a concave back wall behind the panels. */
function techLayout() {
  const names = [...new Set(projects.flatMap((p) => p.tech))]
  const map = new Map<string, THREE.Vector3>()
  names.forEach((name, i) => {
    const r = Math.sqrt((i + 0.5) / names.length)
    const a = i * 2.39996
    map.set(name, new THREE.Vector3(Math.cos(a) * r * 6.4, Math.sin(a) * r * 3.3, -3.4 - (1 - r * r) * 2))
  })
  return map
}

const frame = roundedRectPoints(W + 0.02, H + 0.02, 0.07).map((p) => p.setZ(0.03))

function Panel({ project, index, positions }: { project: Project; index: number; positions: Map<string, THREE.Vector3> }) {
  const group = useRef<THREE.Group>(null)
  const outline = useRef<THREE.Group>(null)
  const texts = useRef<(THREE.Mesh & { fillOpacity: number })[]>([])
  const mat = useMemo(() => {
    const m = materials.panel(0.78)
    m.emissive.set(C.cyan)
    m.emissiveIntensity = 0
    return m
  }, [])
  const tilt = useMemo(() => new THREE.Quaternion(), [])
  const euler = useMemo(() => new THREE.Euler(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !isStationLive(STATION)) return
    const ui = useUi.getState()
    const target = targetsFor(ui.projectFilter).get(project.id)!
    const active = selectActiveProject(ui) === project.id && target.on
    const t = state.clock.elapsedTime
    const bob = motionPrefs.reduced ? 0 : Math.sin(t * 0.5 + index * 1.3) * 0.06

    // Spring toward the filter slot — panels physically travel when filters change.
    g.position.x += (target.pos.x - g.position.x) * k(3.2, dt)
    g.position.y += (target.pos.y + bob - g.position.y) * k(3.2, dt)
    g.position.z += (target.pos.z + (active ? 0.7 : 0) - g.position.z) * k(3.2, dt)
    positions.get(project.id)!.copy(g.position)

    // Face the camera; idle panels keep a slight inward angle, the active one squares up.
    euler.set(active ? 0 : -g.position.y * 0.03, active ? 0 : -g.position.x * 0.07, 0)
    tilt.setFromEuler(euler).premultiply(state.camera.quaternion)
    g.quaternion.slerp(tilt, k(5, dt))
    const s = target.on ? (active ? 1.08 : 1) : 0.82
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k(4, dt))

    const alpha = target.on ? 1 : 0.18
    mat.opacity += (0.78 * alpha - mat.opacity) * k(4, dt)
    mat.emissiveIntensity += ((active ? 0.08 : 0) - mat.emissiveIntensity) * k(6, dt)
    texts.current.forEach((tx) => (tx.fillOpacity += (alpha - tx.fillOpacity) * k(4, dt)))
    const m = lineMaterial(outline.current)
    if (m) {
      m.opacity += ((active ? 0.95 : target.on ? 0.25 : 0.04) - m.opacity) * k(6, dt)
    }
  })

  const set = useUi((s) => s.set)
  const visible = () => matchesFilter(project, useUi.getState().projectFilter)
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    if (!visible()) return
    e.stopPropagation()
    set({ projectHover: project.id, cursor3d: 'view' })
  }
  const onOut = () => {
    if (useUi.getState().projectHover === project.id) set({ projectHover: null, cursor3d: null })
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (!visible()) return
    e.stopPropagation()
    set({ openProject: project.id, cursor3d: null })
  }
  const keep = (i: number) => (m: (THREE.Mesh & { fillOpacity: number }) | null) => {
    if (m) texts.current[i] = m
  }

  return (
    <group ref={group}>
      <RoundedBox
        args={[W, H, 0.05]}
        radius={0.06}
        smoothness={3}
        material={mat}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      />
      <group ref={outline}>
        <Polyline points={frame} opacity={0.25} />
      </group>
      <Label ref={keep(0)} position={[-W / 2 + 0.14, H / 2 - 0.16, 0.03]} anchorX="left" fontSize={0.065} color={C.dim} letterSpacing={0.2}>
        {`P/${String(index + 1).padStart(2, '0')} · ${project.platform.toUpperCase()}`}
      </Label>
      <Label
        ref={keep(1)}
        position={[-W / 2 + 0.14, 0.08, 0.03]}
        anchorX="left"
        fontSize={0.155}
        color={C.ice}
        letterSpacing={0.01}
        maxWidth={W - 0.3}
      >
        {project.name}
      </Label>
      <Label ref={keep(2)} position={[-W / 2 + 0.14, -0.14, 0.03]} anchorX="left" fontSize={0.068} color={C.label} letterSpacing={0.1}>
        {(project.client ?? project.tags.map((t) => t.toUpperCase()).join(' · ')).toUpperCase()}
      </Label>
      <Label
        ref={keep(3)}
        position={[-W / 2 + 0.14, -H / 2 + 0.17, 0.03]}
        anchorX="left"
        fontSize={0.058}
        color={C.cyan}
        letterSpacing={0.06}
        maxWidth={W - 0.3}
      >
        {project.flow.slice(0, 3).join('  →  ')}
      </Label>
    </group>
  )
}

function TechDot({ name, pos }: { name: string; pos: THREE.Vector3 }) {
  const label = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const dot = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((_, dt) => {
    if (!isStationLive(STATION)) return
    const ui = useUi.getState()
    const id = selectActiveProject(ui)
    const p = id ? projects.find((x) => x.id === id) : null
    const related = !!p && p.tech.includes(name) && matchesFilter(p, ui.projectFilter)
    if (label.current) label.current.fillOpacity += ((related ? 0.95 : 0) - label.current.fillOpacity) * k(5, dt)
    if (dot.current) dot.current.opacity += ((related ? 1 : 0.3) - dot.current.opacity) * k(5, dt)
  })
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[0.055, 12, 12]} />
        <meshBasicMaterial ref={dot} color={C.ice} transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <Glow scale={0.3} opacity={0.2} />
      <Label ref={label} position-y={0.17} fontSize={0.09} color={C.ice} fillOpacity={0}>
        {name.toUpperCase()}
      </Label>
    </group>
  )
}

/** The highlighted project's technology chain, with data packets running along it. */
function ActiveChain({ techPos }: { techPos: Map<string, THREE.Vector3> }) {
  const active = useUi(selectActiveProject)
  const filter = useUi((s) => s.projectFilter)
  const chain = useMemo(() => {
    const p = projects.find((x) => x.id === active)
    if (!p || !matchesFilter(p, filter)) return null
    const start = targetsFor(filter).get(p.id)!.pos.clone().add(new THREE.Vector3(0, 0, 0.7))
    const pts = [start, ...p.flow.map((n) => techPos.get(n)!)]
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
    return { id: p.id, line: curve.getSpacedPoints(120) }
  }, [active, filter, techPos])

  if (!chain) return null
  return (
    <group key={chain.id}>
      <Polyline points={chain.line} opacity={0.55} color={C.cyan} />
      <FlowParticles paths={[chain.line]} count={7} speed={2.4} station={STATION} size={38} />
    </group>
  )
}

export function ProjectUniverse() {
  const techPos = useMemo(() => techLayout(), [])
  const positions = useMemo(() => new Map(projects.map((p) => [p.id, new THREE.Vector3()])), [])

  // Every project→technology spoke as one vertex-coloured line set, updated as panels move.
  const spokes = useMemo(() => {
    const pairs = projects.flatMap((p) => p.tech.map((t) => [p.id, t] as const))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(pairs.length * 6), 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(pairs.length * 6), 3))
    return { pairs, g }
  }, [])
  const color = useMemo(() => new THREE.Color(), [])
  const base = useMemo(() => new THREE.Color(C.cyanDeep), [])

  useFrame(() => {
    if (!isStationLive(STATION)) return
    const ui = useUi.getState()
    const active = selectActiveProject(ui)
    const pos = spokes.g.attributes.position as THREE.BufferAttribute
    const col = spokes.g.attributes.color as THREE.BufferAttribute
    spokes.pairs.forEach(([id, tech], i) => {
      const a = positions.get(id)!
      const b = techPos.get(tech)!
      pos.setXYZ(i * 2, a.x, a.y, a.z)
      pos.setXYZ(i * 2 + 1, b.x, b.y, b.z)
      const p = projects.find((x) => x.id === id)!
      const on = matchesFilter(p, ui.projectFilter)
      color.copy(base).multiplyScalar(id === active ? 0.9 : on ? 0.28 : 0.05)
      col.setXYZ(i * 2, color.r, color.g, color.b)
      col.setXYZ(i * 2 + 1, color.r * 0.4, color.g * 0.4, color.b * 0.4)
    })
    pos.needsUpdate = true
    col.needsUpdate = true
  })

  return (
    <group position={STATIONS[STATION].anchor}>
      <lineSegments geometry={spokes.g} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </lineSegments>
      {[...techPos].map(([name, pos]) => (
        <TechDot key={name} name={name} pos={pos} />
      ))}
      {projects.map((p, i) => (
        <Panel key={p.id} project={p} index={i} positions={positions} />
      ))}
      <ActiveChain techPos={techPos} />
    </group>
  )
}
