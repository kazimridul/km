import type { ComponentType } from 'react'

/**
 * Loose on purpose: react-icons' `IconType` and our hand-rolled brand SVGs both
 * satisfy this, so the two can be mixed freely in one skill list.
 */
export type IconLike = ComponentType<{ className?: string }>

export type Social = {
  label: string
  /** Empty string = not published yet; every consumer must skip these. */
  url: string
  handle?: string
}

export type Skill = {
  name: string
  icon?: IconLike
}

export type SkillGroup = {
  title: string
  /** Flat list of skills, or provider-subdivided (used by the Cloud group). */
  skills?: Skill[]
  subgroups?: { title: string; skills: Skill[] }[]
}

export type Role = {
  company: string
  title: string
  period: string
  /** Bullets are grouped so a 22-item list stays scannable. */
  groups: { label: string; bullets: string[] }[]
}

export type ProjectCategory = 'GCP' | 'AWS' | 'Azure' | 'Backend'

export type Project = {
  id: string
  name: string
  client?: string
  blurb: string
  category: ProjectCategory
  tech: string[]
  bullets: string[]
}

export type Credential = {
  title: string
  institution: string
  detail?: string
}
