/**
 * Rendering tiers.
 *  high   — desktop with a real GPU: full scene
 *  medium — tablets / modest desktops: fewer particles, lower DPR
 *  low    — phones: simplified scene, no pointer parallax
 *  off    — no WebGL, software rasteriser or very weak device: static backdrop
 */
export type Tier = 'high' | 'medium' | 'low' | 'off'

const TIERS: Tier[] = ['high', 'medium', 'low', 'off']

export function detectTier(): Tier {
  if (typeof window === 'undefined') return 'off'

  // `?quality=high|medium|low|off` forces a tier — for testing on any machine.
  const forced = new URLSearchParams(window.location.search).get('quality') as Tier | null
  if (forced && TIERS.includes(forced)) return forced

  const canvas = document.createElement('canvas')
  const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null
  if (!gl) return 'off'

  // Software rasterisers (SwiftShader, llvmpipe) can't hold a frame rate; a static
  // backdrop reads better than a slideshow.
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''
  gl.getExtension('WEBGL_lose_context')?.loseContext()
  if (/swiftshader|llvmpipe|software|basic render/i.test(renderer)) return 'off'

  const nav = navigator as Navigator & { deviceMemory?: number }
  const memory = nav.deviceMemory ?? 8
  const cores = nav.hardwareConcurrency ?? 4
  if (memory <= 2 || cores <= 2) return 'off'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const width = window.innerWidth
  if (coarse && width < 768) return 'low'
  if (coarse || width < 1024 || memory <= 4 || cores <= 4) return 'medium'
  return 'high'
}

export const tierScale: Record<Tier, number> = { high: 1, medium: 0.6, low: 0.35, off: 0 }

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}
