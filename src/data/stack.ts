import type { StackCluster } from './types'

/**
 * The technology galaxy. Every technology is from the resume; the one-line
 * blurbs describe what the tool is for, not claims about the work.
 */
export const stackClusters: StackCluster[] = [
  {
    id: 'programming',
    title: 'Programming',
    techs: [
      { name: 'Java', blurb: 'Backend services and APIs on the JVM.' },
      { name: 'Python', blurb: 'Pipelines, ingestion jobs and data tooling.' },
      { name: 'JavaScript', blurb: 'Scripting and web integrations.' },
      { name: 'SQL', blurb: 'Modelling, transformation and reporting queries.' },
      { name: 'Bash', blurb: 'Shell automation and job scripting.' },
    ],
  },
  {
    id: 'data',
    title: 'Data Engineering',
    techs: [
      { name: 'Airflow', blurb: 'Workflow orchestration, scheduling and monitoring.' },
      { name: 'DBT', blurb: 'Data transformation, modeling and analytics-ready datasets.' },
      { name: 'BigQuery', blurb: 'Serverless warehouse for analytics at scale.' },
      { name: 'Pandas', blurb: 'Tabular transformation and data wrangling.' },
      { name: 'NumPy', blurb: 'Numerical arrays and vectorised computation.' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    techs: [
      { name: 'Spring Boot', blurb: 'Production-ready Java services and REST APIs.' },
      { name: 'Spring Security', blurb: 'Authentication and authorization for Spring apps.' },
      { name: 'Hibernate', blurb: 'ORM mapping Java objects to relational tables.' },
      { name: 'JPA', blurb: 'Standard persistence API for Java.' },
      { name: 'JDBC', blurb: 'Direct database connectivity from Java.' },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    techs: [
      { name: 'PostgreSQL', blurb: 'Relational database; source for Datastream CDC.' },
      { name: 'SQL Server', blurb: 'Relational storage, extraction and reporting.' },
      { name: 'MySQL', blurb: 'Relational database for application data.' },
      { name: 'MongoDB', blurb: 'Document database for flexible schemas.' },
      { name: 'InfluxDB', blurb: 'Time-series database for metrics and events.' },
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud',
    techs: [
      { name: 'AWS', blurb: 'EC2 • Lambda • S3 • Glue • CloudWatch' },
      { name: 'Azure', blurb: 'Data Factory • Functions • Blob Storage • VMs' },
      { name: 'GCP', blurb: 'BigQuery • Cloud Run Jobs • GCS • Datastream' },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    techs: [
      { name: 'Terraform', blurb: 'Infrastructure as code across AWS, Azure and GCP.' },
      { name: 'Docker', blurb: 'Containerised builds and deployments.' },
      { name: 'CI/CD', blurb: 'GitHub Actions and Jenkins for test and deploy.' },
    ],
  },
  {
    id: 'messaging',
    title: 'Messaging',
    techs: [
      { name: 'Kafka', blurb: 'Distributed event streaming for real-time pipelines.' },
      { name: 'RabbitMQ', blurb: 'Message broker for work queues.' },
    ],
  },
  {
    id: 'auth',
    title: 'Auth / API',
    techs: [
      { name: 'Cognito', blurb: 'AWS user pools and token-based auth.' },
      { name: 'Auth0', blurb: 'Hosted identity and login flows.' },
      { name: 'OpenAI API', blurb: 'LLM capabilities integrated into backend APIs.' },
    ],
  },
]

/** Relationship edges drawn (and streamed) across clusters. */
export const stackLinks: [string, string][] = [
  ['Spring Boot', 'Spring Security'],
  ['Spring Security', 'Cognito'],
  ['Cognito', 'AWS'],
  ['Airflow', 'DBT'],
  ['DBT', 'BigQuery'],
  ['BigQuery', 'GCP'],
  ['Java', 'Spring Boot'],
  ['Python', 'Airflow'],
  ['SQL', 'DBT'],
  ['Kafka', 'Spring Boot'],
  ['Terraform', 'Azure'],
  ['PostgreSQL', 'BigQuery'],
]
