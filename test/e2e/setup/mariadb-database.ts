import { MariaDbContainer } from '@testcontainers/mariadb'
import { DataSource } from 'typeorm'
import type { StartedTestDatabase } from './test-database'

// Starts a disposable MariaDB container and runs the given init statements.
export const startMariadbDatabase = async (
  initSql: string[] = [],
): Promise<StartedTestDatabase> => {
  const container = await new MariaDbContainer('mariadb:11').start()

  const dataSource = new DataSource({
    type: 'mariadb',
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
