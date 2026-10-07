import { Environment, Lightformer } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STATIONS } from './layout'
import { C, FOG_DENSITY, motionPrefs, rng, roundedRectPoints } from './shared'

/**
 * Lighting: a cool key, a cyan rim from behind and a dark ambient. Metals get
 * their highlights from a procedural environment rendered once (no HDR download).
 */
export function Lighting() {
  return (
    <>
      <ambientLight color="#6d8fc7" intensity={0.22} />
      <directionalLight color="#d6e8ff" position={[6, 9, 7]} intensity={1.1} />
      <directionalLight color={C.cyan} position={[-5, 2, -8]} intensity={0.9} />
      <hemisphereLight args={['#2a4a6e', '#05080f', 0.35]} />
      <Environment frames={1} resolution={128} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.2} color="#dfefff" position={[0, 6, 4]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color={C.cyan} position={[-7, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1} color={C.blue} position={[7, -1, -2]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#9ad8ff" position={[0, 0, -8]} scale={4} />
      </Environment>
    </>
  )
}

const dustVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.05 + aSeed * 6.28) * 0.6;
    p.y += cos(uTime * 0.04 + aSeed * 12.0) * 0.45;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = (1.0 + aSeed * 1.6) * uPixelRatio * clamp(18.0 / depth, 0.6, 2.4);
    float fog = exp(-${FOG_DENSITY.toFixed(4)} * ${FOG_DENSITY.toFixed(4)} * depth * depth * 0.55);
    vAlpha = (0.25 + aSeed * 0.45) * fog;
  }
`
const dustFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    gl_FragColor = vec4(uColor, smoothstep(0.5, 0.1, d) * vAlpha);
  }
`

/** Very slow ambient particles filling the whole corridor. */
function Dust({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null)
  const { positions, seeds } = useMemo(() => {
    const rand = rng(7)
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 70
      positions[i * 3 + 1] = (rand() - 0.4) * 34
      positions[i * 3 + 2] = 25 - rand() * 250
      seeds[i] = rand()
    }
    return { positions, seeds }
  }, [count])
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uColor: { value: new THREE.Color('#8fbfe6') }, uPixelRatio: { value: 1 } }),
    [],
  )
  useFrame((state) => {
    if (!mat.current) return
    mat.current.uniforms.uPixelRatio.value = state.viewport.dpr
    if (!motionPrefs.reduced) mat.current.uniforms.uTime.value = state.clock.elapsedTime
  })
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Faint portal frames the camera passes through between stations. */
function Gates() {
  const geometry = useMemo(() => {
    const zs = [-14, -46, -96, -132, -165, -192]
    const verts: number[] = []
    const rect = roundedRectPoints(30, 15, 1.2, 4)
    zs.forEach((z, gi) => {
      // Centre each gate on the line between the stations it separates.
      const a = STATIONS[Math.min(gi, STATIONS.length - 1)].anchor
      const b = STATIONS[Math.min(gi + 1, STATIONS.length - 1)].anchor
      const cx = (a[0] + b[0]) / 2
      const cy = (a[1] + b[1]) / 2
      for (const dz of [0, -0.8]) {
        for (let i = 0; i < rect.length - 1; i++) {
          verts.push(rect[i].x + cx, rect[i].y + cy, z + dz, rect[i + 1].x + cx, rect[i + 1].y + cy, z + dz)
        }
      }
      // Corner ticks.
      for (const [sx, sy] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        const x = cx + sx * 16.2
        const y = cy + sy * 8.2
        verts.push(x, y, z, x - sx * 1.2, y, z, x, y, z, x, y - sy * 1.2, z)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#4f8fc0" transparent opacity={0.07} depthWrite={false} />
    </lineSegments>
  )
}

/** Distant rack-like wireframe columns: the data centre the corridor runs through. */
function Racks() {
  const geometry = useMemo(() => {
    const rand = rng(21)
    const boxes: THREE.BufferGeometry[] = []
    for (let z = 10; z > -225; z -= 9) {
      for (const side of [-1, 1]) {
        const h = 5 + rand() * 9
        const box = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.2, h, 2.2))
        box.translate(side * (24 + rand() * 8), -7 + h / 2, z + rand() * 3)
        boxes.push(box)
      }
    }
    const verts: number[] = []
    boxes.forEach((b) => verts.push(...(b.attributes.position.array as Float32Array)))
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])
  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#3b6f99" transparent opacity={0.06} depthWrite={false} />
    </lineSegments>
  )
}

/**
 * Floor grid as plain line segments under the whole corridor. Fog fades it
 * with distance; far cheaper than a full-screen procedural grid shader.
 */
function FloorGrid() {
  const { minor, major } = useMemo(() => {
    const minor: number[] = []
    const major: number[] = []
    const x0 = -60
    const x1 = 60
    const z0 = 30
    const z1 = -235
    const y = -7
    for (let x = x0; x <= x1; x += 2) (x % 12 === 0 ? major : minor).push(x, y, z0, x, y, z1)
    for (let z = z0; z >= z1; z -= 2) (z % 12 === 0 ? major : minor).push(x0, y, z, x1, y, z)
    const geo = (v: number[]) => {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
      return g
    }
    return { minor: geo(minor), major: geo(major) }
  }, [])
  return (
    <>
      <lineSegments geometry={minor}>
        <lineBasicMaterial color="#12304a" transparent opacity={0.55} depthWrite={false} />
      </lineSegments>
      <lineSegments geometry={major}>
        <lineBasicMaterial color="#1d5578" transparent opacity={0.6} depthWrite={false} />
      </lineSegments>
    </>
  )
}

export function Background({ density }: { density: number }) {
  return (
    <>
      <Dust count={Math.round(3200 * density)} />
      <FloorGrid />
      <Gates />
      {density > 0.5 && <Racks />}
    </>
  )
}
