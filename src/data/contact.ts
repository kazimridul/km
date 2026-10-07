import { profile } from './profile'

export type Channel = {
  id: string
  label: string
  value: string
  href: string
  external?: boolean
  download?: boolean
  /** Drawn as a destination around the 3D communication node. */
  node: boolean
}

/**
 * Contact channels, derived from the profile. Socials with an empty URL are
 * skipped, so GitHub appears everywhere (including the 3D node) once its URL is set.
 */
export function contactChannels(): Channel[] {
  const socials = profile.socials
    .filter((s) => s.url)
    .map((s) => ({
      id: s.label.toLowerCase(),
      label: s.label,
      value: s.handle || s.url.replace(/^https?:\/\/(www\.)?/, ''),
      href: s.url,
      external: true,
      node: true,
    }))

  return [
    { id: 'email', label: 'Email', value: profile.email, href: `mailto:${profile.email}`, node: true },
    ...socials.filter((s) => s.id === 'linkedin'),
    ...socials.filter((s) => s.id === 'github'),
    { id: 'cv', label: 'CV', value: 'Kazi-Midul-Hossen-Resume.pdf', href: profile.resumePath, download: true, node: true },
    ...socials.filter((s) => s.id !== 'linkedin' && s.id !== 'github'),
    { id: 'phone', label: 'Phone', value: profile.phone, href: `tel:${profile.phoneHref}`, node: false },
  ]
}
