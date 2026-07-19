-- Demo library schema for the OctoQuery playground database (MariaDB).

CREATE TABLE books (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    isbn           VARCHAR(20) NOT NULL UNIQUE,
    title          VARCHAR(255) NOT NULL,
    author         VARCHAR(255) NOT NULL,
    genre          VARCHAR(50) NOT NULL,
    published_year SMALLINT NOT NULL
);

CREATE TABLE members (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    email      VARCHAR(255) NOT NULL UNIQUE,
    full_name  VARCHAR(255) NOT NULL,
    joined_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    book_id      INT NOT NULL,
    member_id    INT NOT NULL,
    borrowed_at  DATE NOT NULL,
    due_date     DATE NOT NULL,
    -- NULL while the book is still out.
    returned_at  DATE NULL,
    CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_loans_member FOREIGN KEY (member_id) REFERENCES members (id)
);

CREATE INDEX idx_loans_book_id ON loans (book_id);
CREATE INDEX idx_loans_member_id ON loans (member_id);
