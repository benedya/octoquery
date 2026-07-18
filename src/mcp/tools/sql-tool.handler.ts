import { Logger } from '@nestjs/common'
import type { DataSource } from 'typeorm'
import { z } from 'zod'
import { isMultiStatement } from '../helpers/is-multi-statement'
import { errorResponse, successResponse } from '../helpers/tool-response'
import type { McpToolDefinition } from '../types/mcp-tool-definition'
import type { McpToolResponse } from '../types/mcp-tool-response'
import type { SqlToolHandlerOptions } from '../types/sql-tool-handler-options'
import type { McpToolHandlerInterface } from './mcp-tool-handler.interface'

export class SqlToolHandler implements McpToolHandlerInterface {
  readonly name: string
  readonly definition: McpToolDefinition

  private readonly logger: Logger

  constructor(private readonly options: SqlToolHandlerOptions) {
    this.name = options.name
    this.definition = {
      description:
        options.description ??
        `Execute a SQL query against the ${options.databaseLabel} PostgreSQL database. Returns query results as JSON. ${
          options.readOnly
            ? 'Only read queries are allowed: each query runs as a single statement in a read-only transaction, so statements that modify data are rejected.'
            : 'Caller is fully trusted — any SQL statement is accepted.'
        }`,
      inputSchema: {
        query: z.string().describe('The SQL query to execute'),
      },
      annotations: {
        title: `SQL (${options.databaseLabel})`,
        readOnlyHint: options.readOnly,
      },
    }
    this.logger = new Logger(`${SqlToolHandler.name}:${options.name}`)
  }

  async execute(params: unknown): Promise<McpToolResponse> {
    const query =
      typeof (params as { query?: unknown })?.query === 'string'
        ? (params as { query: string }).query.trim()
        : ''

    if (!query) {
      return errorResponse('Query must be a non-empty string.')
    }

    this.logger.log(`Executing SQL query: ${query}`)

    try {
      const dataSource = await this.options.getDataSource()
      const rawResult = this.options.readOnly
        ? await this.executeReadOnly(dataSource, query)
        : await dataSource.query(query)
      const isArray = Array.isArray(rawResult)
      const totalRows = isArray ? rawResult.length : 0
      const truncated = isArray && totalRows > this.options.maxRows
      const rows = truncated
        ? rawResult.slice(0, this.options.maxRows)
        : rawResult

      const result: Record<string, unknown> = {
        rows,
        totalRows,
      }

      if (truncated) {
        result.warning = `Result truncated to ${this.options.maxRows} rows out of ${totalRows}.`
      }

      return successResponse(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      this.logger.error(`SQL query failed: ${message}`)

      return errorResponse(`Query failed: ${message}`)
    }
  }

  // Runs the query inside a READ ONLY transaction so the database itself
  // rejects writes and DDL. Multi-statement queries are refused up front —
  // see isMultiStatement for why the transaction alone is not enough.
  private async executeReadOnly(
    dataSource: DataSource,
    query: string,
  ): Promise<unknown> {
    if (isMultiStatement(query)) {
      throw new Error(
        'Multiple SQL statements per query are not allowed in read-only mode.',
      )
    }

    const queryRunner = dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      await queryRunner.query('SET TRANSACTION READ ONLY')
      const result: unknown = await queryRunner.query(query)
      await queryRunner.commitTransaction()

      return result
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction().catch(() => undefined)
      }

      throw error
    } finally {
      await queryRunner.release()
    }
  }
}
