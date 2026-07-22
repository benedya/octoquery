.DEFAULT_GOAL := help
.PHONY: help run r dev build test lint lint-fix mcp-inspector i demo-up demo-down demo-psql demo-mysql demo-mariadb demo-mssql
SHELL := /bin/bash

COLOR_OFF=\033[0m
COLOR_DANGER=\033[0;31m
COLOR_SUCCESS=\033[0;32m
COLOR_WARNING=\033[0;33m

help:
	@printf "Available commands of the service:\n"
	@grep -E '^[a-zA-Z-]+:[a-zA-Z -]*##.*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${COLOR_SUCCESS}%-30s${COLOR_OFF} %s\n", $$1, $$2}'

run: ## [r] Run the service in watch mode
	@printf "${COLOR_WARNING}Starting service...${COLOR_OFF}\n"
	npm run start:dev
r: run
dev: run

build: ## Build the service
	@printf "${COLOR_WARNING}Building service...${COLOR_OFF}\n"
	npm run build

test: ## Run integration tests (requires Docker for Testcontainers)
	npm test

lint: ## Lint and typecheck
	npm run lint

lint-fix: ## Lint with autofix
	npm run lint:fix

mcp-inspector: ## [i] Run MCP Inspector
	@printf "${COLOR_WARNING}Starting MCP Inspector...${COLOR_OFF}\n"
	npx @modelcontextprotocol/inspector
i: mcp-inspector

demo-up: ## Start the demo databases (Docker Compose)
	docker compose -f demo/docker-compose.yml up -d --wait

demo-down: ## Stop the demo databases and delete their data
	docker compose -f demo/docker-compose.yml down -v

demo-psql: ## Open a psql shell into the demo e-commerce database (PostgreSQL)
	docker exec -it octoquery-demo-postgres psql -U octoquery -d ecommerce

demo-mysql: ## Open a mysql shell into the demo blog database (MySQL)
	docker exec -it octoquery-demo-mysql mysql -uoctoquery -poctoquery blog

demo-mariadb: ## Open a mariadb shell into the demo library database (MariaDB)
	docker exec -it octoquery-demo-mariadb mariadb -uoctoquery -poctoquery library

demo-mssql: ## Open a sqlcmd shell into the demo helpdesk database (SQL Server)
	docker exec -it octoquery-demo-mssql /opt/mssql-tools18/bin/sqlcmd -S localhost -U octoquery -P 'OctoQuery1!' -C -d helpdesk
