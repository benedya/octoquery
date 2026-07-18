import { Controller, Get } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface ProtectedResourceMetadata {
  resource: string
  authorization_servers: string[]
  bearer_methods_supported: string[]
  resource_name: string
}

// RFC 9728 protected-resource metadata. MCP clients discover the authorization
// server from here after receiving a 401 with a WWW-Authenticate header.
@Controller('.well-known')
export class ProtectedResourceMetadataController {
  constructor(private readonly configService: ConfigService) {}

  @Get('oauth-protected-resource')
  getMetadata(): ProtectedResourceMetadata {
    return this.buildMetadata()
  }

  // Path-suffixed variant: clients derive the metadata URL from the resource
  // path (<base>/mcp -> <base>/.well-known/oauth-protected-resource/mcp).
  @Get('oauth-protected-resource/mcp')
  getMetadataForMcp(): ProtectedResourceMetadata {
    return this.buildMetadata()
  }

  private buildMetadata(): ProtectedResourceMetadata {
    const baseUrl = this.configService.getOrThrow<string>('auth.baseUrl')

    return {
      resource: `${baseUrl}/mcp`,
      authorization_servers: [
        this.configService.getOrThrow<string>('auth.issuer'),
      ],
      bearer_methods_supported: ['header'],
      resource_name: 'OctoQuery',
    }
  }
}
