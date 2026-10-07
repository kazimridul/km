import * as THREE from 'three'

/**
 * World layout. One continuous space along −Z: each section is a "station"
 * the camera flies to, and neighbouring stations stay visible in the fog.
 *
 * `side` is where the 3D sits on wide screens (+1 right, −1 left) — the HTML
 * column takes the other half. The camera shifts instead of the world, so the
 * scene never reflows on resize.
 */
export type StationDef = {
  anchor: [number, number, number]
  side: 1 | -1
  /** Radius that must stay in frame on narrow screens. */
  fit: number
  /** Narrow screens: push content up by this fraction of the half-height. */
  lift?: number
}

export const STATIONS: StationDef[] = [
  { anchor: [0, 0, 0], side: 1, fit: 3.1, lift: 0.44 }, // hero
  { anchor: [7, 0.8, -32], side: 1, fit: 2.4, lift: 0.1 }, // about
  { anchor: [12, -0.8, -64], side: 1, fit: 2 }, // experience (rail)
  { anchor: [4, 0.6, -116], side: -1, fit: 4.6 }, // stack
  { anchor: [6, 0, -150], side: 1, fit: 3.6 }, // projects
  { anchor: [-1.5, 0.2, -180], side: -1, fit: 1.6, lift: 0.36 }, // education
  { anchor: [3, 0, -204], side: 1, fit: 2.7, lift: 0.12 }, // contact
]

export const RAIL = {
  x: STATIONS[2].anchor[0],
  y: STATIONS[2].anchor[1],
  z0: -52,
  z1: -88,
  milestones: [
    { label: '2020', z: -55, caption: 'NAZTECH INC' },
    { label: '2022', z: -67, caption: 'BE DATA SOLUTIONS' },
    { label: '2026+', z: -80, caption: 'NEXT' },
  ],
}

export const v3 = (a: [number, number, number]) => new THREE.Vector3(...a)

type Keyframe = { s: number; pos: THREE.Vector3; look: THREE.Vector3 }

export function fovFor(wide: boolean) {
  return wide ? 42 : 54
}

/**
 * Camera keyframes, keyed by the scroll station value `s` (see lib/scroll).
 * Rebuilt on resize because the side-shift depends on aspect ratio.
 */
export function buildKeyframes(width: number, height: number, measured: number[] = []): Keyframe[] {
  const wide = width >= 1024
  const aspect = Math.min(width / height, 2.1)
  const tanHalf = Math.tan(THREE.MathUtils.degToRad(fovFor(wide) / 2))

  const frame = (i: number, dist: number, dir: [number, number, number] = [0, 0.1, 1]) => {
    const st = STATIONS[i]
    const d = wide ? dist : Math.max(dist, st.fit / (tanHalf * aspect * 0.9))
    const shift = wide ? 0.5 * d * tanHalf * aspect * st.side : 0
    const lift = wide ? 0 : (st.lift ?? 0) * d * tanHalf
    const look = v3(st.anchor).add(new THREE.Vector3(-shift, -lift, 0))
    const pos = look.clone().add(new THREE.Vector3(...dir).normalize().multiplyScalar(d))
    return { pos, look }
  }

  const kf = (s: number, f: { pos: THREE.Vector3; look: THREE.Vector3 }): Keyframe => ({ s, ...f })

  // Along the rail: the camera rides beside it (wide) or above it (narrow). On wide
  // screens it yaws left a touch so the rail's vanishing point sits in the 3D half,
  // clear of the HTML cards.
  const rail = (s: number, zc: number) => {
    const off = wide ? 2.2 : 0
    return kf(s, {
      pos: new THREE.Vector3(RAIL.x - off, RAIL.y + (wide ? 1.4 : 2.6), zc + 8.5),
      look: new THREE.Vector3(RAIL.x - off - (wide ? 1.7 : 0), RAIL.y + (wide ? 0.3 : -0.4), zc - 4),
    })
  }
  // Milestone stations come from the real card positions when available.
  const ms = measured.length === 3 ? measured : [2.22, 2.58, 2.86]
  const [m0, m1, m2] = RAIL.milestones.map((m) => m.z)

  const hero = STATIONS[0].anchor
  const about = frame(1, 9, [-0.1, 0.16, 1])

  return [
    kf(0.5, frame(0, 10.2, [0, 0.06, 1])),
    kf(0.82, frame(0, 13.5, [0.16, 0.22, 1])),
    // Fly through the hero network on the way out.
    kf(1.1, {
      pos: new THREE.Vector3(hero[0] + 0.6, hero[1] + 0.5, hero[2] - 1.5),
      look: about.look.clone().lerp(new THREE.Vector3(hero[0], hero[1], hero[2] - 12), 0.5),
    }),
    kf(1.42, about),
    kf(1.72, frame(1, 8.4, [0.06, 0.2, 1])),
    kf(2.06, {
      pos: new THREE.Vector3(RAIL.x - 1, RAIL.y + 3.4, RAIL.z0 + 13),
      look: new THREE.Vector3(RAIL.x, RAIL.y, RAIL.z0 - 2),
    }),
    rail(ms[0], m0),
    rail((ms[0] + ms[1]) / 2, (m0 + m1) / 2),
    rail(ms[1], m1),
    rail(ms[2], m2),
    kf(3.14, frame(3, 20, [0.25, 0.3, 1])),
    kf(3.42, frame(3, 15.5, [0.1, 0.14, 1])),
    kf(3.72, frame(3, 14.5, [-0.08, 0.1, 1])),
    kf(4.1, frame(4, 18, [0.1, 0.18, 1])),
    kf(4.45, frame(4, 12.5, [0.02, 0.08, 1])),
    kf(4.8, frame(4, 11.5, [-0.06, 0.04, 1])),
    kf(5.3, frame(5, 8.5, [0.12, 0.1, 1])),
    kf(5.7, frame(5, 8, [-0.08, 0.14, 1])),
    kf(6.3, frame(6, 10, [0.06, 0.08, 1])),
    kf(6.95, frame(6, 11.5, [-0.05, 0.12, 1])),
  ]
}

/** Section dwell points used when reduced motion swaps flight for a cut. */
export const DWELL = [0.5, 1.55, 2.2, 3.55, 4.6, 5.5, 6.4]
