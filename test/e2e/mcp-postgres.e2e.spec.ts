// The side-effect import must stay first: it prepares the environment that
// src/app.module (imported via the helpers) validates eagerly at import time.
import './setup/e2e-env'
import { writeFileSync } from 'node:fs'
import request from 'supertest'
import { McpTestApp } from './helpers/mcp-test-app'
import { rowsOf, textOf } from './helpers/tool-result'
import { startPostgresDatabase } from './setup/postgres-database'
import type { StartedTestDatabase } from './setup/test-database'

describe('MCP over PostgreSQL (e2e)', () => {
  let database: StartedTestDatabase
  let app: McpTestApp

  beforeAll(async () => {
    database = await startPostgresDatabase([
      'CREATE TABLE items (id SERIAL PRIMARY KEY, name TEXT NOT NULL)',
      "INSERT INTO items (name) VALUES ('alpha'), ('beta'), ('gamma')",
    ])

    writeFileSync(
      process.env.MCP_SQL_TOOLS_FILE as string,
      JSON.stringify([
        {
          name: 'sql_e2e',
          label: 'e2e',
          ...database.connection,
          enableTLS: false,
        },
        {
          name: 'sql_e2e_limited',
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
    expect(tools[0].description).toContain('PostgreSQL')
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
    expect(textOf(result)).toContain('read-only transaction')
  })

  it('rejects DDL in read-only mode', async () => {
    const result = await app.callTool('sql_e2e', 'CREATE TABLE hacked (x INT)')

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('read-only transaction')
  })

  it('rejects writes hidden in a CTE in read-only mode', async () => {
    const result = await app.callTool(
      'sql_e2e',
      'WITH gone AS (DELETE FROM items RETURNING id) SELECT * FROM gone',
    )

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('read-only transaction')
  })

  it('rejects multi-statement queries in read-only mode', async () => {
    const result = await app.callTool(
      'sql_e2e',
      "SELECT 1; INSERT INTO items (name) VALUES ('smuggled')",
    )

    expect(result.isError).toBe(true)
    expect(textOf(result)).toContain('Multiple SQL statements')
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

  it('returns 404 for an unknown session', async () => {
    await request(app.httpServer())
      .post('/mcp')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json, text/event-stream')
      .set('mcp-session-id', 'no-such-session')
      .send({ jsonrpc: '2.0', id: 9, method: 'tools/list' })
      .expect(404)
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
        "INSERT INTO items (name) VALUES ('writable') RETURNING name",
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
