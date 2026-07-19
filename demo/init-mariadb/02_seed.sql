-- Seed data for the OctoQuery demo library database (MariaDB).

INSERT INTO books (isbn, title, author, genre, published_year) VALUES
    ('978-0-13-468599-1', 'The Pragmatic Programmer',      'Hunt & Thomas',      'Software',   1999),
    ('978-0-262-03384-8', 'Introduction to Algorithms',    'Cormen et al.',      'Software',   2009),
    ('978-0-452-28423-4', '1984',                          'George Orwell',      'Fiction',    1949),
    ('978-0-7432-7356-5', 'The Da Vinci Code',             'Dan Brown',          'Thriller',   2003),
    ('978-0-618-00222-1', 'The Lord of the Rings',         'J.R.R. Tolkien',     'Fantasy',    1954),
    ('978-0-06-231609-7', 'Sapiens',                       'Yuval Noah Harari',  'History',    2011),
    ('978-0-14-303943-3', 'One Hundred Years of Solitude', 'G. Garcia Marquez',  'Fiction',    1967),
    ('978-1-4028-9462-6', 'The Hobbit',                    'J.R.R. Tolkien',     'Fantasy',    1937),
    ('978-0-307-58837-1', 'Gone Girl',                     'Gillian Flynn',      'Thriller',   2012),
    ('978-0-06-112008-4', 'To Kill a Mockingbird',         'Harper Lee',         'Fiction',    1960),
    ('978-0-553-29698-2', 'Foundation',                    'Isaac Asimov',       'Sci-Fi',     1951),
    ('978-0-441-17271-9', 'Dune',                          'Frank Herbert',      'Sci-Fi',     1965);

INSERT INTO members (email, full_name, joined_at) VALUES
    ('nora@example.com',   'Nora Hansen',     '2025-01-08 10:00:00'),
    ('pavlo@example.com',  'Pavlo Melnyk',    '2025-01-22 12:30:00'),
    ('rita@example.com',   'Rita Costa',      '2025-02-14 09:45:00'),
    ('sam@example.com',    'Sam Taylor',      '2025-03-19 15:10:00'),
    ('tina@example.com',   'Tina Novak',      '2025-04-25 11:20:00'),
    ('viktor@example.com', 'Viktor Petrov',   '2025-05-30 14:05:00');

INSERT INTO loans (book_id, member_id, borrowed_at, due_date, returned_at) VALUES
    (1,  1, '2025-02-01', '2025-02-22', '2025-02-18'),
    (3,  1, '2025-02-25', '2025-03-18', '2025-03-15'),
    (5,  2, '2025-03-02', '2025-03-23', '2025-03-20'),
    (5,  3, '2025-03-25', '2025-04-15', '2025-04-10'),
    (2,  2, '2025-03-30', '2025-04-20', '2025-04-22'),
    (6,  4, '2025-04-05', '2025-04-26', '2025-04-24'),
    (8,  3, '2025-04-18', '2025-05-09', '2025-05-02'),
    (12, 4, '2025-05-01', '2025-05-22', '2025-05-27'),
    (4,  5, '2025-05-10', '2025-05-31', '2025-05-28'),
    (5,  1, '2025-05-15', '2025-06-05', '2025-06-01'),
    (11, 2, '2025-05-25', '2025-06-15', '2025-06-10'),
    (7,  5, '2025-06-02', '2025-06-23', '2025-06-20'),
    (9,  6, '2025-06-08', '2025-06-29', '2025-06-27'),
    (12, 6, '2025-06-12', '2025-07-03', NULL),
    (10, 3, '2025-06-20', '2025-07-11', NULL),
    (8,  2, '2025-06-25', '2025-07-16', '2025-07-14'),
    (1,  4, '2025-07-01', '2025-07-22', NULL),
    (6,  5, '2025-07-05', '2025-07-26', NULL),
    (3,  6, '2025-07-10', '2025-07-31', NULL),
    (5,  4, '2025-07-15', '2025-08-05', NULL);
