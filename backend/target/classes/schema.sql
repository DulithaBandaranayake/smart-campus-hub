-- Smart Campus Hub Database Schema

CREATE DATABASE IF NOT EXISTS paf_lms;
USE paf_lms;

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    capacity INT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    description TEXT
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    purpose TEXT,
    rejection_reason VARCHAR(255),
    expected_attendees INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_id BIGINT,
    reporter_id VARCHAR(255) NOT NULL,
    assignee_id VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    category VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    author_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- Seed Initial Users
INSERT IGNORE INTO users (id, name, email, password, role) VALUES 
(1, 'System Admin', 'admin@nexusops.edu', 'password123', 'ADMIN'),
(2, 'John Student', 'student@nexusops.edu', 'password123', 'STUDENT'),
(3, 'Dave Technician', 'tech@nexusops.edu', 'password123', 'TECHNICIAN');
