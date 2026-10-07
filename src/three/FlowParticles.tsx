import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { FOG_DENSITY, isStationLive, motionPrefs, rng } from './shared'

/**
 * Data packets that physically travel along polylines. Each packet is a head
 * plus a short fading trail, so it reads as directional flow rather than dust.
 *
 * Paths are sampled by arc length, so speed is constant in world units no
 * matter how unevenly the source curves were tessellated.
 */

type Props = {
  paths: THREE.Vector3[][]
  /** Packets per path before tier scaling. */
  count?: number
  /** World units per second. */
  speed?: number
  color?: string
  size?: number
  opacity?: number
  /** Per-path intensity 0..1, read every frame — mutate it to focus a flow. */
  weights?: { current: number[] }
  trail?: number
  station: number
  /** Global opacity multiplier, read every frame (e.g. section fade). */
  fade?: { current: number }
}

const vertex = /* glsl */ `
  attribute float aIntensity;
  attribute float aSize;
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vIntensity;
  varying float vFog;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float depth = -mv.z;
    gl_PointSize = uSize * aSize * uPixelRatio / max(depth, 0.5);
    vIntensity = aIntensity;
    vFog = exp(-${FOG_DENSITY.toFixed(4)} * ${FOG_DENSITY.toFixed(4)} * depth * depth);
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vIntensity;
  varying float vFog;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor * (1.0 + a * 0.6), a * uOpacity * vIntensity * vFog);
  }
`

type Sampler = { pts: THREE.Vector3[]; cum: number[]; length: number }

function makeSampler(pts: THREE.Vector3[]): Sampler {
  const cum = [0]
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]))
  return { pts, cum, length: Math.max(cum[cum.length - 1], 1e-4) }
}

function sampleAt(s: Sampler, t: number, out: THREE.Vector3) {
  const target = t * s.length
  let lo = 0
  let hi = s.cum.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (s.cum[mid] < target) lo = mid
    else hi = mid
  }
  const span = s.cum[hi] - s.cum[lo] || 1
  return out.lerpVectors(s.pts[lo], s.pts[hi], (target - s.cum[lo]) / span)
}

export function FlowParticles({
  paths,
  count = 6,
  speed = 1.2,
  color = '#7fe0ff',
  size = 34,
  opacity = 1,
  weights,
  trail = 3,
  station,
  fade,
}: Props) {
  const dpr = useThree((s) => s.viewport.dpr)
  const geo = useRef<THREE.BufferGeometry>(null)
  const mat = useRef<THREE.ShaderMaterial>(null)

  const sim = useMemo(() => {
    const rand = rng(paths.length * 97 + count)
    const samplers = paths.map(makeSampler)
    const perPath = Math.max(1, Math.round(count * motionPrefs.scale))
    const packets: { path: number; t: number; v: number; jitter: THREE.Vector3 }[] = []
    samplers.forEach((s, p) => {
      for (let i = 0; i < perPath; i++) {
        packets.push({
          path: p,
          t: (i + rand() * 0.6) / perPath,
          v: (0.75 + rand() * 0.5) / s.length,
          jitter: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.035),
        })
      }
    })
    const verts = packets.length * (trail + 1)
    const sizes = new Float32Array(verts)
    for (let i = 0; i < packets.length; i++) {
      for (let g = 0; g <= trail; g++) sizes[i * (trail + 1) + g] = g === 0 ? 1 : 0.75 - (g / (trail + 1)) * 0.45
    }
    return {
      samplers,
      packets,
      positions: new Float32Array(verts * 3),
      intensity: new Float32Array(verts),
      sizes,
      tmp: new THREE.Vector3(),
    }
  }, [paths, count, trail])

  // Colour/size are fixed per instance; dpr and opacity are pushed in the frame loop.
  const [uniforms] = useState(() => ({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
    uSize: { value: size },
    uPixelRatio: { value: dpr },
  }))

  const step = (dt: number) => {
    const { samplers, packets, positions, intensity, tmp } = sim
    const w = weights?.current
    const gap = 0.07
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i]
      const s = samplers[p.path]
      p.t = (p.t + dt * speed * p.v) % 1
      const pw = w ? (w[p.path] ?? 1) : 1
      for (let g = 0; g <= trail; g++) {
        const idx = i * (trail + 1) + g
        const tg = p.t - (g * gap) / s.length
        if (tg < 0) {
          intensity[idx] = 0
          continue
        }
        sampleAt(s, tg, tmp).add(p.jitter)
        positions[idx * 3] = tmp.x
        positions[idx * 3 + 1] = tmp.y
        positions[idx * 3 + 2] = tmp.z
        // Fade in at the source and out at the sink so packets don't pop.
        const edge = Math.min(1, tg / 0.06, (1 - tg) / 0.06)
        intensity[idx] = pw * edge * (g === 0 ? 1 : 0.55 - g * 0.1)
      }
    }
    if (geo.current) {
      geo.current.attributes.position.needsUpdate = true
      geo.current.attributes.aIntensity.needsUpdate = true
    }
  }

  // Seed positions once so a frozen (reduced-motion) scene still shows packets on the wires.
  const seeded = useRef(false)

  useFrame((_, dt) => {
    if (!isStationLive(station)) return
    if (mat.current) {
      mat.current.uniforms.uPixelRatio.value = dpr
      mat.current.uniforms.uOpacity.value = opacity * (fade ? fade.current : 1)
    }
    if (motionPrefs.reduced) {
      if (!seeded.current) {
        step(0)
        seeded.current = true
      }
      return
    }
    step(dt)
  })

  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geo}>
        <bufferAttribute attach="attributes-position" args={[sim.positions, 3]} />
        <bufferAttribute attach="attributes-aIntensity" args={[sim.intensity, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sim.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
