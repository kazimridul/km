import type { ComponentType } from 'react'

export type IconLike = ComponentType<{ className?: string }>

export type Social = {
  label: string
  /** Empty string = not published yet; every consumer must skip these. */
  url: string
  handle?: string
}

export type Role = {
  company: string
  title: string
  period: string
  /** Milestone year shown on the 3D rail. */
  year: string
  /** Short tech chips shown before the role is expanded. */
  highlights: string[]
  /** One-line focus areas shown before the role is expanded. */
  focus: string[]
  /** Bullets are grouped so a 22-item list stays scannable. */
  groups: { label: string; bullets: string[] }[]
}

/** Filter buckets for the project universe. A project can sit in several. */
export type ProjectTag = 'data' | 'backend' | 'cloud' | 'automation'

export type Project = {
  id: string
  name: string
  client?: string
  blurb: string
  /** Primary platform, shown as the badge. */
  platform: 'GCP' | 'AWS' | 'Azure' | 'Backend'
  tags: ProjectTag[]
  tech: string[]
  /**
   * The ordered chain the 3D universe draws from the project panel through its
   * technologies. Every entry must also appear in `tech`.
   */
  flow: string[]
  bullets: string[]
}

export type Credential = {
  title: string
  institution: string
}

export type StackTech = {
  name: string
  blurb: string
}

export type StackCluster = {
  id: string
  title: string
  techs: StackTech[]
}
