import { FaAws } from 'react-icons/fa6'
import {
  SiApacheairflow,
  SiApachekafka,
  SiAuth0,
  SiDocker,
  SiGithubactions,
  SiGnubash,
  SiGooglebigquery,
  SiGooglecloud,
  SiHibernate,
  SiInfluxdb,
  SiJavascript,
  SiJenkins,
  SiMongodb,
  SiMysql,
  SiNumpy,
  SiOpenjdk,
  SiPandas,
  SiPostgresql,
  SiPython,
  SiRabbitmq,
  SiRedis,
  SiSelenium,
  SiSpring,
  SiSpringboot,
  SiSpringsecurity,
  SiTerraform,
} from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'
import { DbtIcon, OpenAiIcon, SqlIcon } from '../components/ui/BrandIcons'
import type { SkillGroup } from './types'

export const skillGroups: SkillGroup[] = [
  {
    title: 'Programming & Scripting',
    skills: [
      { name: 'Java', icon: SiOpenjdk },
      { name: 'Python', icon: SiPython },
      { name: 'JavaScript', icon: SiJavascript },
      { name: 'SQL', icon: SqlIcon },
      { name: 'Bash / Shell', icon: SiGnubash },
    ],
  },
  {
    title: 'Data Engineering & Orchestration',
    skills: [
      { name: 'Apache Airflow', icon: SiApacheairflow },
      { name: 'dbt', icon: DbtIcon },
      { name: 'BigQuery', icon: SiGooglebigquery },
      { name: 'Pandas', icon: SiPandas },
      { name: 'NumPy', icon: SiNumpy },
    ],
  },
  {
    title: 'Frameworks & Libraries',
    skills: [
      { name: 'Spring Boot', icon: SiSpringboot },
      { name: 'Spring Security', icon: SiSpringsecurity },
      { name: 'Hibernate / JPA', icon: SiHibernate },
      { name: 'SpringMail', icon: SiSpring },
      { name: 'JDBC', icon: SqlIcon },
      { name: 'Boto3' },
      { name: 'Selenium', icon: SiSelenium },
      { name: 'PDFBox' },
    ],
  },
  {
    title: 'Databases',
    skills: [
      { name: 'SQL Server', icon: SqlIcon },
      { name: 'PostgreSQL', icon: SiPostgresql },
      { name: 'MySQL', icon: SiMysql },
      { name: 'MongoDB', icon: SiMongodb },
      { name: 'InfluxDB', icon: SiInfluxdb },
    ],
  },
  {
    title: 'Streaming & Messaging',
    skills: [
      { name: 'Apache Kafka', icon: SiApachekafka },
      { name: 'RabbitMQ', icon: SiRabbitmq },
      { name: 'Redis', icon: SiRedis },
    ],
  },
  {
    title: 'Infrastructure, CI/CD & Auth',
    skills: [
      { name: 'Terraform', icon: SiTerraform },
      { name: 'Docker', icon: SiDocker },
      { name: 'GitHub Actions', icon: SiGithubactions },
      { name: 'Jenkins', icon: SiJenkins },
      { name: 'Auth0', icon: SiAuth0 },
      { name: 'OpenAI API', icon: OpenAiIcon },
    ],
  },
  {
    title: 'Cloud',
    subgroups: [
      {
        title: 'AWS',
        skills: [
          { name: 'EC2', icon: FaAws },
          { name: 'Lambda', icon: FaAws },
          { name: 'S3', icon: FaAws },
          { name: 'Glue', icon: FaAws },
          { name: 'CloudWatch', icon: FaAws },
          { name: 'Cognito', icon: FaAws },
        ],
      },
      {
        title: 'Google Cloud',
        skills: [
          { name: 'BigQuery', icon: SiGooglebigquery },
          { name: 'Cloud Run Jobs', icon: SiGooglecloud },
          { name: 'Cloud Storage', icon: SiGooglecloud },
          { name: 'Datastream', icon: SiGooglecloud },
          { name: 'Compute Engine', icon: SiGooglecloud },
        ],
      },
      {
        title: 'Azure',
        skills: [
          { name: 'Data Factory', icon: VscAzure },
          { name: 'Azure Functions', icon: VscAzure },
          { name: 'Blob Storage', icon: VscAzure },
          { name: 'Virtual Machines', icon: VscAzure },
        ],
      },
    ],
  },
]
