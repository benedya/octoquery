import { isReadStatement } from '../helpers/is-read-statement'
import type { SqlToolHandlerOptions } from '../types/sql-tool-handler-options'
import { SqlToolHandler } from './sql-tool.handler'

export class MysqlToolHandler extends SqlToolHandler {
  constructor(options: SqlToolHandlerOptions, databaseProductName = 'MySQL') {
    super(options, databaseProductName)
  }

  // MySQL READ ONLY transactions block DML but not DDL: DDL statements
  // implicitly COMMIT the transaction and execute outside of it. Restrict
  // statements to a read allowlist on top of the transaction wrapper —
  // see isReadStatement.
  protected assertReadOnlyQueryAllowed(query: string): void {
    if (!isReadStatement(query)) {
      throw new Error(
        'Only read statements (SELECT, WITH, SHOW, DESCRIBE, EXPLAIN) are allowed in read-only mode.',
      )
    }
  }
}
