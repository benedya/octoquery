import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { DataSourceOptions } from 'typeorm'
import { AuthModule } from '../auth/auth.module'
import type { SqlToolConfig } from '../types/sql-tool-config'
import { createLazyDataSource } from './database/lazy-data-source'
import { MCP_TOOL_HANDLERS } from './mcp.constants'
import { McpController } from './mcp.controller'
import { McpServerService } from './mcp-server.service'
import { SqlToolHandler } from './tools/sql-tool.handler'

const toDataSourceOptions = (tool: SqlToolConfig): DataSourceOptions => ({
  type: 'postgres',
  host: tool.host,
  port: tool.port,
  database: tool.database,
  username: tool.user,
  password: tool.password,
  ssl: tool.enableTLS && {
    rejectUnauthorized: false,
  },
})

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

        return tools.map(
          (tool) =>
            new SqlToolHandler({
              name: tool.name,
              databaseLabel: tool.label ?? tool.name,
              description: tool.description,
              maxRows: tool.maxRows ?? defaultMaxRows,
              readOnly,
              getDataSource: createLazyDataSource(toDataSourceOptions(tool)),
            }),
        )
      },
    },
  ],
})
export class McpModule {}
