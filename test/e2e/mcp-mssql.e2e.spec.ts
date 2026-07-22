// The side-effect import must stay first: it prepares the environment that
// src/app.module (imported via the helpers) validates eagerly at import time.
import './setup/e2e-env'
import { writeFileSync } from 'node:fs'
import { McpTestApp } from './helpers/mcp-test-app'
import { rowsOf, textOf } from './helpers/tool-result'
import { startMssqlDatabase } from './setup/mssql-database'
import type { StartedTestDatabase } from './setup/test-database'

describe('MCP over SQL Server (e2e)', () => {
  let database: StartedTestDatabase
  let app: McpTestApp

  beforeAll(async () => {
    database = await startMssqlDatabase([
      'CREATE TABLE items (id INT IDENTITY PRIMARY KEY, name NVARCHAR(50) NOT NULL)',
      "INSERT INTO items (name) VALUES ('alpha'), ('beta'), ('gamma')",
    ])

    writeFileSync(
      process.env.MCP_SQL_TOOLS_FILE as string,
      JSON.stringify([
        {
          name: 'sql_e2e',
          type: 'mssql',
          label: 'e2e',
          ...database.connection,
          enableTLS: false,
        },
        {
          name: 'sql_e2e_limited',
          type: 'mssql',
          label: 'e2e limited',
          maxRows: 2,
          ...database.connection,
          enableTLS: false,
        },
      ]),
    )

    app = await McpTestApp.start()
  })

  afterAll(async () => {
    await app?.close()
    await database?.stop()
  })

  it('advertises one tool per configured database', async () => {
    const { tools } = await app.listTools()

    expect(tools.map((tool: { name: string }) => tool.name)).toEqual([
      'sql_e2e',
      'sql_e2e_limited',
    ])
    expect(tools[0].description).toContain('SQL Server')
  })

  it('executes a SELECT and returns rows', async () => {
    const result = await app.callTool(
      'sql_e2e',
      'SELECT name FROM items ORDER BY id',
    )

    expect(result.isError).toBeUndefined()
    expect(rowsOf(result)).toEqual([
      { name: 'alpha' },
      { name: 'beta' },
      { name: 'gamma' },
    ])
  })

  it('rejects an empty query', async () => {
    const result = await app.callTool('sql_e2e', '   ')

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('non-empty')
  })

  it('rejects INSERT in read-only mode', async () => {
    const result = await app.callTool(
      'sql_e2e',
      "INSERT INTO items (name) VALUES ('delta')",
    )

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Only read statements')
  })

  it('rejects DDL in read-only mode', async () => {
    const result = await app.callTool('sql_e2e', 'CREATE TABLE hacked (x INT)')

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Only read statements')
  })

  it('rejects SELECT INTO in read-only mode', async () => {
    const result = await app.callTool(
      'sql_e2e',
      'SELECT name INTO stolen FROM items',
    )

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Only read statements')
  })

  it('rejects semicolon-less batch smuggling in read-only mode', async () => {
    const result = await app.callTool(
      'sql_e2e',
      'SELECT 1 COMMIT DELETE FROM items',
    )

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Only read statements')
  })

  it('rejects multi-statement queries in read-only mode', async () => {
    const result = await app.callTool('sql_e2e', 'SELECT 1; DROP TABLE items')

    expect(result.isError).toBe(true)
  })

  it('truncates results to the tool maxRows with a warning', async () => {
    const result = await app.callTool(
      'sql_e2e_limited',
      'SELECT name FROM items ORDER BY id',
    )

    const payload = JSON.parse(textOf(result)) as {
      rows: unknown[]
      totalRows: number
      warning?: string
    }
    expect(payload.rows).toHaveLength(2)
    expect(payload.totalRows).toBe(3)
    expect(payload.warning).toContain('truncated')
  })

  describe('with read-only mode disabled', () => {
    let writableApp: McpTestApp

    beforeAll(async () => {
      process.env.MCP_READ_ONLY = 'false'
      writableApp = await McpTestApp.start()
    })

    afterAll(async () => {
      process.env.MCP_READ_ONLY = 'true'
      await writableApp?.close()
    })

    it('allows writes', async () => {
      const insert = await writableApp.callTool(
        'sql_e2e',
        "INSERT INTO items (name) VALUES ('writable')",
      )
      expect(insert.isError).toBeUndefined()

      const cleanup = await writableApp.callTool(
        'sql_e2e',
        "DELETE FROM items WHERE name = 'writable'",
      )
      expect(cleanup.isError).toBeUndefined()
    })
  })
})
