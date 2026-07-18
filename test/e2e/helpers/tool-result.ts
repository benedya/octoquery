import type { McpToolResponse } from '../../../src/mcp/types/mcp-tool-response'

export const textOf = (response: McpToolResponse): string => {
  const [first] = response.content

  if (first?.type !== 'text') {
    throw new Error(`Expected a text content block, got ${first?.type}`)
  }

  return first.text
}

export const rowsOf = (response: McpToolResponse): Record<string, unknown>[] =>
  (JSON.parse(textOf(response)) as { rows: Record<string, unknown>[] }).rows
