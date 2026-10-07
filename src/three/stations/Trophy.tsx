import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { STATIONS } from '../layout'
import { Glow, Label } from '../primitives'
import { C, isStationLive, k, materials, motionPrefs } from '../shared'

const STATION = 5

/** Low-poly lathe trophy in brushed steel on a plinth, with a slow orbit ring. */
export function Trophy() {
  const body = useRef<THREE.Group>(null)
  const orbit = useRef<THREE.Group>(null)
  const steel = useMemo(() => {
    const m = materials.steel()
    m.color.set('#c9d6e3')
    m.roughness = 0.34
    return m
  }, [])
  const metal = useMemo(() => materials.metal(), [])

  const cup = useMemo(() => {
    const profile = [
      [0, -0.62],
      [0.13, -0.6],
      [0.1, -0.45],
      [0.07, -0.2],
      [0.09, -0.08],
      [0.2, 0.0],
      [0.42, 0.18],
      [0.55, 0.45],
      [0.6, 0.78],
      [0.62, 0.86],
      [0.57, 0.87],
      [0.53, 0.5],
      [0.4, 0.24],
      [0.0, 0.12],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(profile, 40)
  }, [])

  const ticks = useMemo(() => {
    const verts: number[] = []
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2
      const r0 = 1.55
      const r1 = i % 8 === 0 ? 1.68 : 1.6
      verts.push(Math.cos(a) * r0, 0, Math.sin(a) * r0, Math.cos(a) * r1, 0, Math.sin(a) * r1)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  useFrame((state, dt) => {
    if (!isStationLive(STATION) || motionPrefs.reduced) return
    const t = state.clock.elapsedTime
    if (body.current) {
      const pointer = motionPrefs.finePointer ? state.pointer.x * 0.35 : 0
      body.current.rotation.y += (Math.sin(t * 0.22) * 0.7 + pointer - body.current.rotation.y) * k(2, dt)
      body.current.position.y = Math.sin(t * 0.6) * 0.05
    }
    if (orbit.current) orbit.current.rotation.y += dt * 0.12
  })

  return (
    <group position={STATIONS[STATION].anchor}>
      <group ref={body}>
        <mesh geometry={cup} material={steel} position-y={0.15} />
        {[-1, 1].map((s) => (
          <mesh key={s} material={steel} position={[s * 0.6, 0.72, 0]} rotation-z={s * -Math.PI / 2}>
            <torusGeometry args={[0.2, 0.03, 10, 24, Math.PI]} />
          </mesh>
        ))}
        <mesh material={metal} position-y={-0.55}>
          <cylinderGeometry args={[0.36, 0.42, 0.22, 6]} />
        </mesh>
      </group>

      <mesh material={metal} position-y={-0.78}>
        <cylinderGeometry args={[0.95, 1.02, 0.16, 64]} />
      </mesh>
      <mesh position-y={-0.695} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.95, 0.006, 6, 96]} />
        <meshBasicMaterial color={C.cyan} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <Label position={[0, -0.78, 1.03]} fontSize={0.075} color={C.label} letterSpacing={0.3}>
        ICPC · DHAKA REGIONAL · 2019
      </Label>

      <group ref={orbit} position-y={0.1} rotation-x={0.32}>
        <lineSegments geometry={ticks}>
          <lineBasicMaterial color={C.cyanDeep} transparent opacity={0.45} depthWrite={false} />
        </lineSegments>
        <mesh position={[1.58, 0, 0]}>
          <sphereGeometry args={[0.04, 12, 12]} />
          <meshBasicMaterial color={C.ice} toneMapped={false} />
        </mesh>
      </group>
      <Glow position-y={0.4} scale={3.2} opacity={0.12} color={C.blue} />
      <pointLight position={[2.2, 2.4, 3]} color="#e6f3ff" intensity={14} distance={10} decay={1.6} />
      <pointLight position={[-2.4, 0.8, -1.6]} color={C.cyan} intensity={10} distance={8} decay={1.6} />
    </group>
  )
}
