import { randomUUID } from 'node:crypto'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoggerModule, type Params as NestJSPinoParams } from 'nestjs-pino'
import { appConfig } from './app.config'
import { AuthModule } from './auth/auth.module'
import { McpModule } from './mcp/mcp.module'
import type { EnvironmentConfig } from './types/environment-config'
import { envValidationSchema } from './validation/env.schema'

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [appConfig],
      validate(config): EnvironmentConfig {
        const validationResult = envValidationSchema.safeParse(config)

        if (!validationResult.success) {
          throw new Error(
            `Invalid environment variables: ${validationResult.error.message}`,
          )
        }

        return validationResult.data
      },
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService): NestJSPinoParams {
        return {
          pinoHttp: {
            genReqId(req, res) {
              const reqIdHeader = 'X-Request-Id'
              let reqId = req.id ?? req.headers[reqIdHeader]

              if (reqId) {
                return reqId
              }

              reqId = randomUUID()
              res.setHeader(reqIdHeader, reqId)
              return reqId
            },
            autoLogging: false,
            quietReqLogger: true,
            level: configService.getOrThrow<string>('logging.level'),
            transport:
              configService.getOrThrow<string>('environment') !== 'production'
                ? { target: 'pino-pretty' }
                : undefined,
            messageKey: 'message',
            errorKey: 'error',
            formatters: {
              level(label) {
                return { level: label.toUpperCase() }
              },
              bindings() {
                return {}
              },
            },
          },
        }
      },
    }),
    AuthModule,
    McpModule,
  ],
})
export class AppModule {}
