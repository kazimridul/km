import type { Role } from './types'

/**
 * Bullets are verbatim from the resume. The Be Data Solutions role has 22 of them,
 * so they're grouped by theme rather than dumped as one list.
 */
export const roles: Role[] = [
  {
    company: 'Be Data Solutions Limited',
    title: 'Sr. Data and Software Engineer',
    period: 'Oct 2022 — Present',
    groups: [
      {
        label: 'Data platform & pipelines',
        bullets: [
          'Built ELT pipelines using dbt for scalable data transformation and modeling.',
          'Developed API-based data ingestion pipelines to pull data into BigQuery.',
          'Used Apache Airflow for workflow orchestration, scheduling, and monitoring of data pipelines.',
          'Used Google Cloud Datastream to synchronize data from PostgreSQL to BigQuery.',
          'Designed end-to-end ETL process for CSV/JSON data to billing reports.',
          'Built and maintained ETL workflows for data ingestion, transformation, and storage.',
          'Designed and built high-performance data warehouses, centralizing and optimizing data access for enhanced analytics.',
          'Automated SQL Server data extraction and report generation.',
          'Integrated third-party APIs and generated CSV outputs.',
          'Automated email notifications for success/failure.',
        ],
      },
      {
        label: 'Cloud & infrastructure',
        bullets: [
          'Built Google Cloud jobs/services to automate and orchestrate data extraction from APIs.',
          'Implemented CI/CD pipelines using GitHub Actions for automated testing and deployment.',
          'Automated infrastructure deployment with Terraform scripts for scalable and efficient management.',
          'Integrated AWS Lambda for serverless processing and automation, reducing overhead and improving flexibility.',
          'Designed and implemented efficient ETL pipelines with AWS Glue for data transformation and loading.',
          'Leveraged Amazon S3 buckets for secure, scalable data storage solutions, supporting seamless data handling.',
          'Implemented Azure Blob Storage for secure and scalable data storage, supporting large-scale data operations.',
          'Leveraged Azure Functions for automation, improving workflows and operational efficiency.',
          'Utilized CI/CD pipelines to streamline infrastructure management and ensure rapid, reliable updates.',
        ],
      },
      {
        label: 'Backend engineering',
        bullets: [
          'Developed backend APIs, integrated OpenAI and Auth0, deployed on cloud with container management.',
          'Designed Spring Boot backend, implemented AWS Cognito auth, deployed on EC2, and used S3/SQL Server.',
          'Full-stack development using Anvil; handled both frontend and backend with Anvil’s database.',
        ],
      },
    ],
  },
  {
    company: 'Naztech Inc',
    title: 'Junior Software Engineer',
    period: 'Mar 2020 — Oct 2022',
    groups: [
      {
        label: 'Responsibilities',
        bullets: [
          'Automated document handling processes, significantly reducing manual effort and improving operational efficiency.',
          'Designed and implemented backend services using Spring Boot, integrated email workflows with Spring Email, and processed documents with PDFBox.',
          'Managed relational data storage with MS SQL Server and ensured data consistency across the system.',
          'Developed a robust data pipeline to deliver real-time SMS notifications for banking transactions.',
          'Built scalable pipelines for extracting and analyzing job statistics from multiple sources.',
          'Collaborated across all phases of the Software Development Life Cycle (SDLC), including design, development, testing, and deployment.',
        ],
      },
    ],
  },
]
