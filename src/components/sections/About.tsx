import { Cloud, Database, Server, Workflow } from 'lucide-react'
import { about } from '../../data/profile'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const PILLARS = [
  { icon: Workflow, title: 'Orchestration', body: 'Airflow DAGs and dbt models that keep transformations scheduled, tested and observable.' },
  { icon: Database, title: 'Warehousing', body: 'BigQuery and SQL Server warehouses designed so analytics queries stay fast as volume grows.' },
  { icon: Cloud, title: 'Multi-cloud', body: 'Production workloads across GCP, AWS and Azure, provisioned with Terraform and shipped by CI/CD.' },
  { icon: Server, title: 'Backend', body: 'Spring Boot services with Spring Security, Cognito/Auth0 auth and containerised deployments.' },
]

export function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 sm:px-8 md:py-28">
      <SectionHeading index="01" title="About" subtitle="Where the data work and the software engineering meet." />

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <Reveal className="space-y-5">
          {about.map((para) => (
            <p key={para.slice(0, 32)} className="text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
              {para}
            </p>
          ))}
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08}>
              <div className="surface h-full p-5 transition-colors hover:border-brand/40">
                <p.icon className="size-5 text-brand" />
                <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
