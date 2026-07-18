import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { MCP_TOOL_HANDLERS } from './mcp.constants'
import type { McpToolHandlerInterface } from './tools/mcp-tool-handler.interface'

@Injectable()
export class McpServerService {
  private readonly logger = new Logger(McpServerService.name)
  private readonly transports = new Map<string, StreamableHTTPServerTransport>()

  constructor(
    @Inject(MCP_TOOL_HANDLERS)
    private readonly toolHandlers: McpToolHandlerInterface[],
  ) {}

  async createServerWithTransport(): Promise<{
    server: McpServer
    transport: StreamableHTTPServerTransport
  }> {
    const server = new McpServer({
      name: 'octoquery',
      version: '1.0.0',
    })

    this.registerTools(server)

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
    })

    transport.onclose = () => {
      const sessionId = transport.sessionId
      if (sessionId) {
        this.removeTransport(sessionId)
      }
    }

    await server.connect(transport)

    return { server, transport }
  }

  private registerTools(server: McpServer): void {
    for (const handler of this.toolHandlers) {
      server.registerTool(handler.name, handler.definition, (params: unknown) =>
        handler.execute(params),
      )
      this.logger.log(`Registered MCP tool "${handler.name}"`)
    }
  }

  registerTransport(
    sessionId: string,
    transport: StreamableHTTPServerTransport,
  ): void {
    this.transports.set(sessionId, transport)
    this.logger.log(`Registered MCP session "${sessionId}"`)
  }

  getTransport(sessionId: string): StreamableHTTPServerTransport | undefined {
    return this.transports.get(sessionId)
  }

  removeTransport(sessionId: string): void {
    this.logger.log(`Removing MCP session "${sessionId}"`)
    this.transports.delete(sessionId)
  }
}
