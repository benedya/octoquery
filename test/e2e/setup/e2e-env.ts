import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// Side-effect module: prepares the environment BEFORE src/app.module is
// imported, because the config module validates the environment (including
// the SQL tools file) eagerly at import time. The tools file starts with a
// schema-valid placeholder; the e2e suite rewrites it (via
// process.env.MCP_SQL_TOOLS_FILE) with the real container coordinates before
// the Nest application is compiled — config factories read it lazily at that
// point. Import this module first in e2e specs.
const toolsFilePath = join(
  mkdtempSync(join(tmpdir(), 'octoquery-e2e-')),
  'tools.json',
)

writeFileSync(
  toolsFilePath,
  JSON.stringify([
    {
      name: 'sql_e2e',
      label: 'e2e',
      host: '127.0.0.1',
      port: 1,
      database: 'placeholder',
      user: 'placeholder',
      password: 'placeholder',
      enableTLS: false,
    },
  ]),
)

process.env.NODE_ENV = 'production'
process.env.LOG_LEVEL = 'error'
process.env.MCP_AUTH_ENABLED = 'false'
// Explicit, not just the default: suites toggle it and restore it, and with a
// single Jest worker the process environment leaks across test files.
process.env.MCP_READ_ONLY = 'true'
process.env.MCP_SQL_TOOLS_FILE = toolsFilePath
