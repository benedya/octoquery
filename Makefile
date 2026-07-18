.DEFAULT_GOAL := help
.PHONY: help run r dev build lint lint-fix mcp-inspector i demo-up demo-down demo-psql
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

lint: ## Lint and typecheck
	npm run lint

lint-fix: ## Lint with autofix
	npm run lint:fix

mcp-inspector: ## [i] Run MCP Inspector
	@printf "${COLOR_WARNING}Starting MCP Inspector...${COLOR_OFF}\n"
	npx @modelcontextprotocol/inspector
i: mcp-inspector

demo-up: ## Start the demo e-commerce database (Docker Compose)
	docker compose -f demo/docker-compose.yml up -d --wait

demo-down: ## Stop the demo database and delete its data
	docker compose -f demo/docker-compose.yml down -v

demo-psql: ## Open a psql shell into the demo database
	docker exec -it octoquery-demo-db psql -U octoquery -d ecommerce
