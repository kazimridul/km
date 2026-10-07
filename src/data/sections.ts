/**
 * Single source of truth for section ids — drives the nav, the scroll-spy, the
 * stage HUD and the 3D camera (the camera's station index is the array index).
 */
export const sections = [
  { id: 'top', label: 'Home', index: '01', stage: 'Data enters the system' },
  { id: 'about', label: 'About', index: '02', stage: 'Data is processed' },
  { id: 'experience', label: 'Experience', index: '03', stage: 'Systems connect' },
  { id: 'stack', label: 'Stack', index: '04', stage: 'Applications are built' },
  { id: 'projects', label: 'Projects', index: '05', stage: 'Shipped to production' },
  { id: 'education', label: 'Education', index: '06', stage: 'The foundation' },
  { id: 'contact', label: 'Contact', index: '07', stage: "Let's build something" },
] as const

export type SectionId = (typeof sections)[number]['id']

export const sectionIds: string[] = sections.map((s) => s.id)
