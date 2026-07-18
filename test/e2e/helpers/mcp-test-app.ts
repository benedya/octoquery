import type { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { AppModule } from '../../../src/app.module'

// Per the Streamable HTTP spec the server chooses the response format per
// request — plain application/json or an SSE stream — so parse both.
// biome-ignore lint/suspicious/noExplicitAny: JSON-RPC payloads are dynamic
const jsonRpcResponse = (text: string): any => {
  const dataLine = text
    .split('\n')
    .filter((line) => line.startsWith('data: '))
    .pop()

  return JSON.parse(dataLine ? dataLine.slice('data: '.length) : text)
}

// Boots the full Nest application and talks to /mcp over Streamable HTTP
// exactly like an MCP client (initialize -> notifications/initialized ->
// tools/*). The environment (auth, tools file, read-only mode) must be
// prepared before this module's import — see setup/e2e-env.ts.
export class McpTestApp {
  private sessionId: string | undefined

  private constructor(private readonly app: INestApplication) {}

  static async start(): Promise<McpTestApp> {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    const app = moduleRef.createNestApplication({ logger: false })
    await app.init()

    const instance = new McpTestApp(app)

    const initResponse = await instance.post({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'e2e', version: '1.0' },
      },
    })

    instance.sessionId = initResponse.headers['mcp-session-id']

    if (!instance.sessionId) {
      throw new Error('MCP initialize did not return a session id')
    }

    await instance.post({ jsonrpc: '2.0', method: 'notifications/initialized' })

    return instance
  }

  post(body: Record<string, unknown>) {
    const post = request(this.app.getHttpServer())
      .post('/mcp')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json, text/event-stream')

    return (
      this.sessionId ? post.set('mcp-session-id', this.sessionId) : post
    ).send(body)
  }

  // biome-ignore lint/suspicious/noExplicitAny: JSON-RPC payloads are dynamic
  async listTools(): Promise<any> {
    const response = await this.post({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    })

    return jsonRpcResponse(response.text).result
  }

  // biome-ignore lint/suspicious/noExplicitAny: JSON-RPC payloads are dynamic
  async callTool(name: string, query: string): Promise<any> {
    const response = await this.post({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: { name, arguments: { query } },
    })

    return jsonRpcResponse(response.text).result
  }

  httpServer() {
    return this.app.getHttpServer()
  }

  async close(): Promise<void> {
    await this.app.close()
  }
}
