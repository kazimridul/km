import { create } from 'zustand'
import type { PillarId } from '../data/profile'
import type { ProjectTag } from '../data/types'
import type { Tier } from '../lib/device'

export type CursorMode = 'default' | 'hover' | 'view' | 'explore'

export type Tooltip = {
  title: string
  lines: string[]
  x: number
  y: number
}

type UiState = {
  tier: Tier
  reducedMotion: boolean
  /** True once the lazy WebGL world has mounted and drawn its first frame. */
  worldReady: boolean

  heroHover: string | null
  heroFocus: string | null
  pillarHover: PillarId | null
  clusterHover: string | null
  techHover: string | null
  projectHover: string | null
  projectAuto: string | null
  projectFilter: 'all' | ProjectTag
  openProject: string | null
  contactHover: string | null

  tooltip: Tooltip | null
  cursor3d: CursorMode | null

  set: (patch: Partial<UiState>) => void
}

export const useUi = create<UiState>((set) => ({
  tier: 'high',
  reducedMotion: false,
  worldReady: false,

  heroHover: null,
  heroFocus: null,
  pillarHover: null,
  clusterHover: null,
  techHover: null,
  projectHover: null,
  projectAuto: null,
  projectFilter: 'all',
  openProject: null,
  contactHover: null,

  tooltip: null,
  cursor3d: null,

  set: (patch) => set(patch),
}))

/** The project the universe should highlight: the user's hover wins over the idle cycle. */
export const selectActiveProject = (s: UiState) => s.projectHover ?? s.projectAuto
