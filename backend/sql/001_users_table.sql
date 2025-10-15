-- =============================================
-- NeuralNova Users Table
-- Created: October 15, 2025
-- =============================================

-- Create database (nếu chưa có)
CREATE DATABASE IF NOT EXISTS neuralnova 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE neuralnova;

-- Drop table if exists (để test)
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Basic Info
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    
    -- Email Verification (chuẩn bị sẵn cho tương lai)
    email_verified TINYINT(1) DEFAULT 0 COMMENT '0=not verified, 1=verified',
    verification_token VARCHAR(64) NULL COMMENT 'Token for email verification',
    verification_token_expires DATETIME NULL COMMENT 'Token expiration time',
    
    -- Password Reset (chuẩn bị sẵn cho tương lai)
    reset_token VARCHAR(64) NULL COMMENT 'Token for password reset',
    reset_token_expires DATETIME NULL COMMENT 'Reset token expiration',
    
    -- Account Status
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    
    -- Social Login IDs (chuẩn bị sẵn cho tương lai)
    google_id VARCHAR(100) NULL UNIQUE,
    facebook_id VARCHAR(100) NULL UNIQUE,
    github_id VARCHAR(100) NULL UNIQUE,
    linkedin_id VARCHAR(100) NULL UNIQUE,
    
    -- Profile Info (optional)
    avatar_url VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    
    -- Timestamps
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert test user (password: "Test@123")
-- =============================================
INSERT INTO users (full_name, email, password, email_verified, status) VALUES
(
    'Test User', 
    'test@neuralnova.space', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    1, 
    'active'
);

-- =============================================
-- Verify table created successfully
-- =============================================
SELECT 'Users table created successfully!' as message;
DESCRIBE users;

