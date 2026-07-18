import { All, Controller, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'
import { McpAuthGuard } from '../auth/mcp-auth.guard'
import { McpServerService } from './mcp-server.service'

@Controller('mcp')
@UseGuards(McpAuthGuard)
export class McpController {
  constructor(private readonly mcpServerService: McpServerService) {}

  @All()
  async handleMcp(@Req() req: Request, @Res() res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'] as string | undefined

    if (sessionId) {
      const transport = this.mcpServerService.getTransport(sessionId)

      if (!transport) {
        res.status(404).json({ error: 'Session not found' })
        return
      }

      await transport.handleRequest(req, res, req.body)
      return
    }

    const { transport } =
      await this.mcpServerService.createServerWithTransport()

    await transport.handleRequest(req, res, req.body)

    if (transport.sessionId) {
      this.mcpServerService.registerTransport(transport.sessionId, transport)
    }
  }
}
