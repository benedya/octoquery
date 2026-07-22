-- Demo helpdesk schema for the OctoQuery playground database (SQL Server).
-- Idempotent: safe to re-run when the container restarts.

-- Conditional CREATE DATABASE/LOGIN/USER must go through EXEC: those
-- statements are not valid directly inside an IF ... BEGIN/END block.
IF DB_ID(N'helpdesk') IS NULL
    EXEC (N'CREATE DATABASE helpdesk');
GO

-- CHECK_POLICY OFF because the policy rejects passwords containing the login
-- name — fine for a local demo login.
IF SUSER_ID(N'octoquery') IS NULL
    EXEC (N'CREATE LOGIN octoquery WITH PASSWORD = ''OctoQuery1!'', CHECK_POLICY = OFF');
GO

USE helpdesk;
GO

IF DATABASE_PRINCIPAL_ID(N'octoquery') IS NULL
BEGIN
    EXEC (N'CREATE USER octoquery FOR LOGIN octoquery');
    EXEC (N'ALTER ROLE db_datareader ADD MEMBER octoquery');
    EXEC (N'ALTER ROLE db_datawriter ADD MEMBER octoquery');
END
GO

IF OBJECT_ID(N'dbo.customers') IS NULL
BEGIN
    CREATE TABLE customers (
        id         INT IDENTITY PRIMARY KEY,
        email      NVARCHAR(255) NOT NULL UNIQUE,
        full_name  NVARCHAR(255) NOT NULL,
        company    NVARCHAR(255) NOT NULL
    );

    CREATE TABLE agents (
        id         INT IDENTITY PRIMARY KEY,
        full_name  NVARCHAR(255) NOT NULL,
        team       NVARCHAR(100) NOT NULL
    );

    CREATE TABLE tickets (
        id           INT IDENTITY PRIMARY KEY,
        customer_id  INT NOT NULL REFERENCES customers (id),
        -- NULL until the ticket is assigned.
        agent_id     INT NULL REFERENCES agents (id),
        subject      NVARCHAR(255) NOT NULL,
        priority     NVARCHAR(10) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status       NVARCHAR(10) NOT NULL CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
        created_at   DATETIME2 NOT NULL,
        -- NULL while the ticket is not resolved/closed.
        resolved_at  DATETIME2 NULL
    );

    CREATE INDEX idx_tickets_customer_id ON tickets (customer_id);
    CREATE INDEX idx_tickets_agent_id ON tickets (agent_id);
END
GO
