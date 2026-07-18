import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js'
import type { ZodRawShape } from 'zod'

export interface McpToolDefinition {
  description: string
  inputSchema?: ZodRawShape
  annotations?: ToolAnnotations
}
