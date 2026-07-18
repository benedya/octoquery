import { Module } from '@nestjs/common'
import { McpAuthGuard } from './mcp-auth.guard'
import { OidcJwtService } from './oidc-jwt.service'
import { ProtectedResourceMetadataController } from './protected-resource-metadata.controller'

@Module({
  controllers: [ProtectedResourceMetadataController],
  providers: [OidcJwtService, McpAuthGuard],
  exports: [OidcJwtService, McpAuthGuard],
})
export class AuthModule {}
