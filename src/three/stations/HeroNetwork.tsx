import { RoundedBox } from '@react-three/drei'
import { type ThreeEvent, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { type HeroNode, heroFlows, heroNeighbors, heroNodeById, heroNodes } from '../../data/heroNetwork'
import { useUi } from '../../store/ui'
import { FlowParticles } from '../FlowParticles'
import { STATIONS, v3 } from '../layout'
import { Glow, HitSphere, Label, Pipe, Polyline } from '../primitives'
import { bowedCurve, C, chainPath, isStationLive, k, materials, motionPrefs, worldTargets } from '../shared'

const STATION = 0

type Glowing = { current: number }

/** Emissive material whose intensity follows a shared glow ref. */
function useEmissive(color: string, base: number, glow: Glowing) {
  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#05121c',
        emissive: color,
        emissiveIntensity: base,
        toneMapped: false,
        metalness: 0.2,
        roughness: 0.5,
      }),
    [color, base],
  )
  useFrame(() => {
    if (isStationLive(STATION)) mat.emissiveIntensity = base * glow.current
  })
  return mat
}

function Terminal({ glow }: { glow: Glowing }) {
  const metal = useMemo(() => materials.metal(), [])
  const screen = useEmissive(C.cyan, 0.18, glow)
  const bars = useEmissive(C.cyan, 1.3, glow)
  return (
    <group>
      <RoundedBox args={[0.68, 0.46, 0.12]} radius={0.04} smoothness={3} material={metal} />
      <mesh position={[0, 0, 0.062]} material={screen}>
        <planeGeometry args={[0.58, 0.36]} />
      </mesh>
      {[0.3, 0.42, 0.22, 0.34].map((w, i) => (
        <mesh key={i} position={[-0.24 + w / 2, 0.11 - i * 0.07, 0.064]} material={bars}>
          <planeGeometry args={[w, 0.022]} />
        </mesh>
      ))}
    </group>
  )
}

function Funnel({ glow }: { glow: Glowing }) {
  const glass = useMemo(() => materials.glass(THREE.DoubleSide), [])
  const ring = useEmissive(C.cyan, 1.1, glow)
  return (
    <group rotation-z={Math.PI / 2}>
      <mesh material={glass}>
        <cylinderGeometry args={[0.36, 0.1, 0.55, 28, 1, true]} />
      </mesh>
      <mesh position-y={0.275} rotation-x={Math.PI / 2} material={ring}>
        <torusGeometry args={[0.36, 0.008, 6, 48]} />
      </mesh>
      <mesh position-y={-0.275} rotation-x={Math.PI / 2} material={ring}>
        <torusGeometry args={[0.1, 0.008, 6, 24]} />
      </mesh>
      <mesh position-y={0.02} rotation-x={Math.PI / 2} material={ring}>
        <torusGeometry args={[0.23, 0.004, 6, 36]} />
      </mesh>
    </group>
  )
}

function Stream({ glow }: { glow: Glowing }) {
  const metal = useMemo(() => materials.metal(), [])
  const glass = useMemo(() => materials.glass(), [])
  const core = useEmissive(C.cyan, 1.2, glow)
  const group = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (!group.current || !isStationLive(STATION) || motionPrefs.reduced) return
    group.current.children.forEach((c, i) => {
      c.position.y = Math.sin(state.clock.elapsedTime * 1.4 + i * 1.2) * 0.025
    })
  })
  return (
    <group>
      <mesh rotation-z={Math.PI / 2} material={glass}>
        <capsuleGeometry args={[0.2, 0.62, 6, 16]} />
      </mesh>
      <group ref={group}>
        {[-0.3, 0, 0.3].map((x) => (
          <group key={x} position-x={x}>
            <mesh material={metal}>
              <sphereGeometry args={[0.1, 20, 20]} />
            </mesh>
            <mesh material={core}>
              <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh rotation-z={Math.PI / 2} material={core}>
        <cylinderGeometry args={[0.008, 0.008, 0.6, 6]} />
      </mesh>
    </group>
  )
}

function Core({ glow }: { glow: Glowing }) {
  const outer = useRef<THREE.Mesh>(null)
  const inner = useRef<THREE.Mesh>(null)
  const metal = useMemo(() => {
    const m = materials.metal()
    m.flatShading = true
    return m
  }, [])
  const wire = useRef<THREE.MeshBasicMaterial>(null)
  useFrame((_, dt) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    if (outer.current) {
      outer.current.rotation.y += dt * 0.25
      outer.current.rotation.x += dt * 0.08
    }
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.5
      inner.current.rotation.z += dt * 0.2
    }
    if (wire.current) wire.current.opacity = 0.28 * glow.current
  })
  return (
    <group>
      <mesh ref={outer}>
        <icosahedronGeometry args={[0.48, 0]} />
        <meshBasicMaterial ref={wire} color={C.cyan} wireframe transparent opacity={0.28} toneMapped={false} />
      </mesh>
      <mesh ref={inner} material={metal}>
        <octahedronGeometry args={[0.24, 0]} />
      </mesh>
      <Glow scale={1.1} opacity={0.35} />
    </group>
  )
}

function Cylinder({ glow, r = 0.4, h = 0.66, rings = 3 }: { glow: Glowing; r?: number; h?: number; rings?: number }) {
  const metal = useMemo(() => materials.metal(), [])
  const ringMat = useEmissive(C.cyan, 1.2, glow)
  const cap = useEmissive(C.cyan, 0.25, glow)
  const ringRefs = useRef<THREE.Mesh[]>([])
  useFrame((state) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    // Rings pulse in sequence like rows being written.
    ringRefs.current.forEach((m, i) => {
      const p = (Math.sin(state.clock.elapsedTime * 2 - i * 0.9) + 1) / 2
      m.scale.setScalar(1 + p * 0.025)
    })
  })
  return (
    <group>
      <mesh material={metal}>
        <cylinderGeometry args={[r, r, h, 40]} />
      </mesh>
      <mesh position-y={h / 2 + 0.002} rotation-x={-Math.PI / 2} material={cap}>
        <circleGeometry args={[r * 0.88, 40]} />
      </mesh>
      {Array.from({ length: rings }, (_, i) => (
        <mesh
          key={i}
          ref={(m) => {
            if (m) ringRefs.current[i] = m
          }}
          position-y={-h / 2 + ((i + 1) * h) / (rings + 1)}
          rotation-x={Math.PI / 2}
          material={ringMat}
        >
          <torusGeometry args={[r + 0.006, 0.009, 6, 56]} />
        </mesh>
      ))}
    </group>
  )
}

function Service({ glow }: { glow: Glowing }) {
  const metal = useMemo(() => materials.metal(), [])
  const face = useEmissive(C.cyan, 0.5, glow)
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 6)), [])
  return (
    <group rotation-x={Math.PI / 2}>
      <mesh material={metal}>
        <cylinderGeometry args={[0.32, 0.32, 0.2, 6]} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={C.cyan} transparent opacity={0.55} toneMapped={false} />
      </lineSegments>
      <mesh position-y={0.102} rotation-x={-Math.PI / 2} material={face}>
        <circleGeometry args={[0.16, 6]} />
      </mesh>
    </group>
  )
}

function Orchestrator({ glow }: { glow: Glowing }) {
  const metal = useMemo(() => materials.metal(), [])
  const dot = useEmissive(C.cyan, 1.4, glow)
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (spin.current && isStationLive(STATION) && !motionPrefs.reduced) spin.current.rotation.z += dt * 0.35
  })
  const spokes = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 0.34, Math.sin(a) * 0.34, 0)]
      }),
    [],
  )
  return (
    <group>
      <mesh material={metal}>
        <torusGeometry args={[0.34, 0.02, 10, 64]} />
      </mesh>
      <mesh material={metal}>
        <sphereGeometry args={[0.09, 20, 20]} />
      </mesh>
      <group ref={spin}>
        {spokes.map((pts, i) => (
          <group key={i}>
            <Polyline points={pts} opacity={0.3} />
            <mesh position={pts[1]} material={dot}>
              <sphereGeometry args={[0.045, 12, 12]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Overlapping glass spheres — a soft infrastructure cluster. Reused by About. */
export function CloudCluster({ scale = 1 }: { scale?: number }) {
  const glass = useMemo(() => materials.glass(), [])
  const spheres: [number, number, number, number][] = [
    [0, 0, 0, 0.62],
    [0.6, 0.15, -0.1, 0.48],
    [-0.58, 0.05, 0.1, 0.5],
    [0.2, 0.45, 0.2, 0.4],
    [-0.25, -0.35, -0.15, 0.42],
    [0.45, -0.32, 0.25, 0.34],
  ]
  return (
    <group scale={scale}>
      {spheres.map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={glass}>
          <sphereGeometry args={[r, 24, 18]} />
        </mesh>
      ))}
      <Glow scale={1.8} opacity={0.12} color={C.blue} />
    </group>
  )
}

function Satellite({ glow }: { glow: Glowing }) {
  const metal = useMemo(() => {
    const m = materials.metal()
    m.flatShading = true
    return m
  }, [])
  const ring = useEmissive(C.cyan, 0.9, glow)
  return (
    <group>
      <mesh material={metal}>
        <octahedronGeometry args={[0.14, 0]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} material={ring}>
        <torusGeometry args={[0.22, 0.005, 6, 40]} />
      </mesh>
    </group>
  )
}

function App({ glow }: { glow: Glowing }) {
  const panel = useMemo(() => materials.panel(0.88), [])
  const bars = useEmissive(C.cyan, 0.9, glow)
  const accent = useEmissive(C.blue, 1, glow)
  const frame = useMemo(() => {
    const pts: THREE.Vector3[] = []
    const w = 1.02
    const h = 0.68
    pts.push(
      new THREE.Vector3(-w / 2, -h / 2, 0.045),
      new THREE.Vector3(w / 2, -h / 2, 0.045),
      new THREE.Vector3(w / 2, h / 2, 0.045),
      new THREE.Vector3(-w / 2, h / 2, 0.045),
      new THREE.Vector3(-w / 2, -h / 2, 0.045),
    )
    return pts
  }, [])
  return (
    <group>
      <RoundedBox args={[1.02, 0.68, 0.08]} radius={0.04} smoothness={3} material={panel} />
      <Polyline points={frame} opacity={0.45} />
      {[0.18, 0.3, 0.22, 0.38, 0.27].map((h, i) => (
        <mesh key={i} position={[-0.34 + i * 0.12, -0.24 + h / 2, 0.046]} material={i === 3 ? accent : bars}>
          <planeGeometry args={[0.07, h]} />
        </mesh>
      ))}
      <mesh position={[0.3, 0.16, 0.046]} material={bars}>
        <planeGeometry args={[0.28, 0.02]} />
      </mesh>
      <mesh position={[0.26, 0.09, 0.046]} material={bars}>
        <planeGeometry args={[0.2, 0.02]} />
      </mesh>
    </group>
  )
}

const LABEL_OFFSET: Record<HeroNode['kind'], number> = {
  terminal: -0.42,
  funnel: -0.5,
  stream: -0.36,
  core: -0.66,
  warehouse: -0.58,
  service: -0.46,
  database: -0.45,
  orchestrator: -0.52,
  cloud: 1.0,
  satellite: -0.3,
  app: -0.52,
}

const HIT_RADIUS: Partial<Record<HeroNode['kind'], number>> = { cloud: 0.95, app: 0.6, satellite: 0.28 }

function NodeShape({ kind, glow }: { kind: HeroNode['kind']; glow: Glowing }) {
  switch (kind) {
    case 'terminal':
      return <Terminal glow={glow} />
    case 'funnel':
      return <Funnel glow={glow} />
    case 'stream':
      return <Stream glow={glow} />
    case 'core':
      return <Core glow={glow} />
    case 'warehouse':
      return <Cylinder glow={glow} />
    case 'database':
      return <Cylinder glow={glow} r={0.28} h={0.44} rings={2} />
    case 'service':
      return <Service glow={glow} />
    case 'orchestrator':
      return <Orchestrator glow={glow} />
    case 'cloud':
      return <CloudCluster />
    case 'satellite':
      return <Satellite glow={glow} />
    case 'app':
      return <App glow={glow} />
  }
}

function tooltipFor(node: HeroNode, e: ThreeEvent<PointerEvent>) {
  return { title: node.title, lines: [node.description, node.tech.join(' • ')], x: e.nativeEvent.clientX, y: e.nativeEvent.clientY }
}

function NetworkNode({ node, index }: { node: HeroNode; index: number }) {
  const group = useRef<THREE.Group>(null)
  const label = useRef<THREE.Mesh & { fillOpacity: number }>(null)
  const glow = useRef(1)
  const base = useMemo(() => v3(node.position), [node.position])
  const world = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g || !isStationLive(STATION)) return
    const ui = useUi.getState()
    const focus = ui.heroHover ?? ui.heroFocus
    const role = !focus ? 'idle' : focus === node.id ? 'active' : heroNeighbors(focus).has(node.id) ? 'near' : 'dim'
    const targetGlow = { idle: 1, active: 2.1, near: 1.35, dim: 0.3 }[role]
    glow.current += (targetGlow - glow.current) * k(6, dt)

    // Low-gravity float, plus a lean toward the cursor.
    const t = state.clock.elapsedTime
    const bob = motionPrefs.reduced ? 0 : Math.sin(t * 0.7 + index * 1.7) * 0.06
    const forward = role === 'active' ? 0.3 : 0
    g.position.x += (base.x - g.position.x) * k(5, dt)
    g.position.y += (base.y + bob - g.position.y) * k(5, dt)
    g.position.z += (base.z + forward - g.position.z) * k(5, dt)
    const s = role === 'active' ? 1.12 : 1
    g.scale.setScalar(g.scale.x + (s - g.scale.x) * k(6, dt))
    if (motionPrefs.finePointer && !motionPrefs.reduced) {
      g.rotation.y += (state.pointer.x * 0.35 - g.rotation.y) * k(3, dt)
      g.rotation.x += (-state.pointer.y * 0.2 - g.rotation.x) * k(3, dt)
    }
    if (label.current) {
      const o = role === 'dim' ? 0.25 : role === 'active' ? 1 : 0.8
      label.current.fillOpacity += (o - label.current.fillOpacity) * k(6, dt)
    }
    // Registered every frame (not in a memo) so StrictMode's double-invoke can't orphan it.
    worldTargets.set(`hero:${node.id}`, g.getWorldPosition(world))
  })

  const set = useUi((s) => s.set)
  const onOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    set({ heroHover: node.id, cursor3d: 'hover', tooltip: tooltipFor(node, e) })
  }
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (useUi.getState().heroHover === node.id) set({ tooltip: tooltipFor(node, e) })
  }
  const onOut = () => {
    if (useUi.getState().heroHover === node.id) set({ heroHover: null, cursor3d: null, tooltip: null })
  }
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const current = useUi.getState().heroFocus
    set({ heroFocus: current === node.id ? null : node.id, tooltip: null })
  }

  const isSmall = node.kind === 'satellite'
  return (
    <group ref={group} position={node.position}>
      <NodeShape kind={node.kind} glow={glow} />
      <Label
        ref={label}
        position-y={LABEL_OFFSET[node.kind]}
        fontSize={isSmall ? 0.09 : node.kind === 'cloud' ? 0.12 : 0.085}
        color={isSmall ? C.label : C.ice}
        fillOpacity={0.8}
      >
        {node.label}
      </Label>
      <HitSphere
        radius={HIT_RADIUS[node.kind] ?? 0.45}
        onPointerOver={onOver}
        onPointerMove={onMove}
        onPointerOut={onOut}
        onClick={onClick}
      />
    </group>
  )
}

export function HeroNetwork() {
  const group = useRef<THREE.Group>(null)

  const { edges, flows } = useMemo(() => {
    const edgeMap = new Map<string, { a: string; b: string; curve: THREE.Curve<THREE.Vector3>; kind: string }>()
    const flows = heroFlows.map((f) => {
      const curves = f.ids.slice(1).map((id, i) => {
        const a = f.ids[i]
        const key = `${a}>${id}`
        if (!edgeMap.has(key)) {
          const bow = f.kind === 'control' ? 0.1 : f.kind === 'cloud' ? -0.12 : 0.14
          edgeMap.set(key, {
            a,
            b: id,
            kind: f.kind,
            curve: bowedCurve(v3(heroNodeById[a].position), v3(heroNodeById[id].position), bow, 0.08),
          })
        }
        return edgeMap.get(key)!.curve
      })
      return { kind: f.kind, path: chainPath(curves), ids: f.ids }
    })
    return { edges: [...edgeMap.values()], flows }
  }, [])

  const edgeOpacity = useMemo(() => edges.map(() => ({ current: 0.3 })), [edges])
  const dataWeights = useRef(flows.filter((f) => f.kind === 'data').map(() => 1))
  const sideWeights = useRef(flows.filter((f) => f.kind !== 'data').map(() => 1))

  useFrame((state, dt) => {
    if (!group.current || !isStationLive(STATION)) return
    const t = state.clock.elapsedTime
    // Extremely slow sway rather than a constant spin.
    if (!motionPrefs.reduced) {
      group.current.rotation.y += (Math.sin(t * 0.06) * 0.22 - group.current.rotation.y) * k(1.5, dt)
      group.current.rotation.x = Math.sin(t * 0.045) * 0.04
    }

    const ui = useUi.getState()
    const focus = ui.heroHover ?? ui.heroFocus
    edges.forEach((e, i) => {
      const base = e.kind === 'data' ? 0.32 : 0.16
      edgeOpacity[i].current = !focus ? base : e.a === focus || e.b === focus ? 0.8 : base * 0.25
    })
    const w = (ids: string[]) => (!focus ? 1 : ids.includes(focus) ? 1 : 0.15)
    flows.filter((f) => f.kind === 'data').forEach((f, i) => (dataWeights.current[i] = w(f.ids)))
    flows.filter((f) => f.kind !== 'data').forEach((f, i) => (sideWeights.current[i] = w(f.ids)))
  })

  const onMissed = () => {
    if (useUi.getState().heroFocus) useUi.getState().set({ heroFocus: null })
  }

  return (
    <group ref={group} position={STATIONS[STATION].anchor} onPointerMissed={onMissed}>
      {edges.map((e, i) =>
        e.kind === 'data' ? (
          <Pipe key={`${e.a}>${e.b}`} curve={e.curve} opacity={edgeOpacity[i]} station={STATION} radius={0.011} />
        ) : (
          <Pipe
            key={`${e.a}>${e.b}`}
            curve={e.curve}
            opacity={edgeOpacity[i]}
            station={STATION}
            radius={0.006}
            color={e.kind === 'control' ? C.ice : C.blue}
          />
        ),
      )}
      {heroNodes.map((n, i) => (
        <NetworkNode key={n.id} node={n} index={i} />
      ))}
      <FlowParticles
        paths={flows.filter((f) => f.kind === 'data').map((f) => f.path)}
        count={9}
        speed={1.15}
        weights={dataWeights}
        station={STATION}
      />
      <FlowParticles
        paths={flows.filter((f) => f.kind !== 'data').map((f) => f.path)}
        count={3}
        speed={0.6}
        size={24}
        color="#bfe9ff"
        trail={2}
        weights={sideWeights}
        station={STATION}
      />
    </group>
  )
}
