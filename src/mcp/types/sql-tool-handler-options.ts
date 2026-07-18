import type { DataSource } from 'typeorm'

export interface SqlToolHandlerOptions {
  name: string
  databaseLabel: string
  description?: string
  maxRows: number
  getDataSource: () => Promise<DataSource>
}
