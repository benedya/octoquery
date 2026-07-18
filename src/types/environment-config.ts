import type { z } from 'zod'
import type { envValidationSchema } from '../validation/env.schema'

export type EnvironmentConfig = z.infer<typeof envValidationSchema>
