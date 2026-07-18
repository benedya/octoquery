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
  label: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  maxRows: z.number().int().positive().optional(),
  host: z.string().min(1),
  port: z.number().int().positive().default(5432),
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
