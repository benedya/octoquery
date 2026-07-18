import { DataSource, type DataSourceOptions } from 'typeorm'

// Defers opening the connection until the first query so that databases used
// only by MCP tools do not have to be reachable at application startup.
export const createLazyDataSource = (
  options: DataSourceOptions,
): (() => Promise<DataSource>) => {
  let initialization: Promise<DataSource> | undefined

  return () => {
    initialization ??= new DataSource(options)
      .initialize()
      .catch((error: unknown) => {
        initialization = undefined
        throw error
      })

    return initialization
  }
}
