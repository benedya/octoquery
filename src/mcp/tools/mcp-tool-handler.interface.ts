import type { McpToolDefinition } from '../types/mcp-tool-definition'
import type { McpToolResponse } from '../types/mcp-tool-response'

export interface McpToolHandlerInterface {
  readonly name: string
  readonly definition: McpToolDefinition
  execute(params: unknown): Promise<McpToolResponse>
}
