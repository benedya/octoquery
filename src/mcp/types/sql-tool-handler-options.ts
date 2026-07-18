import type { DataSource } from 'typeorm'

export interface SqlToolHandlerOptions {
  name: string
  databaseLabel: string
  description?: string
  maxRows: number
  readOnly: boolean
  getDataSource: () => Promise<DataSource>
}
