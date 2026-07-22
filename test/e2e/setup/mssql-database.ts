import { MSSQLServerContainer } from '@testcontainers/mssqlserver'
import { DataSource } from 'typeorm'
import type { StartedTestDatabase } from './test-database'

// Starts a disposable SQL Server container and runs the given init statements.
export const startMssqlDatabase = async (
  initSql: string[] = [],
): Promise<StartedTestDatabase> => {
  const container = await new MSSQLServerContainer(
    'mcr.microsoft.com/mssql/server:2022-latest',
  )
    .acceptLicense()
    .start()

  const dataSource = new DataSource({
    type: 'mssql',
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
    options: {
      encrypt: false,
      trustServerCertificate: true,
    },
  })
  await dataSource.initialize()

  for (const statement of initSql) {
    await dataSource.query(statement)
  }

  return {
    dataSource,
    connection: {
      host: container.getHost(),
      port: container.getPort(),
      database: container.getDatabase(),
      user: container.getUsername(),
      password: container.getPassword(),
    },
    stop: async () => {
      await dataSource.destroy()
      await container.stop()
    },
  }
}
