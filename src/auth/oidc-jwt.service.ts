import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
// Type-only imports are erased at compile time, so they are safe with the
// ESM-only jose package; the implementation is loaded via dynamic import().
import type { JWTPayload, JWTVerifyGetKey, jwtVerify } from 'jose'

interface Verifier {
  verify: typeof jwtVerify
  getKey: JWTVerifyGetKey
}

// Validates access tokens issued by any OIDC provider (Auth0, Okta, ...):
// discovers the JWKS from the issuer and verifies signature, iss, aud, exp.
@Injectable()
export class OidcJwtService {
  private readonly logger = new Logger(OidcJwtService.name)
  private verifierInitialization: Promise<Verifier> | undefined

  constructor(private readonly configService: ConfigService) {}

  async verify(token: string): Promise<JWTPayload> {
    const { verify, getKey } = await this.getVerifier()

    const audience = this.configService.get<string>('auth.audience')

    const { payload } = await verify(token, getKey, {
      issuer: this.configService.getOrThrow<string>('auth.issuer'),
      ...(audience && { audience }),
      algorithms: ['RS256'],
    })

    return payload
  }

  // Memoized so OIDC discovery runs once; reset on failure so a transient
  // network error does not poison all subsequent requests.
  private getVerifier(): Promise<Verifier> {
    this.verifierInitialization ??= this.buildVerifier().catch(
      (error: unknown) => {
        this.verifierInitialization = undefined
        throw error
      },
    )

    return this.verifierInitialization
  }

  private async buildVerifier(): Promise<Verifier> {
    // jose v6 is ESM-only; dynamic import() is preserved in the CJS output.
    const jose = await import('jose')
    const issuer = this.configService.getOrThrow<string>('auth.issuer')

    const discoveryUrl = new URL(
      '.well-known/openid-configuration',
      `${issuer.replace(/\/$/, '')}/`,
    )
    const response = await fetch(discoveryUrl)

    if (!response.ok) {
      throw new Error(
        `OIDC discovery failed: ${response.status} ${response.statusText} (${discoveryUrl})`,
      )
    }

    const discovery = (await response.json()) as { jwks_uri?: string }

    if (!discovery.jwks_uri) {
      throw new Error(
        `OIDC discovery document has no jwks_uri (${discoveryUrl})`,
      )
    }

    this.logger.log(`Using JWKS from ${discovery.jwks_uri}`)

    return {
      verify: jose.jwtVerify,
      // Caches keys and refetches on unknown kid (with cooldown) out of the box.
      getKey: jose.createRemoteJWKSet(new URL(discovery.jwks_uri)),
    }
  }
}
