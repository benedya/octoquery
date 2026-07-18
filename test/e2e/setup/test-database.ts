import type { DataSource } from 'typeorm'

// A disposable database started for one test suite.
export interface StartedTestDatabase {
  dataSource: DataSource
  // Raw connection coordinates, e.g. for building an mcp-sql-tools file.
  connection: {
    host: string
    port: number
    database: string
    user: string
    password: string
  }
  stop(): Promise<void>
}
