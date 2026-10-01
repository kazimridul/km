import type { Social } from './types'

export const profile = {
  name: 'Kazi Midul Hossen',
  shortName: 'Midul',
  initials: 'KMH',
  title: 'Sr. Data Engineer',
  /** Rendered under the name in the hero. Keep it to one line. */
  tagline: 'I build the pipelines that turn scattered source data into something a business can actually use.',
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

/** Two paragraphs for the About section, adapted from the resume objective. */
export const about = [
  'I am a Data Engineer and Backend Software Engineer with 5+ years of experience designing and implementing scalable data pipelines, ETL/ELT workflows, and reliable backend systems. My day-to-day is Python, SQL and Java — orchestrating with Apache Airflow, modelling with dbt, and shipping across AWS, GCP and Azure with Terraform and CI/CD doing the heavy lifting.',
  'That data work sits on a real software engineering foundation: Spring Boot services, Spring Security, authentication with Auth0 and Cognito, containerised deployments, and API development including the OpenAI API. It means I can take something from raw third-party source all the way to an analytics-ready warehouse — and own the services in between.',
]

/** Hero/About stat strip. Each is verifiable from the resume — no invented metrics. */
export const stats = [
  { value: '5+', label: 'Years experience' },
  { value: '3', label: 'Cloud platforms' },
  { value: '8', label: 'Delivered projects' },
  { value: '137', label: 'ICPC regional rank' },
]
