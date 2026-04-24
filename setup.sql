-- Create Database for Smart Campus Hub
CREATE DATABASE IF NOT EXISTS paf_lms;

-- Use the database
USE paf_lms;

-- Note: Spring Boot JPA will automatically create the tables if configured with:
-- spring.jpa.hibernate.ddl-auto=update

-- The initial admin user is created automatically by AdminDatabaseSeeder.java:
-- Email: admin@nexus.com
-- Password: admin123
