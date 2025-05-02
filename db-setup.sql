-- Create the database
CREATE DATABASE IF NOT EXISTS todolist;
USE todolist;

-- Create Categories table
CREATE TABLE IF NOT EXISTS Categories (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(50) NOT NULL,
    Color VARCHAR(50) NULL
);

-- Create TodoItems table
CREATE TABLE IF NOT EXISTS TodoItems (
    Id INT AUTO_INCREMENT PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Description TEXT NULL,
    IsComplete BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedDate DATETIME NOT NULL,
    DueDate DATETIME NULL,
    Priority INT NOT NULL,
    CategoryId INT NOT NULL,
    FOREIGN KEY (CategoryId) REFERENCES Categories(Id)
);

-- Seed initial categories
INSERT INTO Categories (Name, Color) VALUES
    ('Work', '#ff6b6b'),
    ('Personal', '#48dbfb'),
    ('Shopping', '#1dd1a1'),
    ('Health', '#5f27cd');

-- Seed some example
