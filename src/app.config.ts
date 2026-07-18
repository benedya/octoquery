import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cwd, env } from 'node:process'
import type { AppConfig } from './types/app-config'
import type { SqlToolConfig } from './types/sql-tool-config'
import { sqlToolsConfigSchema } from './validation/sql-tools-config.schema'

export const sqlToolsConfigPath = (): string =>
  resolve(cwd(), env.MCP_SQL_TOOLS_FILE ?? 'mcp-sql-tools.json')

export const loadSqlToolsConfig = (): SqlToolConfig[] => {
  const filePath = sqlToolsConfigPath()

  let raw: string

  try {
    raw = readFileSync(filePath, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Cannot read SQL tools config file "${filePath}": ${message}. ` +
        'Copy mcp-sql-tools.example.json to mcp-sql-tools.json and fill in your databases.',
    )
  }

  let json: unknown

  try {
    json = JSON.parse(raw)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`"${filePath}" is not valid JSON: ${message}`)
  }

  const result = sqlToolsConfigSchema.safeParse(json)

  if (!result.success) {
    throw new Error(`Invalid "${filePath}": ${result.error.message}`)
  }

  return result.data
}

export const appConfig = (): AppConfig => ({
  environment: env.NODE_ENV as string,
  port: Number.parseInt(env.PORT ?? '3000', 10),
  logging: {
    level: env.LOG_LEVEL ?? 'info',
  },
  mcp: {
    maxRows: Number.parseInt(env.MCP_MAX_ROWS ?? '100', 10),
    readOnly: env.MCP_READ_ONLY !== 'false',
    tools: loadSqlToolsConfig(),
  },
  auth: {
    enabled: env.MCP_AUTH_ENABLED !== 'false',
    issuer: env.AUTH_ISSUER,
    audience: env.AUTH_AUDIENCE,
    baseUrl: env.BASE_URL?.replace(/\/$/, ''),
  },
})
