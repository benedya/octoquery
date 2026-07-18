import { MySqlContainer } from '@testcontainers/mysql'
import { DataSource } from 'typeorm'
import type { StartedTestDatabase } from './test-database'

// Starts a disposable MySQL container and runs the given init statements.
export const startMysqlDatabase = async (
  initSql: string[] = [],
): Promise<StartedTestDatabase> => {
  const container = await new MySqlContainer('mysql:8').start()

  const dataSource = new DataSource({
    type: 'mysql',
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getUserPassword(),
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
      password: container.getUserPassword(),
    },
    stop: async () => {
      await dataSource.destroy()
      await container.stop()
    },
  }
}
