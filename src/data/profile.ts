import type { Social } from './types'

export const profile = {
  name: 'Kazi Midul Hossen',
  initials: 'KMH',
  title: 'Data Engineer & Backend Software Engineer',
  eyebrow: 'Data Engineer • Backend Software Engineer',
  /** Hero statement, one line per array entry. */
  headline: ['I build scalable data pipelines,', 'reliable backend systems,', 'and cloud-native solutions.'],
  summary:
    '5+ years of experience designing data pipelines, ETL/ELT workflows, backend services and scalable cloud infrastructure.',
  email: 'kazimridul32@gmail.com',
  phone: '+880 1621529019',
  phoneHref: '+8801621529019',
  location: 'Dhaka, Bangladesh',
  resumePath: '/Kazi-Midul-Hossen-Resume.pdf',

  socials: [
    { label: 'GitHub', url: '', handle: '' },
    { label: 'LinkedIn', url: 'https://bd.linkedin.com/in/kazi-mridul-hossain-a934bb203', handle: 'Kazi Mridul Hossain' },
  ] as Social[],
}

/** About copy, adapted from the resume objective. */
export const about = [
  'Experienced Data Engineer and Backend Software Engineer with 5+ years of experience designing and implementing scalable data pipelines, ETL/ELT workflows and reliable backend systems.',
  'I work across data engineering, backend development, cloud infrastructure and automation to build efficient, secure and scalable data-driven systems.',
]

/** Verbatim from the resume. */
export const aboutQuote =
  'Combining deep data engineering expertise with a solid foundation in software architecture and backend engineering, I excel at building end-to-end data-driven solutions that are efficient, secure, and scalable.'

/** The four pillars drawn as the About diagram. */
export const pillars = [
  { id: 'data', title: 'Data', items: ['ETL', 'ELT', 'DBT', 'Airflow', 'BigQuery'] },
  { id: 'backend', title: 'Backend', items: ['Java', 'Spring Boot', 'APIs', 'Security'] },
  { id: 'cloud', title: 'Cloud', items: ['AWS', 'Azure', 'GCP'] },
  { id: 'automation', title: 'Automation', items: ['Terraform', 'CI/CD', 'Serverless'] },
] as const

export type PillarId = (typeof pillars)[number]['id']

/** Count-up stats. Each is verifiable from the resume — no invented metrics. */
export const stats = [
  { value: 5, suffix: '+', label: 'Years experience' },
  { value: 8, suffix: '+', label: 'Major projects' },
  { value: 137, suffix: '', label: 'ICPC ranking' },
]
