import type { z } from 'zod'
import type { sqlToolConfigSchema } from '../validation/sql-tools-config.schema'

export type SqlToolConfig = z.infer<typeof sqlToolConfigSchema>
