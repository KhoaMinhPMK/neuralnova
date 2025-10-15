-- =============================================
-- NeuralNova Comments Table
-- Store user comments on posts
-- Created: October 15, 2025
-- Phase: 1 - Database Setup
-- =============================================

USE neuralnova;

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS comments;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- References
    post_id INT NOT NULL COMMENT 'Post being commented on',
    user_id INT NOT NULL COMMENT 'User who commented',
    
    -- Content
    comment_text TEXT NOT NULL COMMENT 'Comment content',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When comment was created',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'When comment was last edited',
    
    -- Foreign key constraints
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User comments on posts';

-- Display info
SELECT 'Comments table created successfully' AS status;
SELECT COUNT(*) AS total_comments FROM comments;

-- Show table structure
DESCRIBE comments;

