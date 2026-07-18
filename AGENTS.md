# OctoQuery — agent guide

OctoQuery is a NestJS service exposing an MCP (Model Context Protocol) server over Streamable HTTP at `/mcp`. Each PostgreSQL database configured in `mcp-sql-tools.json` is exposed as one MCP tool that accepts a single `query` string and returns rows as JSON.

## Layout

- `src/mcp/` — MCP controller, server service, SQL tool handler, lazy database connections
- `src/auth/` — OAuth 2.0 resource-server guard and RFC 9728 metadata endpoint
- `mcp-sql-tools.example.json` — template for the (gitignored) `mcp-sql-tools.json` tool configuration
- `demo/` — Docker Compose playground: a seeded e-commerce PostgreSQL database

## Commands

- `make run` — start the service in watch mode (`make help` lists all targets)
- `make lint` / `make lint-fix` — Biome + TypeScript checks
- `make demo-up` / `make demo-down` — start/stop the demo database
- `make demo-psql` — psql shell into the demo database
- `make mcp-inspector` — MCP Inspector for manual testing

## Available skills

Skills live in `.agents/skills/`:

- **ecommerce-demo-db** (`.agents/skills/ecommerce-demo-db/SKILL.md`) — how to query the demo e-commerce database (users, products, orders, order_items) through the `sql_ecommerce_demo` MCP tool, including its schema and conventions. Use it for any question about the demo shop's users, products, orders, or revenue.
