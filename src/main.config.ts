import type { INestApplication } from '@nestjs/common'
import { Logger as PinoLogger } from 'nestjs-pino'

export function applyAppConfig(app: INestApplication): void {
  app.useLogger(app.get(PinoLogger))

  app.enableShutdownHooks()

  app.enableCors({
    origin: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'mcp-session-id',
      'mcp-protocol-version',
      'last-event-id',
    ],
    exposedHeaders: ['mcp-session-id', 'WWW-Authenticate'],
  })
}
