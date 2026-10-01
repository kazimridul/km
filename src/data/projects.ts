import type { Project, ProjectCategory } from './types'

export const projectCategories: ProjectCategory[] = ['GCP', 'AWS', 'Azure', 'Backend']

export const projects: Project[] = [
  {
    id: 'lds',
    name: 'LDS',
    client: 'Little Dot Studios',
    blurb: 'Media analytics platform ingesting Facebook Graph API and Google Ad Manager data into BigQuery, modelled with dbt.',
    category: 'GCP',
    tech: ['BigQuery', 'dbt', 'Airflow', 'Datastream', 'Facebook Graph API', 'Google Ad Manager', 'CI/CD'],
    bullets: [
      'Developed and maintained data pipelines to ingest data from Facebook Graph API and Google Ad Manager (GAM) into Google BigQuery.',
      'Automated the extraction and processing of data from Facebook remittance PDF reports and loaded structured data into BigQuery.',
      'Designed and implemented ELT pipelines using dbt for scalable and maintainable data processing.',
      'Developed data transformation and modeling workflows using dbt to prepare analytics-ready datasets.',
      'Built and maintained CI/CD pipelines to automate data pipeline deployment and improve development and release workflows.',
      'Used Google Cloud Datastream to synchronize data from PostgreSQL to BigQuery.',
      'Used Apache Airflow for workflow orchestration, scheduling, and monitoring of data pipelines.',
    ],
  },
  {
    id: 'acacium',
    name: 'Acacium Group',
    blurb: 'Azure-native ETL platform with Terraform-managed infrastructure and fully automated deployments.',
    category: 'Azure',
    tech: ['Azure Data Factory', 'Azure Functions', 'Terraform', 'Blob Storage', 'CI/CD'],
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
    blurb: 'Centralised data warehouse fed by Azure Data Factory, with infrastructure defined entirely in Terraform.',
    category: 'Azure',
    tech: ['Azure Data Factory', 'Terraform', 'Data Warehouse'],
    bullets: [
      'Designed and executed a robust ETL process using Azure Data Factory for seamless data integration.',
      'Automated infrastructure deployment with custom Terraform scripts for scalability and efficiency.',
      'Built a powerful data warehouse to centralize data storage for enhanced analytics.',
    ],
  },
  {
    id: 'elias',
    name: 'Elias Data Pipeline',
    blurb: 'Serverless AWS pipeline pulling third-party API data and emitting CSV extracts for downstream systems.',
    category: 'AWS',
    tech: ['AWS Glue', 'Amazon S3', 'AWS Lambda'],
    bullets: [
      'Implemented an ETL process to retrieve data from third-party APIs, process the data, and generate CSV files for downstream consumption.',
    ],
  },
  {
    id: 'datahead',
    name: 'Datahead Application',
    blurb: 'Spring Boot backend on EC2 with Cognito-backed authentication, S3 file storage and SQL Server persistence.',
    category: 'Backend',
    tech: ['Java', 'Spring Boot', 'Spring Security', 'AWS Cognito', 'Amazon EC2', 'Amazon S3', 'SQL Server'],
    bullets: [
      'Designed and developed backend services using Java Spring Boot and Spring Security.',
      'Integrated authentication using AWS Cognito and deployed services on AWS EC2.',
      'Managed file storage using Amazon S3 and connected to SQL Server for data persistence.',
    ],
  },
  {
    id: 'dms',
    name: 'Document Management System',
    blurb: 'Automated document handling and email workflows, cutting out a manual processing step.',
    category: 'Backend',
    tech: ['Spring Boot', 'Spring Email', 'PDFBox', 'MS SQL'],
    bullets: ['Reduced manual effort by automating document handling processes.'],
  },
  {
    id: 'sms',
    name: 'SMS Service',
    blurb: 'Kafka-backed pipeline delivering real-time SMS notifications for banking transactions.',
    category: 'Backend',
    tech: ['Spring Boot', 'Kafka', 'Redis', 'MS SQL', 'Apache POI', 'gson'],
    bullets: ['Delivered SMS notifications for banking transactions through a reliable data pipeline.'],
  },
  {
    id: 'job-extractor',
    name: 'Job Data Extractor',
    blurb: 'Scraping and analysis pipeline collecting job statistics from multiple sources via a message queue.',
    category: 'Backend',
    tech: ['Spring Boot', 'Selenium', 'JSoup', 'RabbitMQ', 'MS SQL'],
    bullets: ['Built scalable pipelines for extracting and analyzing job statistics from multiple sources.'],
  },
]
