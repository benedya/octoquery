# OctoQuery — agent guide

OctoQuery is a NestJS service exposing an MCP (Model Context Protocol) server over Streamable HTTP at `/mcp`. Each PostgreSQL database configured in `mcp-sql-tools.json` is exposed as one MCP tool that accepts a single `query` string and returns rows as JSON.

## Layout

- `src/mcp/` — MCP controller, server service, SQL tool handler, lazy database connections
- `src/auth/` — OAuth 2.0 resource-server guard and RFC 9728 metadata endpoint
- `mcp-sql-tools.example.json` — template for the (gitignored) `mcp-sql-tools.json` tool configuration
- `demo/` — Docker Compose playground: seeded demo databases — e-commerce (PostgreSQL), blog (MySQL), library (MariaDB), and helpdesk (SQL Server)

## Commands

- `make run` — start the service in watch mode (`make help` lists all targets)
- `make test` — integration tests (Jest + Testcontainers; requires Docker)
- `make lint` / `make lint-fix` — Biome + TypeScript checks
- `make demo-up` / `make demo-down` — start/stop the demo databases
- `make demo-psql` — psql shell into the demo e-commerce database (PostgreSQL)
- `make demo-mysql` — mysql shell into the demo blog database (MySQL)
- `make demo-mariadb` — mariadb shell into the demo library database (MariaDB)
- `make demo-mssql` — sqlcmd shell into the demo helpdesk database (SQL Server)
- `make mcp-inspector` — MCP Inspector for manual testing

## Available skills

Skills live in `.agents/skills/`:

- **ecommerce-demo-db** (`.agents/skills/ecommerce-demo-db/SKILL.md`) — how to query the demo e-commerce database (users, products, orders, order_items) through the `sql_ecommerce_demo` MCP tool, including its schema and conventions. Use it for any question about the demo shop's users, products, orders, or revenue.
- **blog-demo-db** (`.agents/skills/blog-demo-db/SKILL.md`) — how to query the demo blog database (authors, posts, comments) through the `sql_blog_demo` MCP tool, including its schema and conventions. Use it for any question about the demo blog's authors, posts, comments, or views.
- **library-demo-db** (`.agents/skills/library-demo-db/SKILL.md`) — how to query the demo library database (books, members, loans) through the `sql_library_demo` MCP tool, including its schema and conventions. Use it for any question about the demo library's books, members, loans, or overdue returns.
- **helpdesk-demo-db** (`.agents/skills/helpdesk-demo-db/SKILL.md`) — how to query the demo helpdesk database (customers, agents, tickets) through the `sql_helpdesk_demo` MCP tool, including its T-SQL dialect notes and conventions. Use it for any question about the demo helpdesk's tickets, customers, agents, or resolution times.
