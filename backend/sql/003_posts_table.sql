-- =============================================
-- NeuralNova Posts Table
-- Store user posts with bloom tracking
-- Created: October 15, 2025
-- Phase: 1 - Database Setup
-- =============================================

USE neuralnova;

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS posts;

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User reference
    user_id INT NOT NULL COMMENT 'User who created the post',
    
    -- Bloom tracking fields
    species VARCHAR(50) DEFAULT NULL COMMENT 'Flower species: sakura, lotus, sunflower, lavender, orchid',
    region VARCHAR(50) DEFAULT NULL COMMENT 'Climate region: temperate-n, temperate-s, tropical, med',
    bloom_window VARCHAR(50) DEFAULT NULL COMMENT 'Expected bloom period (e.g., 03-04, Quanh năm)',
    species_info TEXT DEFAULT NULL COMMENT 'Species information/description',
    
    -- Location & Date
    coordinates VARCHAR(100) DEFAULT NULL COMMENT 'GPS coordinates (format: lat, lng)',
    post_date DATE DEFAULT NULL COMMENT 'Date of observation/photo',
    
    -- Content
    caption TEXT DEFAULT NULL COMMENT 'Post caption/description',
    media_url VARCHAR(255) DEFAULT NULL COMMENT 'Media file path (relative to uploads/posts/)',
    media_type ENUM('image', 'video', 'none') DEFAULT 'none' COMMENT 'Type of media attached',
    
    -- Privacy & Settings
    is_public TINYINT(1) DEFAULT 1 COMMENT '1=public, 0=private',
    blur_location TINYINT(1) DEFAULT 0 COMMENT '1=blur GPS in public view, 0=show exact',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Post creation time',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time',
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_species (species),
    INDEX idx_region (region),
    INDEX idx_post_date (post_date),
    INDEX idx_is_public (is_public)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User posts with bloom tracking and media';

-- Display info
SELECT 'Posts table created successfully' AS status;
SELECT COUNT(*) AS total_posts FROM posts;

-- Show table structure
DESCRIBE posts;

