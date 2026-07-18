import 'dotenv/config'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { applyAppConfig } from './main.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })
  const configService = app.get(ConfigService)
  const port = configService.getOrThrow<number>('port')

  applyAppConfig(app)

  await app.listen(port)
}

void bootstrap()
