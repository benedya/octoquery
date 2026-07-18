import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { DataSource } from 'typeorm'
import type { StartedTestDatabase } from './test-database'

// Starts a disposable PostgreSQL container and runs the given init statements.
export const startPostgresDatabase = async (
  initSql: string[] = [],
): Promise<StartedTestDatabase> => {
  const container = await new PostgreSqlContainer('postgres:17-alpine').start()

  const dataSource = new DataSource({
    type: 'postgres',
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
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
