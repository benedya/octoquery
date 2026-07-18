import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import type { JWTPayload } from 'jose'
import { OidcJwtService } from './oidc-jwt.service'

// OAuth 2.0 resource-server guard per the MCP authorization spec: validates
// bearer JWTs issued by the configured OIDC provider and advertises the
// protected-resource metadata via the WWW-Authenticate header on 401/403 so
// MCP clients can discover the authorization server.
@Injectable()
export class McpAuthGuard implements CanActivate {
  private readonly logger = new Logger(McpAuthGuard.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly oidcJwtService: OidcJwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.configService.getOrThrow<boolean>('auth.enabled')) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const response = context.switchToHttp().getResponse<Response>()

    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1]

    if (!token) {
      // RFC 6750 §3.1: no error code when the request lacks credentials.
      this.setChallenge(response)
      throw new UnauthorizedException('Missing bearer token')
    }

    let payload: JWTPayload

    try {
      payload = await this.oidcJwtService.verify(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.warn(`Token validation failed: ${message}`)
      this.setChallenge(response, { error: 'invalid_token' })
      throw new UnauthorizedException('Invalid or expired access token')
    }

    ;(request as Request & { auth?: JWTPayload }).auth = payload

    return true
  }

  // Headers set on the live response survive the thrown HttpException because
  // Nest's exception filter writes status and body onto the same response.
  private setChallenge(
    response: Response,
    params: Record<string, string> = {},
  ): void {
    const baseUrl = this.configService.getOrThrow<string>('auth.baseUrl')
    const challengeParams = {
      ...params,
      resource_metadata: `${baseUrl}/.well-known/oauth-protected-resource/mcp`,
    }
    const challenge = Object.entries(challengeParams)
      .map(([key, value]) => `${key}="${value}"`)
      .join(', ')

    response.setHeader('WWW-Authenticate', `Bearer ${challenge}`)
  }
}
