# OctoQuery

**Turn your databases into AI-ready tools.** OctoQuery is a thin MCP (Model Context Protocol) server around your databases: every database you configure becomes one MCP tool that an AI agent — Claude, your IDE assistant, or any other MCP client — can call with plain SQL. See [Supported databases](#supported-databases) for what it can connect to today.

## Motivation

AI agents are great at writing SQL, but they need two things to be useful with *your* data:

1. **Access** — a safe, standard way to run queries. OctoQuery provides that: each configured database is exposed as a single MCP tool (e.g. `sql_orders_prod`, `sql_analytics_dev`) that accepts a `query` string and returns rows as JSON. Adding a database is one JSON entry — no code.
2. **Understanding** — knowledge of your schema, relations, and conventions. For that, you pair each database tool with an **agent skill**: a markdown file describing the tables, how they join, and what the gotchas are (money in cents, soft deletes, statuses to exclude, ...). With a skill, the agent reasons about your database efficiently instead of guessing at the schema query by query.

This repo ships a working example of both: a demo e-commerce database ([demo/](demo/docker-compose.yml)) and its matching skill ([.agents/skills/ecommerce-demo-db/SKILL.md](.agents/skills/ecommerce-demo-db/SKILL.md)), wired together through [AGENTS.md](AGENTS.md). Use them as the template for your own databases.

Under the hood it's a NestJS service speaking MCP over Streamable HTTP at `/mcp`, protected by OAuth 2.0 (optional for local use). Connections are opened lazily on first query, so databases don't need to be reachable at startup.

## Supported databases

| Database   | Status       |
| ---------- | ------------ |
| PostgreSQL | ✅ Supported |

More engines may be added over time — contributions are welcome.

## Quick start (with the demo database)

The fastest way to see it working — a seeded e-commerce database (users, products, orders, order items) runs in Docker:

```bash
# 1. Install dependencies
npm install

# 2. Start the demo PostgreSQL (127.0.0.1:45432, seeded automatically)
docker compose -f demo/docker-compose.yml up -d

# 3. Configure the service
cp .env.example .env                              # set MCP_AUTH_ENABLED=false for a tokenless start
cp mcp-sql-tools.example.json mcp-sql-tools.json  # first entry already points at the demo DB

# 4. Run it
npm run start:dev
```

The MCP endpoint is now live at `http://localhost:3000/mcp` with one tool, `sql_ecommerce_demo`. Connect an agent (next section) and ask things like *"top customers by spend"* or *"revenue by month"*.

To stop the demo database and delete its data: `docker compose -f demo/docker-compose.yml down -v`.

## Connecting AI agents

The server speaks standard MCP over Streamable HTTP, so any MCP client works — Claude Code, Claude Desktop, VS Code, JetBrains IDEs, or anything else that understands MCP. With auth disabled (local dev) no token is needed; otherwise clients go through the OAuth flow described below.

**Register the MCP server** in your agent's MCP configuration (the exact file or settings screen depends on the client, but the shape is always the same):

```json
{
  "mcpServers": {
    "octoquery": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**Give the agent the skills.** Point your agent at the skills in `.agents/skills/` — most agents pick them up through the project's [AGENTS.md](AGENTS.md), others discover a skills directory on their own. The skill is what turns a generic SQL tool into an agent that knows *your* schema.

**Then just ask.** A typical interaction looks like this: you ask *"who are our top customers?"* — the agent reads the database's skill to learn the tables, how they join, and which rows to exclude, writes the SQL itself, and calls the matching `sql_*` tool to execute it. You get the answer; the skill made sure the query was right on the first try.

## Adding your own databases

Databases are defined entirely in `mcp-sql-tools.json` (gitignored — it holds credentials; [mcp-sql-tools.example.json](mcp-sql-tools.example.json) is the committed template):

```json
[
  {
    "name": "sql_orders_prod",
    "label": "prod orders",
    "host": "prod-db.example.com",
    "port": 5432,
    "database": "orders_service",
    "user": "orders_reader",
    "password": "...",
    "enableTLS": true
  }
]
```

Per entry: `name`, `host`, `database`, `user`, `password` are required; optional are `label` (used in the tool title, defaults to the name), `description` (full tool-description override), `port` (default 5432), `enableTLS` (default true), and `maxRows` (default `MCP_MAX_ROWS`, 100). Tool names are free-form, so any environment/database combination works — one entry per tool. Duplicate names, malformed JSON, or a missing file fail validation at startup. Set `MCP_SQL_TOOLS_FILE` to load the file from a different path (e.g. a mounted secret in Kubernetes).

To give agents real understanding of a database, add a skill next to the demo one: create `.agents/skills/<your-db>/SKILL.md` describing the schema, relations, and conventions (use [ecommerce-demo-db](.agents/skills/ecommerce-demo-db/SKILL.md) as the pattern), and list it in [AGENTS.md](AGENTS.md).

## Testing with MCP Inspector

The [MCP Inspector](https://github.com/modelcontextprotocol/inspector) is a web UI for exercising an MCP server by hand — the quickest way to verify your setup before involving an agent:

```bash
npx @modelcontextprotocol/inspector
```

In the Inspector: select transport **Streamable HTTP**, set the URL to `http://localhost:3000/mcp`, and connect (with auth enabled, paste a bearer token in the Authentication field; with `MCP_AUTH_ENABLED=false` just connect). Under **Tools** you'll see one tool per configured database — run `sql_ecommerce_demo` with a query like `SELECT count(*) FROM orders` and inspect the JSON rows that an agent would receive. Results are truncated to the tool's `maxRows`.

## Authentication

The service is an **OAuth 2.0 resource server** per the [MCP authorization spec](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization). It works with any OIDC provider (Auth0, Okta, ...) — configured via `AUTH_ISSUER` and `AUTH_AUDIENCE`:

1. Unauthenticated requests to `/mcp` get `401` with a `WWW-Authenticate: Bearer resource_metadata="..."` header.
2. The client fetches the RFC 9728 metadata (`GET /.well-known/oauth-protected-resource`), which points at the provider (`authorization_servers: [AUTH_ISSUER]`).
3. The client obtains an access token from the provider (authorization code + PKCE for interactive clients, client credentials for machine-to-machine).
4. The service validates the JWT against the provider's JWKS: signature (RS256), `iss`, `exp`, and — if `AUTH_AUDIENCE` is set — `aud`.

For local development set `MCP_AUTH_ENABLED=false` — all auth env vars become optional.

## Operational notes

- **Sessions are in-memory** (map of `mcp-session-id` → transport). When running more than one replica, use sticky sessions at the ingress.
- **`BASE_URL`** must be the public URL clients see (behind a proxy this differs from `localhost:<port>`); it is used in the resource metadata and `WWW-Authenticate` challenges.
- The SQL tools execute arbitrary SQL — the caller is fully trusted. Access control is entirely provider-side, so a token grant should be treated as a database access grant. Use read-only database users where possible.
