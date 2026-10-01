import { FaGithub, FaLinkedinIn } from 'react-icons/fa6'
import type { IconLike } from './types'

/**
 * lucide-react v1 removed its brand glyphs, so social marks come from react-icons.
 * Keyed by the `label` in profile.socials — add a key here when adding a social.
 */
export const socialIcons: Record<string, IconLike> = {
  GitHub: FaGithub,
  LinkedIn: FaLinkedinIn,
}

export const fallbackSocialIcon: IconLike = FaGithub
