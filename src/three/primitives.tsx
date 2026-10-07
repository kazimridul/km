import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { type ComponentProps, forwardRef, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { C, FONT, glowTexture, isStationLive, k } from './shared'

type TextProps = ComponentProps<typeof Text>

/** Mono, uppercase-friendly SDF label. Fog-aware, never tone-mapped. */
export const Label = forwardRef<THREE.Mesh, TextProps>(function Label(
  { children, fontSize = 0.1, color = C.label, letterSpacing = 0.12, ...rest },
  ref,
) {
  return (
    <Text
      ref={ref}
      font={FONT}
      fontSize={fontSize}
      color={color}
      letterSpacing={letterSpacing}
      anchorX="center"
      anchorY="middle"
      material-toneMapped={false}
      material-transparent
      {...rest}
    >
      {children}
    </Text>
  )
})

/** Additive halo sprite. */
export function Glow({
  color = C.cyan,
  scale = 1,
  opacity = 0.5,
  ...rest
}: { color?: string; scale?: number; opacity?: number } & ComponentProps<'sprite'>) {
  return (
    <sprite scale={scale} {...rest}>
      <spriteMaterial
        map={glowTexture()}
        color={color}
        opacity={opacity}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  )
}

/** Thin luminous tube along a curve, with opacity driven by a ref so it can dim/brighten. */
export function Pipe({
  curve,
  radius = 0.012,
  color = C.cyan,
  opacity,
  station,
  segments = 64,
}: {
  curve: THREE.Curve<THREE.Vector3>
  radius?: number
  color?: string
  opacity: { current: number }
  station: number
  segments?: number
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, segments, radius, 6, false), [curve, segments, radius])
  useFrame((_, dt) => {
    if (!mat.current || !isStationLive(station)) return
    mat.current.opacity += (opacity.current - mat.current.opacity) * k(6, dt)
  })
  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={opacity.current}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

/** A plain 1px polyline. */
export function Polyline({
  points,
  color = C.cyan,
  opacity = 0.3,
  dashed = false,
  ...rest
}: { points: THREE.Vector3[]; color?: string; opacity?: number; dashed?: boolean } & ComponentProps<'group'>) {
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points)
    const m = dashed
      ? new THREE.LineDashedMaterial({ color, transparent: true, opacity, dashSize: 0.08, gapSize: 0.07, depthWrite: false })
      : new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false })
    m.toneMapped = false
    const l = new THREE.Line(g, m)
    if (dashed) l.computeLineDistances()
    return l
  }, [points, color, opacity, dashed])
  return (
    <group {...rest}>
      <primitive object={line} />
    </group>
  )
}

/** Invisible-but-raycastable sphere. `visible` must stay true for the event filter. */
export function HitSphere({ radius, ...rest }: { radius: number } & ComponentProps<'mesh'>) {
  return (
    <mesh {...rest}>
      <sphereGeometry args={[radius, 12, 12]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}
