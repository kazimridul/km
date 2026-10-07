import * as THREE from 'three'
import fontUrl from '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff?url'
import { motionPrefs } from '../lib/motionPrefs'
import { scroll } from '../lib/scroll'

/** Troika can't read woff2, so the 3D labels load the woff build of the UI mono font. */
export const FONT = fontUrl

export const FOG_COLOR = '#08111f'
export const FOG_DENSITY = 0.03

/** Restrained palette: one cyan, one blue, an ice white and dimmed steel. */
export const C = {
  cyan: '#5fd4f4',
  cyanDeep: '#2b9cc4',
  blue: '#5b8cff',
  ice: '#e2f5ff',
  label: '#9cc3dc',
  dim: '#4b6a86',
  metal: '#1d2a3b',
  panel: '#0b1422',
} as const

export { motionPrefs }

/** Frame-rate independent smoothing factor. Collapses to 1 (snap) under reduced motion. */
export function k(lambda: number, dt: number) {
  return motionPrefs.reduced ? 1 : 1 - Math.exp(-lambda * Math.min(dt, 0.1))
}

/** A station renders when the camera is within reach of it (its neighbours stay visible in the fog). */
export function isStationLive(index: number) {
  return Math.abs(scroll.s - (index + 0.5)) < 1.75
}

/** World positions of nodes the camera can fly to (hero focus, stack clusters). */
export const worldTargets = new Map<string, THREE.Vector3>()

let glow: THREE.Texture | null = null

/** Soft radial falloff used for halos — a cheap stand-in for bloom. */
export function glowTexture() {
  if (glow) return glow
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.45)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.08)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  glow = new THREE.CanvasTexture(canvas)
  glow.colorSpace = THREE.SRGBColorSpace
  return glow
}

/** Gentle outward bow between two points so parallel edges don't overlap. */
export function bowedCurve(a: THREE.Vector3, b: THREE.Vector3, bow = 0.18, lift = 0.12) {
  const mid = a.clone().add(b).multiplyScalar(0.5)
  const dir = b.clone().sub(a)
  const perp = new THREE.Vector3(-dir.y, dir.x, 0).normalize().multiplyScalar(dir.length() * bow)
  mid.add(perp)
  mid.z += dir.length() * lift
  return new THREE.QuadraticBezierCurve3(a.clone(), mid, b.clone())
}

/** Rounded-rectangle outline as a closed point loop, for panel frames. */
export function roundedRectPoints(w: number, h: number, r: number, seg = 6) {
  const pts: THREE.Vector3[] = []
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ]
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= seg; i++) {
      const a = start + (i / seg) * (Math.PI / 2)
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0))
    }
  }
  pts.push(pts[0].clone())
  return pts
}

/** Deterministic PRNG so layouts are identical on every load. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** Shared physical materials. */
export const materials = {
  metal: () =>
    new THREE.MeshStandardMaterial({ color: C.metal, metalness: 0.9, roughness: 0.32, envMapIntensity: 0.9 }),
  steel: () =>
    new THREE.MeshStandardMaterial({ color: '#aebccb', metalness: 1, roughness: 0.26, envMapIntensity: 1.1 }),
  matte: () => new THREE.MeshStandardMaterial({ color: '#0f1826', metalness: 0.3, roughness: 0.75 }),
  /**
   * Translucent glass as a fresnel rim: nearly clear face-on, bright at grazing
   * angles. Reads as glass and costs a fraction of a transmissive/clearcoat
   * physical material — that one tanked integrated GPUs on overlapping spheres.
   */
  glass: (side: THREE.Side = THREE.FrontSide) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color('#8fd0ff') },
        uBase: { value: 0.05 },
        uRim: { value: 0.5 },
        ...THREE.UniformsLib.fog,
      },
      vertexShader: /* glsl */ `
        #include <fog_pars_vertex>
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mvPosition.xyz);
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <fog_pars_fragment>
        uniform vec3 uColor;
        uniform float uBase;
        uniform float uRim;
        varying vec3 vNormal;
        varying vec3 vView;
        void main() {
          float f = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 2.4);
          gl_FragColor = vec4(uColor * (0.55 + f * 0.9), uBase + f * uRim);
          #include <fog_fragment>
        }
      `,
      transparent: true,
      depthWrite: false,
      side,
      fog: true,
    }),
  /** Dark glassy panel without the clearcoat pass. */
  panel: (opacity = 0.8) =>
    new THREE.MeshStandardMaterial({
      color: C.panel,
      metalness: 0.45,
      roughness: 0.28,
      transparent: true,
      opacity,
      envMapIntensity: 1,
    }),
}

/** Concatenates curves into one arc-length polyline for FlowParticles. */
export function chainPath(curves: THREE.Curve<THREE.Vector3>[], samplesPerCurve = 40) {
  const pts: THREE.Vector3[] = []
  curves.forEach((c, i) => {
    const s = c.getSpacedPoints(samplesPerCurve)
    pts.push(...(i === 0 ? s : s.slice(1)))
  })
  return pts
}

/** The material of the first line under a group (Polyline wraps its line in a group). */
export function lineMaterial(group: THREE.Object3D | null) {
  let found: THREE.LineBasicMaterial | null = null
  group?.traverse((o) => {
    if (!found && (o as THREE.Line).isLine) found = (o as THREE.Line).material as THREE.LineBasicMaterial
  })
  return found as THREE.LineBasicMaterial | null
}
