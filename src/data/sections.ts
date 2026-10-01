/** Single source of truth for section ids — drives the nav, the scroll-spy and the anchors. */
export const sections = [
  { id: 'about', label: 'About', index: '01' },
  { id: 'skills', label: 'Skills', index: '02' },
  { id: 'experience', label: 'Experience', index: '03' },
  { id: 'projects', label: 'Projects', index: '04' },
  { id: 'education', label: 'Education', index: '05' },
  { id: 'contact', label: 'Contact', index: '06' },
] as const

export const sectionIds = sections.map((s) => s.id)
