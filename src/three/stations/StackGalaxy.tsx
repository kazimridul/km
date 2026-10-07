import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { stackClusters, stackLinks } from '../../data/stack'
import type { StackCluster, StackTech } from '../../data/types'
import { useUi } from '../../store/ui'
import { FlowParticles } from '../FlowParticles'
import { STATIONS } from '../layout'
import { Glow, HitSphere, Label, Polyline } from '../primitives'
import { bowedCurve, C, isStationLive, k, materials, motionPrefs, worldTargets, lineMaterial } from '../shared'

const STATION = 3
const PANEL_W = 1.16
const PANEL_H = 0.3

let panelGeo: THREE.BufferGeometry | null = null
const panelGeometry = () => (panelGeo ??= new RoundedBoxGeometry(PANEL_W, PANEL_H, 0.04, 3, 0.04))

const panelOutline = (() => {
  const w = PANEL_W / 2 + 0.01
  const h = PANEL_H / 2 + 0.01
  return [
    new THREE.Vector3(-w, -h, 0.025),
    new THREE.Vector3(w, -h, 0.025),
    new THREE.Vector3(w, h, 0.025),
    new THREE.Vector3(-w, h, 0.025),
    new THREE.Vector3(-w, -h, 0.025),
  ]
})()

/** Cluster centres on a tilted ellipse around the core, at varied depth. */
function layout() {
  const clusters = stackClusters.map((c, i) => {
    const a = (i / stackClusters.length) * Math.PI * 2 + 0.35
    const center = new THREE.Vector3(Math.cos(a) * 4.2, Math.sin(a) * 3.1, Math.cos(a + 0.9) * 1.8)
    // Cards hang below the hub in a two-column stack (odd one out centred), at
    // slightly different depths so the cluster reads as a volume, not a list.
    const techs = c.techs.map((t, j) => {
      const n = c.techs.length
      const row = Math.floor(j / 2)
      const lastAlone = n % 2 === 1 && j === n - 1
      const x = lastAlone ? 0 : (j % 2 ? 0.64 : -0.64)
      const pos = center.clone().add(new THREE.Vector3(x, -0.42 - row * 0.38, (j % 3) * 0.12 - 0.12))
      return { tech: t, pos }
    })
    return { cluster: c, center, techs }
  })
  const techPos = new Map<string, THREE.Vector3>()
  clusters.forEach((c) => c.techs.forEach((t) => techPos.set(t.tech.name, t.pos)))
  return { clusters, techPos }
}

function TechNode({ tech, cluster, pos, index }: { tech: StackTech; cluster: StackCluster; pos: THREE.Vector3; index: number }) {
  const group = useRef<THREE.Group>(null)
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: C.panel,
        metalness: 0.6,
        roughness: 0.35,
        transparent: true,
        opacity: 0.88,
        emissive: C.cyan,
        emissiveIntensity: 0.03,
        envMapIntensity: 0.9,
      }),
    [],
  )
  const outline = useRef<THREE.Group>(null)
  const label = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const tmp = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !isStationLive(STATION)) return
    const ui = useUi.getState()
    const hovered = ui.techHover === tech.name
    const inCluster = ui.clusterHover === cluster.id
    const dim = (ui.clusterHover && !inCluster) || (ui.techHover && !hovered && !inCluster)
    const t = state.clock.elapsedTime
    const bob = motionPrefs.reduced ? 0 : Math.sin(t * 0.8 + index * 1.9) * 0.05

    // Hover pulls the card toward the camera.
    tmp.copy(pos)
    tmp.y += bob
    if (hovered && g.parent) {
      const cam = g.parent.worldToLocal(state.camera.position.clone())
      tmp.add(cam.sub(pos).normalize().multiplyScalar(0.7))
    }
    g.position.lerp(tmp, k(6, dt))
    g.quaternion.slerp(state.camera.quaternion, k(8, dt))
    const s = hovered ? 1.15 : dim ? 0.92 : 1
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k(6, dt))

    mat.emissiveIntensity += ((hovered ? 0.32 : inCluster ? 0.12 : 0.03) - mat.emissiveIntensity) * k(6, dt)
    mat.opacity += ((dim ? 0.35 : 0.88) - mat.opacity) * k(6, dt)
    if (label.current) label.current.fillOpacity += ((dim ? 0.3 : 1) - label.current.fillOpacity) * k(6, dt)
    const m = lineMaterial(outline.current)
    if (m) {
      m.opacity += ((hovered ? 0.95 : inCluster ? 0.55 : dim ? 0.06 : 0.22) - m.opacity) * k(6, dt)
    }
  })

  const set = useUi((s) => s.set)
  const tooltip = (e: ThreeEvent<PointerEvent>) => ({
    title: tech.name,
    lines: [tech.blurb, cluster.title.toUpperCase()],
    x: e.nativeEvent.clientX,
    y: e.nativeEvent.clientY,
  })
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    set({ techHover: tech.name, cursor3d: 'explore', tooltip: tooltip(e) })
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (useUi.getState().techHover === tech.name) set({ tooltip: tooltip(e) })
  }
  const onOut = () => {
    if (useUi.getState().techHover === tech.name) set({ techHover: null, cursor3d: null, tooltip: null })
  }

  return (
    <group ref={group} position={pos}>
      <mesh geometry={panelGeometry()} material={mat} onPointerOver={onOver} onPointerMove={onMove} onPointerOut={onOut} />
      <group ref={outline}>
        <Polyline points={panelOutline} opacity={0.22} />
      </group>
      <Label ref={label} position-z={0.03} fontSize={0.098} color={C.ice} letterSpacing={0.05}>
        {tech.name}
      </Label>
    </group>
  )
}

function ClusterHub({ cluster, center }: { cluster: StackCluster; center: THREE.Vector3 }) {
  const group = useRef<THREE.Group>(null)
  const label = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const metal = useMemo(() => {
    const m = materials.metal()
    m.flatShading = true
    return m
  }, [])
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !isStationLive(STATION)) return
    const hover = useUi.getState().clusterHover
    const active = hover === cluster.id
    g.quaternion.slerp(state.camera.quaternion, k(8, dt))
    if (label.current) label.current.fillOpacity += ((hover && !active ? 0.3 : 1) - label.current.fillOpacity) * k(6, dt)
    worldTargets.set(`cluster:${cluster.id}`, g.getWorldPosition(world))
  })

  const set = useUi((s) => s.set)
  return (
    <group ref={group} position={center}>
      <mesh material={metal}>
        <octahedronGeometry args={[0.09, 0]} />
      </mesh>
      <Glow scale={0.7} opacity={0.4} />
      <Label ref={label} position-y={0.22} fontSize={0.13} color={C.cyan} letterSpacing={0.24}>
        {cluster.title.toUpperCase()}
      </Label>
      <HitSphere
        radius={0.3}
        onPointerOver={(e) => {
          e.stopPropagation()
          set({ clusterHover: cluster.id, cursor3d: 'explore' })
        }}
        onPointerOut={() => {
          if (useUi.getState().clusterHover === cluster.id) set({ clusterHover: null, cursor3d: null })
        }}
      />
    </group>
  )
}

function EngineeringCore() {
  const shell = useRef<THREE.Mesh>(null)
  const metal = useMemo(() => materials.metal(), [])
  useFrame((_, dt) => {
    if (!shell.current || !isStationLive(STATION) || motionPrefs.reduced) return
    shell.current.rotation.y += dt * 0.12
    shell.current.rotation.x += dt * 0.05
  })
  return (
    <group>
      <mesh ref={shell}>
        <icosahedronGeometry args={[0.78, 1]} />
        <meshBasicMaterial color={C.cyan} wireframe transparent opacity={0.16} toneMapped={false} />
      </mesh>
      <mesh material={metal}>
        <sphereGeometry args={[0.42, 40, 40]} />
      </mesh>
      <Glow scale={2.4} opacity={0.3} />
      <Label position-y={-1.05} fontSize={0.13} color={C.ice} letterSpacing={0.3}>
        ENGINEERING CORE
      </Label>
    </group>
  )
}

export function StackGalaxy() {
  const group = useRef<THREE.Group>(null)
  const { clusters, techPos } = useMemo(() => layout(), [])

  // Faint structure: core → hubs → cards.
  const structure = useMemo(() => {
    const verts: number[] = []
    clusters.forEach((c) => {
      verts.push(0, 0, 0, c.center.x, c.center.y, c.center.z)
      c.techs.forEach((t) => verts.push(c.center.x, c.center.y, c.center.z, t.pos.x, t.pos.y, t.pos.z))
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [clusters])

  const links = useMemo(
    () =>
      stackLinks
        .filter(([a, b]) => techPos.has(a) && techPos.has(b))
        .map(([a, b]) => ({ a, b, curve: bowedCurve(techPos.get(a)!, techPos.get(b)!, 0.1, 0.15) })),
    [techPos],
  )
  const linkPaths = useMemo(() => links.map((l) => l.curve.getSpacedPoints(40)), [links])
  const weights = useRef(links.map(() => 0.6))
  const clusterOf = useMemo(() => {
    const m = new Map<string, string>()
    stackClusters.forEach((c) => c.techs.forEach((t) => m.set(t.name, c.id)))
    return m
  }, [])

  useFrame((state, dt) => {
    if (!group.current || !isStationLive(STATION)) return
    if (!motionPrefs.reduced) {
      group.current.rotation.y += (Math.sin(state.clock.elapsedTime * 0.05) * 0.14 - group.current.rotation.y) * k(1.2, dt)
    }
    const ui = useUi.getState()
    links.forEach((l, i) => {
      const on =
        ui.techHover === l.a ||
        ui.techHover === l.b ||
        (ui.clusterHover && (clusterOf.get(l.a) === ui.clusterHover || clusterOf.get(l.b) === ui.clusterHover))
      weights.current[i] = ui.techHover || ui.clusterHover ? (on ? 1 : 0.08) : 0.6
    })
  })

  return (
    <group ref={group} position={STATIONS[STATION].anchor}>
      <EngineeringCore />
      <lineSegments geometry={structure}>
        <lineBasicMaterial color={C.cyanDeep} transparent opacity={0.12} depthWrite={false} />
      </lineSegments>
      {links.map((l) => (
        <Polyline key={`${l.a}>${l.b}`} points={l.curve.getSpacedPoints(32)} opacity={0.18} color={C.blue} />
      ))}
      {clusters.map((c) => (
        <ClusterHub key={c.cluster.id} cluster={c.cluster} center={c.center} />
      ))}
      {clusters.flatMap((c) =>
        c.techs.map((t, j) => (
          <TechNode key={t.tech.name} tech={t.tech} cluster={c.cluster} pos={t.pos} index={j + c.techs.length} />
        )),
      )}
      <FlowParticles paths={linkPaths} count={3} speed={0.9} size={28} weights={weights} station={STATION} />
      <CoreFeeds centers={clusters.map((c) => c.center)} />
    </group>
  )
}

/** Slow packets from the core out to every cluster. */
function CoreFeeds({ centers }: { centers: THREE.Vector3[] }) {
  const paths = useMemo(
    () => centers.map((c) => bowedCurve(new THREE.Vector3(), c, 0.06, 0.05).getSpacedPoints(30)),
    [centers],
  )
  return <FlowParticles paths={paths} count={2} speed={0.7} size={22} trail={2} color="#bfe9ff" station={STATION} />
}

