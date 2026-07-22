import { z } from 'zod'

// One entry per MCP SQL tool, configured in a JSON file (mcp-sql-tools.json by
// default) as an array. The tool name is fully caller-defined (e.g.
// "sql_transformation_dev"), so any environment/database combination can be
// exposed without code changes.
export const sqlToolConfigSchema = z.object({
  name: z
    .string()
    .regex(
      /^[a-zA-Z0-9_-]{1,64}$/,
      'Tool name must contain only letters, digits, "_" or "-" (max 64 chars)',
    ),
  type: z.enum(['postgres', 'mysql', 'mariadb', 'mssql']).default('postgres'),
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  maxRows: z.number().int().positive().optional(),
  host: z.string().min(1),
  // Defaults to the engine's standard port (5432 for postgres, 3306 for
  // mysql/mariadb, 1433 for mssql).
  port: z.number().int().positive().optional(),
  database: z.string().min(1),
  user: z.string().min(1),
  password: z.string(),
  enableTLS: z.boolean().default(true),
})

export const sqlToolsConfigSchema = z
  .array(sqlToolConfigSchema)
  .min(1, 'The SQL tools config must contain at least one tool')
  .superRefine((tools, ctx) => {
    const seen = new Set<string>()

    tools.forEach((tool, index) => {
      if (seen.has(tool.name)) {
        ctx.addIssue({
          code: 'custom',
          path: [index, 'name'],
          message: `Duplicate tool name "${tool.name}"`,
        })
      }

      seen.add(tool.name)
    })
  })
