import type { SqlToolHandlerOptions } from '../types/sql-tool-handler-options'
import { SqlToolHandler } from './sql-tool.handler'

export class PostgresToolHandler extends SqlToolHandler {
  constructor(options: SqlToolHandlerOptions) {
    super(options, 'PostgreSQL')
  }

  // PostgreSQL READ ONLY transactions reject DML and DDL alike, so the
  // transaction wrapper is sufficient on its own.
  protected assertReadOnlyQueryAllowed(_query: string): void {
    // Intentionally empty — enforcement is fully database-side.
  }
}
