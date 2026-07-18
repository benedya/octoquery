import { z } from 'zod'
import { loadSqlToolsConfig } from '../app.config'

export const envValidationSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error'])
      .default('info'),
    MCP_MAX_ROWS: z.coerce.number().int().positive().default(100),
    MCP_SQL_TOOLS_FILE: z.string().optional(),
    MCP_AUTH_ENABLED: z.enum(['true', 'false']).optional(),
    AUTH_ISSUER: z.url().optional(),
    AUTH_AUDIENCE: z.string().optional(),
    BASE_URL: z.url().optional(),
  })
  .superRefine((config, ctx) => {
    if (config.MCP_AUTH_ENABLED !== 'false') {
      for (const key of ['AUTH_ISSUER', 'BASE_URL'] as const) {
        if (!config[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required when MCP_AUTH_ENABLED is not "false"`,
          })
        }
      }
    }

    try {
      loadSqlToolsConfig()
    } catch (error) {
      ctx.addIssue({
        code: 'custom',
        path: ['MCP_SQL_TOOLS_FILE'],
        message: error instanceof Error ? error.message : String(error),
      })
    }
  })
