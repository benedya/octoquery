-- Demo blog schema for the OctoQuery playground database (MySQL).

CREATE TABLE authors (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    email       VARCHAR(255) NOT NULL UNIQUE,
    full_name   VARCHAR(255) NOT NULL,
    joined_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    author_id    INT NOT NULL,
    title        VARCHAR(255) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    status       ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    views        INT NOT NULL DEFAULT 0,
    published_at TIMESTAMP NULL,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES authors (id)
);

CREATE TABLE comments (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    post_id      INT NOT NULL,
    commenter    VARCHAR(255) NOT NULL,
    body         TEXT NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts (id)
);

CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_comments_post_id ON comments (post_id);
