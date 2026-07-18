-- Seed data for the OctoQuery demo blog database (MySQL).

INSERT INTO authors (email, full_name, joined_at) VALUES
    ('maria@example.com',  'Maria Silva',    '2025-01-10 09:00:00'),
    ('tom@example.com',    'Tom Becker',     '2025-01-25 14:30:00'),
    ('yuki@example.com',   'Yuki Sato',      '2025-02-12 11:15:00'),
    ('olena@example.com',  'Olena Shevchenko', '2025-03-03 08:45:00'),
    ('david@example.com',  'David Brown',    '2025-04-18 16:20:00');

INSERT INTO posts (author_id, title, category, status, views, published_at) VALUES
    (1, 'Getting Started with Docker',            'DevOps',      'published', 1520, '2025-02-01 10:00:00'),  -- 1
    (1, 'Ten Tips for Cleaner SQL',               'Databases',   'published',  980, '2025-02-20 09:30:00'),  -- 2
    (2, 'Why I Switched to TypeScript',           'Programming', 'published', 2340, '2025-03-05 12:00:00'),  -- 3
    (2, 'Understanding HTTP Caching',             'Web',         'published',  760, '2025-03-22 15:45:00'),  -- 4
    (3, 'A Gentle Introduction to Indexes',       'Databases',   'published', 1875, '2025-04-02 08:15:00'),  -- 5
    (3, 'My Favorite Terminal Tools',             'DevOps',      'archived',   430, '2025-04-15 10:30:00'),  -- 6
    (1, 'Debugging Node.js Memory Leaks',         'Programming', 'published', 1120, '2025-05-01 14:00:00'),  -- 7
    (4, 'REST vs GraphQL in Practice',            'Web',         'published', 2910, '2025-05-12 09:00:00'),  -- 8
    (4, 'Writing Useful Code Reviews',            'Programming', 'published',  655, '2025-05-28 11:30:00'),  -- 9
    (2, 'Postgres or MySQL? It Depends',          'Databases',   'published', 3480, '2025-06-10 10:45:00'),  -- 10
    (5, 'CI Pipelines that Do Not Hurt',          'DevOps',      'published',  540, '2025-06-25 13:15:00'),  -- 11
    (3, 'Working Notes on Query Planners',        'Databases',   'draft',        0, NULL),                    -- 12
    (5, 'A Field Guide to Feature Flags',         'Programming', 'draft',        0, NULL),                    -- 13
    (1, 'Monitoring Basics for Small Teams',      'DevOps',      'published',  820, '2025-07-05 09:30:00'),  -- 14
    (4, 'The Case for Boring Technology',         'Web',         'published', 1990, '2025-07-12 16:00:00');  -- 15

INSERT INTO comments (post_id, commenter, body, created_at) VALUES
    (1,  'Anna',   'Great walkthrough, saved me hours!',                '2025-02-02 11:00:00'),
    (1,  'Piotr',  'Would love a follow-up on compose profiles.',      '2025-02-04 18:20:00'),
    (2,  'Lena',   'Tip #4 changed how I write joins.',                '2025-02-21 09:10:00'),
    (3,  'Marco',  'Same journey here, no regrets.',                   '2025-03-06 14:35:00'),
    (3,  'Sofia',  'What about the build-time costs?',                 '2025-03-07 10:05:00'),
    (3,  'James',  'Types saved our refactoring last month.',          '2025-03-09 16:50:00'),
    (4,  'Nina',   'The ETag section is gold.',                        '2025-03-23 12:40:00'),
    (5,  'Omar',   'Finally an explanation that clicks.',              '2025-04-03 09:25:00'),
    (5,  'Kate',   'Could you cover partial indexes next?',            '2025-04-05 15:10:00'),
    (7,  'Felix',  'The heap snapshot trick works great.',             '2025-05-02 10:55:00'),
    (8,  'Ivan',   'We went the opposite direction, interesting take.','2025-05-13 13:30:00'),
    (8,  'Chloe',  'Persisted queries deserve a mention too.',         '2025-05-15 09:45:00'),
    (8,  'Raj',    'Best comparison I have read so far.',              '2025-05-18 17:15:00'),
    (9,  'Emma',   'Sharing this with my whole team.',                 '2025-05-29 08:50:00'),
    (10, 'Lucas',  'The replication section settles it for us.',       '2025-06-11 11:20:00'),
    (10, 'Amira',  'Would love benchmarks with real workloads.',       '2025-06-12 14:05:00'),
    (10, 'Peter',  'This aged well after our migration.',              '2025-06-20 10:30:00'),
    (11, 'Hana',   'Cache steps alone cut our build in half.',         '2025-06-26 15:40:00'),
    (14, 'Diego',  'Simple and actionable, thanks!',                   '2025-07-06 12:15:00'),
    (15, 'Mia',    'Boring tech, happy pager. Agreed.',                '2025-07-13 18:00:00');
