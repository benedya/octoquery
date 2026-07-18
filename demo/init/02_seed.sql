-- Seed data for the OctoQuery demo e-commerce database.

INSERT INTO users (email, full_name, country, created_at) VALUES
    ('alice@example.com',   'Alice Johnson',  'US', '2025-01-05 09:12:00+00'),
    ('bob@example.com',     'Bob Smith',      'GB', '2025-01-18 14:30:00+00'),
    ('carla@example.com',   'Carla Gomez',    'ES', '2025-02-02 11:45:00+00'),
    ('dmytro@example.com',  'Dmytro Kovalenko', 'UA', '2025-02-14 08:20:00+00'),
    ('emma@example.com',    'Emma Weber',     'DE', '2025-03-01 16:05:00+00'),
    ('felix@example.com',   'Felix Martin',   'FR', '2025-03-22 10:10:00+00'),
    ('grace@example.com',   'Grace Lee',      'US', '2025-04-09 13:55:00+00'),
    ('hiro@example.com',    'Hiro Tanaka',    'JP', '2025-04-28 07:40:00+00'),
    ('ines@example.com',    'Ines Rossi',     'IT', '2025-05-15 18:25:00+00'),
    ('jonas@example.com',   'Jonas Berg',     'SE', '2025-06-03 12:00:00+00');

INSERT INTO products (sku, name, category, price_cents) VALUES
    ('KB-001',  'Mechanical Keyboard',      'Electronics',  8900),
    ('MS-002',  'Wireless Mouse',           'Electronics',  2500),
    ('MN-003',  '27" 4K Monitor',           'Electronics', 34900),
    ('HD-004',  'Noise-Cancelling Headphones', 'Electronics', 19900),
    ('CH-005',  'Ergonomic Office Chair',   'Furniture',   27900),
    ('DK-006',  'Standing Desk',            'Furniture',   44900),
    ('LM-007',  'Desk Lamp',                'Furniture',    3900),
    ('BT-008',  'Water Bottle',             'Accessories',  1500),
    ('BP-009',  'Laptop Backpack',          'Accessories',  6900),
    ('NB-010',  'Notebook (A5, dotted)',    'Stationery',    900),
    ('PN-011',  'Gel Pen Set',              'Stationery',   1200),
    ('CB-012',  'USB-C Cable (2 m)',        'Electronics',  1100);

INSERT INTO orders (user_id, status, placed_at) VALUES
    (1,  'delivered', '2025-02-10 10:00:00+00'),  -- 1
    (1,  'delivered', '2025-03-15 09:30:00+00'),  -- 2
    (2,  'delivered', '2025-02-20 15:45:00+00'),  -- 3
    (3,  'cancelled', '2025-02-25 12:15:00+00'),  -- 4
    (3,  'delivered', '2025-03-05 17:20:00+00'),  -- 5
    (4,  'delivered', '2025-03-12 08:50:00+00'),  -- 6
    (5,  'delivered', '2025-03-30 14:05:00+00'),  -- 7
    (2,  'delivered', '2025-04-02 11:35:00+00'),  -- 8
    (6,  'delivered', '2025-04-18 16:40:00+00'),  -- 9
    (7,  'delivered', '2025-04-25 10:25:00+00'),  -- 10
    (1,  'shipped',   '2025-05-06 13:10:00+00'),  -- 11
    (8,  'delivered', '2025-05-14 07:55:00+00'),  -- 12
    (9,  'delivered', '2025-05-29 18:45:00+00'),  -- 13
    (4,  'cancelled', '2025-06-04 09:15:00+00'),  -- 14
    (10, 'shipped',   '2025-06-10 12:30:00+00'),  -- 15
    (5,  'paid',      '2025-06-18 15:00:00+00'),  -- 16
    (7,  'shipped',   '2025-06-24 10:50:00+00'),  -- 17
    (3,  'paid',      '2025-07-01 14:20:00+00'),  -- 18
    (8,  'pending',   '2025-07-08 08:05:00+00'),  -- 19
    (2,  'pending',   '2025-07-12 17:35:00+00');  -- 20

INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES
    (1,  1,  1,  8900), (1,  2,  1,  2500),
    (2,  3,  1, 34900), (2, 12,  2,  1100),
    (3,  5,  1, 27900),
    (4,  6,  1, 44900),
    (5,  8,  2,  1500), (5,  9,  1,  6900),
    (6,  4,  1, 19900), (6, 12,  1,  1100),
    (7, 10,  3,   900), (7, 11,  1,  1200),
    (8,  7,  1,  3900), (8, 10,  2,   900),
    (9,  6,  1, 44900), (9,  5,  1, 27900), (9,  7,  1,  3900),
    (10, 1,  1,  8900), (10, 2,  1,  2500), (10, 12, 3,  1100),
    (11, 4,  1, 19900),
    (12, 9,  1,  6900), (12, 8,  1,  1500),
    (13, 3,  2, 34900),
    (14, 5,  1, 27900),
    (15, 1,  1,  8900), (15, 11, 2,  1200),
    (16, 6,  1, 44900), (16, 7,  1,  3900),
    (17, 2,  2,  2500), (17, 12, 1,  1100),
    (18, 4,  1, 19900), (18, 9,  1,  6900),
    (19, 10, 5,   900),
    (20, 3,  1, 34900), (20, 1,  1,  8900);
