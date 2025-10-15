-- =============================================
-- NeuralNova Users Profile Extension
-- Extend users table with profile fields
-- Created: October 15, 2025
-- Phase: 1 - Database Setup
-- =============================================

USE neuralnova;

-- Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS bio TEXT 
COMMENT 'User bio/introduction';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS interests VARCHAR(500) 
COMMENT 'Comma-separated interests (e.g., flowers, photography, travel)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) 
COMMENT 'ISO 3166-1 alpha-2 country code (e.g., VN, US, JP)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) 
COMMENT 'Avatar file path (relative to uploads directory)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cover_url VARCHAR(255) 
COMMENT 'Cover photo file path (relative to uploads directory)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gps_coords VARCHAR(100) 
COMMENT 'GPS coordinates (format: lat, lng)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ip_region VARCHAR(50) 
COMMENT 'IP region selection (auto, na, sa, eu, af, as, oc)';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ip_display VARCHAR(100) 
COMMENT 'Display IP address for profile';

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS custom_user_id VARCHAR(50) 
COMMENT 'User-customizable ID/username';

-- Add unique constraint for custom_user_id
ALTER TABLE users 
ADD UNIQUE KEY IF NOT EXISTS unique_custom_user_id (custom_user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_custom_user_id ON users(custom_user_id);

-- Display info
SELECT 'Users table extended with profile fields' AS status;
SELECT COUNT(*) AS total_users FROM users;

-- Show new columns
DESCRIBE users;

