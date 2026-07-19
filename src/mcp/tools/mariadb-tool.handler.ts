import type { SqlToolHandlerOptions } from '../types/sql-tool-handler-options'
import { MysqlToolHandler } from './mysql-tool.handler'

// MariaDB is protocol- and semantics-compatible with MySQL, including the
// read-only caveats (DDL implicitly commits and escapes READ ONLY
// transactions), so it reuses the MySQL handler behavior wholesale.
export class MariadbToolHandler extends MysqlToolHandler {
  constructor(options: SqlToolHandlerOptions) {
    super(options, 'MariaDB')
  }
}
