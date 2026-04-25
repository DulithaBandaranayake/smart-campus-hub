-- Add missing columns to users table for Smart Campus Hub
-- Run this script in your MySQL database

USE paf_lms;

-- Add approved column if it doesn't exist
ALTER TABLE users ADD COLUMN approved BOOLEAN DEFAULT FALSE;

-- Add password_reset_requested column if it doesn't exist
ALTER TABLE users ADD COLUMN password_reset_requested BOOLEAN DEFAULT FALSE;

-- Add password_reset_token column if it doesn't exist
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(255);

-- Add password_reset_expires column if it doesn't exist
ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;

-- Verify the changes
DESCRIBE users;