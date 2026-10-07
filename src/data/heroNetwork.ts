/**
 * The hero's 3D data platform. Positions are local to the hero station and
 * read left → right as data flows through the system.
 */
export type HeroNodeKind =
  | 'terminal'
  | 'funnel'
  | 'stream'
  | 'core'
  | 'warehouse'
  | 'service'
  | 'database'
  | 'orchestrator'
  | 'cloud'
  | 'satellite'
  | 'app'

export type HeroNode = {
  id: string
  label: string
  kind: HeroNodeKind
  position: [number, number, number]
  title: string
  description: string
  tech: string[]
}

export const heroNodes: HeroNode[] = [
  {
    id: 'api',
    label: 'API',
    kind: 'terminal',
    position: [-2.9, 0.15, 0.7],
    title: 'API layer',
    description: 'Source systems and third-party APIs',
    tech: ['REST APIs', 'Facebook Graph API', 'Google Ad Manager'],
  },
  {
    id: 'ingest',
    label: 'INGESTION',
    kind: 'funnel',
    position: [-1.65, 1.05, -0.2],
    title: 'Ingestion',
    description: 'API-based ingestion and CDC',
    tech: ['Python', 'Cloud Run Jobs', 'Datastream'],
  },
  {
    id: 'kafka',
    label: 'KAFKA',
    kind: 'stream',
    position: [-0.35, 1.4, 0.45],
    title: 'Real-time streaming',
    description: 'Event streams and message queues',
    tech: ['Kafka', 'RabbitMQ'],
  },
  {
    id: 'processing',
    label: 'PROCESSING',
    kind: 'core',
    position: [0.95, 0.55, -0.35],
    title: 'Processing',
    description: 'Transformation and modelling',
    tech: ['DBT', 'Pandas', 'AWS Glue', 'Data Factory'],
  },
  {
    id: 'warehouse',
    label: 'DATA WAREHOUSE',
    kind: 'warehouse',
    position: [2.2, 1.05, 0.5],
    title: 'Data Engineering',
    description: 'Analytics-ready warehouse',
    tech: ['DBT', 'Airflow', 'BigQuery'],
  },
  {
    id: 'app',
    label: 'APPLICATION',
    kind: 'app',
    position: [2.95, -0.75, -0.1],
    title: 'Applications',
    description: 'APIs, reports and data products',
    tech: ['Backend APIs', 'Billing reports', 'Email notifications'],
  },
  {
    id: 'spring',
    label: 'SPRING BOOT',
    kind: 'service',
    position: [-1.3, -0.95, 0.8],
    title: 'Backend services',
    description: 'Secure Java services',
    tech: ['Spring Boot', 'Spring Security', 'Hibernate / JPA'],
  },
  {
    id: 'database',
    label: 'DATABASE',
    kind: 'database',
    position: [0.6, -1.35, 0.25],
    title: 'Databases',
    description: 'Relational and NoSQL storage',
    tech: ['SQL Server', 'PostgreSQL', 'MySQL', 'MongoDB'],
  },
  {
    id: 'airflow',
    label: 'AIRFLOW',
    kind: 'orchestrator',
    position: [-0.2, 2.65, -0.9],
    title: 'Orchestration',
    description: 'Scheduling and monitoring',
    tech: ['Apache Airflow'],
  },
  {
    id: 'cloud',
    label: 'CLOUD',
    kind: 'cloud',
    position: [0.6, -0.35, -2.5],
    title: 'Cloud infrastructure',
    description: 'Multi-cloud, defined as code',
    tech: ['AWS', 'Azure', 'GCP', 'Terraform'],
  },
  {
    id: 'aws',
    label: 'AWS',
    kind: 'satellite',
    position: [-0.75, -0.2, -2.2],
    title: 'AWS',
    description: 'Cloud infrastructure',
    tech: ['EC2', 'S3', 'Lambda', 'Glue'],
  },
  {
    id: 'azure',
    label: 'AZURE',
    kind: 'satellite',
    position: [0.75, 0.75, -3.1],
    title: 'Azure',
    description: 'Data integration and serverless',
    tech: ['Data Factory', 'Functions', 'Blob Storage'],
  },
  {
    id: 'gcp',
    label: 'GCP',
    kind: 'satellite',
    position: [1.95, -0.45, -2.3],
    title: 'Google Cloud',
    description: 'Warehouse and managed jobs',
    tech: ['BigQuery', 'Cloud Run Jobs', 'GCS', 'Datastream'],
  },
]

/**
 * Data flows. Each is a chain of node ids; particles travel the whole chain so
 * a packet visibly enters at the API and lands in the application.
 */
export const heroFlows: { ids: string[]; kind: 'data' | 'control' | 'cloud' }[] = [
  { ids: ['api', 'ingest', 'kafka', 'processing', 'warehouse', 'app'], kind: 'data' },
  { ids: ['api', 'spring', 'database', 'app'], kind: 'data' },
  { ids: ['airflow', 'ingest'], kind: 'control' },
  { ids: ['airflow', 'processing'], kind: 'control' },
  { ids: ['processing', 'aws'], kind: 'cloud' },
  { ids: ['processing', 'azure'], kind: 'cloud' },
  { ids: ['gcp', 'warehouse'], kind: 'cloud' },
]

export const heroNodeById = Object.fromEntries(heroNodes.map((n) => [n.id, n])) as Record<string, HeroNode>

/** Ids directly connected to `id` by any flow edge. */
export function heroNeighbors(id: string) {
  const out = new Set<string>()
  for (const f of heroFlows) {
    f.ids.forEach((n, i) => {
      if (n !== id) return
      if (f.ids[i - 1]) out.add(f.ids[i - 1])
      if (f.ids[i + 1]) out.add(f.ids[i + 1])
    })
  }
  if (id === 'cloud') ['aws', 'azure', 'gcp'].forEach((s) => out.add(s))
  if (['aws', 'azure', 'gcp'].includes(id)) out.add('cloud')
  return out
}
