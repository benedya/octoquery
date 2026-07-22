-- Seed data for the OctoQuery demo helpdesk database (SQL Server).
-- Idempotent: only seeds when the tickets table is empty.

USE helpdesk;
GO

IF NOT EXISTS (SELECT 1 FROM tickets)
BEGIN
    INSERT INTO customers (email, full_name, company) VALUES
        ('lena@acme.example',     'Lena Fischer',   'Acme Corp'),
        ('marco@globex.example',  'Marco Ricci',    'Globex'),
        ('sara@initech.example',  'Sara Kim',       'Initech'),
        ('oleg@umbrella.example', 'Oleg Bondar',    'Umbrella'),
        ('julia@stark.example',   'Julia Weber',    'Stark Industries'),
        ('amir@wayne.example',    'Amir Haddad',    'Wayne Enterprises');

    INSERT INTO agents (full_name, team) VALUES
        ('Nina Park',    'Tier 1'),
        ('Tom Reyes',    'Tier 1'),
        ('Ada Kovacs',   'Tier 2'),
        ('Leo Martins',  'Tier 2');

    INSERT INTO tickets (customer_id, agent_id, subject, priority, status, created_at, resolved_at) VALUES
        (1, 1,    'Cannot log in after password reset',   'high',   'resolved', '2025-05-02T09:15:00', '2025-05-02T13:40:00'),
        (2, 2,    'Invoice PDF is empty',                 'medium', 'resolved', '2025-05-05T11:30:00', '2025-05-06T10:05:00'),
        (3, 3,    'API returns 500 on bulk upload',       'urgent', 'resolved', '2025-05-12T08:20:00', '2025-05-12T16:45:00'),
        (1, 2,    'Add SSO support question',             'low',    'closed',   '2025-05-18T14:10:00', '2025-05-20T09:30:00'),
        (4, 1,    'Export to CSV missing columns',        'medium', 'resolved', '2025-05-25T10:40:00', '2025-05-27T15:20:00'),
        (5, 4,    'Webhook retries flooding endpoint',    'high',   'resolved', '2025-06-03T09:00:00', '2025-06-04T11:10:00'),
        (2, 3,    'Slow dashboard for large accounts',    'high',   'resolved', '2025-06-10T13:25:00', '2025-06-13T17:00:00'),
        (6, 1,    'Billing address cannot be updated',    'medium', 'resolved', '2025-06-15T15:50:00', '2025-06-16T10:30:00'),
        (3, 4,    'Rate limit documentation unclear',     'low',    'closed',   '2025-06-20T09:35:00', '2025-06-23T12:00:00'),
        (4, 3,    'Data sync stuck since upgrade',        'urgent', 'resolved', '2025-06-27T07:45:00', '2025-06-27T14:15:00'),
        (5, 2,    'Two-factor codes arrive late',         'medium', 'pending',  '2025-07-02T10:20:00', NULL),
        (1, 3,    'Report totals off by one day',         'high',   'pending',  '2025-07-06T11:55:00', NULL),
        (6, NULL, 'Feature request: dark mode',           'low',    'open',     '2025-07-09T16:30:00', NULL),
        (2, 1,    'Password policy too strict',           'low',    'open',     '2025-07-11T09:10:00', NULL),
        (3, NULL, 'Cannot invite new team members',       'urgent', 'open',     '2025-07-14T08:05:00', NULL),
        (4, 2,    'Attachment upload fails over 10 MB',   'high',   'open',     '2025-07-15T13:40:00', NULL),
        (5, NULL, 'Question about data retention',        'medium', 'open',     '2025-07-16T15:25:00', NULL),
        (6, 4,    'Timezone wrong in audit log',          'medium', 'pending',  '2025-07-17T10:50:00', NULL);
END
GO
