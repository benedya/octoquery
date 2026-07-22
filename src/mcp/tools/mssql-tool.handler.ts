import type { QueryRunner } from 'typeorm'
import { isMssqlReadStatement } from '../helpers/is-mssql-read-statement'
import type { SqlToolHandlerOptions } from '../types/sql-tool-handler-options'
import { SqlToolHandler } from './sql-tool.handler'

// SQL Server has no READ ONLY transaction mode, so read-only enforcement is
// two layers deep: a strict statement screen (see isMssqlReadStatement) and a
// wrapper transaction that is ALWAYS rolled back — SQL Server DML and DDL are
// both transactional, so even a write that slips through the screen (e.g.
// hidden in a construct the regexes miss) does not persist.
export class MssqlToolHandler extends SqlToolHandler {
  constructor(options: SqlToolHandlerOptions) {
    super(options, 'SQL Server')
  }

  protected assertReadOnlyQueryAllowed(query: string): void {
    if (!isMssqlReadStatement(query)) {
      throw new Error(
        'Only read statements (SELECT, WITH) without data-modifying keywords are allowed in read-only mode.',
      )
    }
  }

  // Read-only queries have nothing to persist, so the transaction is always
  // rolled back. The driver's transaction API is used (not raw BEGIN/ROLLBACK
  // statements) because the mssql driver validates @@TRANCOUNT per request
  // and rejects batches that change it.
  protected override async runReadOnlyTransaction(
    queryRunner: QueryRunner,
    query: string,
  ): Promise<unknown> {
    await queryRunner.startTransaction()

    try {
      return await queryRunner.query(query)
    } finally {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction().catch(() => undefined)
      }
    }
  }
}
