import type { McpToolResponse } from '../types/mcp-tool-response'

export const successResponse = (data: unknown): McpToolResponse => ({
  content: [{ type: 'text', text: JSON.stringify(data) }],
})

export const errorResponse = (message: string): McpToolResponse => ({
  isError: true,
  content: [{ type: 'text', text: message }],
})
