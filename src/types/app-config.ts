import type { SqlToolConfig } from './sql-tool-config'

export interface AppConfig {
  environment: string
  port: number
  logging: {
    level: string
  }
  mcp: {
    maxRows: number
    tools: SqlToolConfig[]
  }
  auth: {
    enabled: boolean
    issuer?: string
    audience?: string
    baseUrl?: string
  }
}
