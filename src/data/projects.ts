import type { Project, ProjectTag } from './types'

export const projectFilters: { id: 'all' | ProjectTag; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'data', label: 'Data Engineering' },
  { id: 'backend', label: 'Backend' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'automation', label: 'Automation' },
]

/** Descriptions and stacks are from the resume; nothing here is invented. */
export const projects: Project[] = [
  {
    id: 'lds',
    name: 'LDS',
    client: 'Little Dot Studios',
    blurb: 'Data pipelines ingesting Facebook Graph API and Google Ad Manager data into BigQuery, modelled with DBT.',
    platform: 'GCP',
    tags: ['data', 'cloud', 'automation'],
    tech: ['Facebook Graph API', 'Google Ad Manager', 'BigQuery', 'DBT', 'Airflow', 'Datastream', 'CI/CD'],
    flow: ['Facebook Graph API', 'BigQuery', 'DBT', 'Airflow', 'CI/CD'],
    bullets: [
      'Developed and maintained data pipelines to ingest data from Facebook Graph API and Google Ad Manager (GAM) into Google BigQuery.',
      'Automated the extraction and processing of data from Facebook remittance PDF reports and loaded structured data into BigQuery.',
      'Designed and implemented ELT pipelines using DBT for scalable and maintainable data processing.',
      'Developed data transformation and modeling workflows using DBT to prepare analytics-ready datasets.',
      'Built and maintained CI/CD pipelines to automate data pipeline deployment and improve development and release workflows.',
      'Used Google Cloud Datastream to synchronize data from PostgreSQL to BigQuery.',
      'Used Apache Airflow for workflow orchestration, scheduling, and monitoring of data pipelines.',
    ],
  },
  {
    id: 'acacium',
    name: 'Acacium Group',
    blurb: 'ETL pipeline on Azure Data Factory with Terraform-managed infrastructure and CI/CD.',
    platform: 'Azure',
    tags: ['data', 'cloud', 'automation'],
    tech: ['Azure Data Factory', 'Azure Functions', 'Blob Storage', 'Terraform', 'CI/CD'],
    flow: ['Azure Data Factory', 'Azure Functions', 'Blob Storage', 'Terraform', 'CI/CD'],
    bullets: [
      'Built an efficient ETL pipeline using Azure Data Factory.',
      'Leveraged Azure Functions for seamless automation.',
      'Developed Terraform scripts to streamline infrastructure deployment.',
      'Utilized Azure Blob Storage for secure and scalable data storage.',
      'Implemented CI/CD pipelines to ensure smooth infrastructure management and updates.',
    ],
  },
  {
    id: 'nrs',
    name: 'NRS',
    blurb: 'ETL process on Azure Data Factory feeding a centralised data warehouse, deployed with Terraform.',
    platform: 'Azure',
    tags: ['data', 'cloud', 'automation'],
    tech: ['Azure Data Factory', 'Data Warehouse', 'Terraform'],
    flow: ['Azure Data Factory', 'Data Warehouse', 'Terraform'],
    bullets: [
      'Designed and executed a robust ETL process using Azure Data Factory for seamless data integration.',
      'Automated infrastructure deployment with custom Terraform scripts for scalability and efficiency.',
      'Built a powerful data warehouse to centralize data storage for enhanced analytics.',
    ],
  },
  {
    id: 'elias',
    name: 'Elias Data Pipeline',
    blurb: 'ETL process retrieving third-party API data and generating CSV files for downstream consumption.',
    platform: 'AWS',
    tags: ['data', 'cloud'],
    tech: ['Third-party APIs', 'AWS Glue', 'Amazon S3', 'AWS Lambda', 'CSV'],
    flow: ['Third-party APIs', 'AWS Lambda', 'AWS Glue', 'Amazon S3', 'CSV'],
    bullets: [
      'Implemented an ETL process to retrieve data from third-party APIs, process the data, and generate CSV files for downstream consumption.',
    ],
  },
  {
    id: 'datahead',
    name: 'Datahead Application',
    blurb: 'Spring Boot and Spring Security backend with AWS Cognito auth, deployed on EC2, using S3 and SQL Server.',
    platform: 'Backend',
    tags: ['backend', 'cloud'],
    tech: ['Java', 'Spring Boot', 'Spring Security', 'AWS Cognito', 'Amazon EC2', 'Amazon S3', 'SQL Server'],
    flow: ['Spring Boot', 'AWS Cognito', 'Amazon EC2', 'Amazon S3', 'SQL Server'],
    bullets: [
      'Designed and developed backend services using Java Spring Boot and Spring Security.',
      'Integrated authentication using AWS Cognito and deployed services on AWS EC2.',
      'Managed file storage using Amazon S3 and connected to SQL Server for data persistence.',
    ],
  },
  {
    id: 'dms',
    name: 'Document Management System',
    blurb: 'Automated document handling, reducing manual effort.',
    platform: 'Backend',
    tags: ['backend', 'automation'],
    tech: ['Spring Boot', 'Spring Email', 'PDFBox', 'SQL Server'],
    flow: ['Spring Boot', 'PDFBox', 'Spring Email', 'SQL Server'],
    bullets: ['Reduced manual effort by automating document handling processes.'],
  },
  {
    id: 'sms',
    name: 'SMS Service',
    blurb: 'SMS notifications for banking transactions, delivered through a reliable data pipeline.',
    platform: 'Backend',
    tags: ['backend', 'data'],
    tech: ['Spring Boot', 'Kafka', 'Redis', 'SQL Server', 'Apache POI', 'Gson'],
    flow: ['Spring Boot', 'Kafka', 'Redis', 'SQL Server'],
    bullets: ['Delivered SMS notifications for banking transactions through a reliable data pipeline.'],
  },
  {
    id: 'job-extractor',
    name: 'Job Data Extractor',
    blurb: 'Scalable pipelines for extracting and analysing job statistics from multiple sources.',
    platform: 'Backend',
    tags: ['backend', 'data'],
    tech: ['Spring Boot', 'Selenium', 'JSoup', 'RabbitMQ', 'SQL Server'],
    flow: ['Selenium', 'JSoup', 'RabbitMQ', 'Spring Boot', 'SQL Server'],
    bullets: ['Built scalable pipelines for extracting and analyzing job statistics from multiple sources.'],
  },
]

export function matchesFilter(p: Project, filter: 'all' | ProjectTag) {
  return filter === 'all' || p.tags.includes(filter)
}
