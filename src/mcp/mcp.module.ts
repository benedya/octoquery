import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { DataSourceOptions } from 'typeorm'
import { AuthModule } from '../auth/auth.module'
import type { SqlToolConfig } from '../types/sql-tool-config'
import { createLazyDataSource } from './database/lazy-data-source'
import { MCP_TOOL_HANDLERS } from './mcp.constants'
import { McpController } from './mcp.controller'
import { McpServerService } from './mcp-server.service'
import { MariadbToolHandler } from './tools/mariadb-tool.handler'
import { MysqlToolHandler } from './tools/mysql-tool.handler'
import { PostgresToolHandler } from './tools/postgres-tool.handler'
import type { SqlToolHandler } from './tools/sql-tool.handler'
import type { SqlToolHandlerOptions } from './types/sql-tool-handler-options'

const toDataSourceOptions = (tool: SqlToolConfig): DataSourceOptions => {
  const common = {
    host: tool.host,
    database: tool.database,
    username: tool.user,
    password: tool.password,
  }

  if (tool.type === 'mysql' || tool.type === 'mariadb') {
    return {
      type: tool.type,
      ...common,
      port: tool.port ?? 3306,
      ssl: tool.enableTLS ? { rejectUnauthorized: false } : undefined,
    }
  }

  return {
    type: 'postgres',
    ...common,
    port: tool.port ?? 5432,
    ssl: tool.enableTLS && {
      rejectUnauthorized: false,
    },
  }
}

@Module({
  imports: [AuthModule],
  controllers: [McpController],
  providers: [
    McpServerService,
    {
      provide: MCP_TOOL_HANDLERS,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SqlToolHandler[] => {
        const defaultMaxRows = configService.getOrThrow<number>('mcp.maxRows')
        const readOnly = configService.getOrThrow<boolean>('mcp.readOnly')
        const tools = configService.getOrThrow<SqlToolConfig[]>('mcp.tools')

        return tools.map((tool) => {
          const options: SqlToolHandlerOptions = {
            name: tool.name,
            databaseLabel: tool.label ?? tool.name,
            description: tool.description,
            maxRows: tool.maxRows ?? defaultMaxRows,
            readOnly,
            getDataSource: createLazyDataSource(toDataSourceOptions(tool)),
          }

          switch (tool.type) {
            case 'mysql':
              return new MysqlToolHandler(options)
            case 'mariadb':
              return new MariadbToolHandler(options)
            default:
              return new PostgresToolHandler(options)
          }
        })
      },
    },
  ],
})
export class McpModule {}
