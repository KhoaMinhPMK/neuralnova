-- =============================================
-- NeuralNova Reactions Table
-- Store user reactions to posts (like, heart, flower, wow)
-- Created: October 15, 2025
-- Phase: 1 - Database Setup
-- =============================================

USE neuralnova;

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS reactions;

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- References
    post_id INT NOT NULL COMMENT 'Post being reacted to',
    user_id INT NOT NULL COMMENT 'User who reacted',
    
    -- Reaction type
    reaction_type ENUM('like', 'heart', 'flower', 'wow') NOT NULL COMMENT 'Type of reaction',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When reaction was added',
    
    -- Foreign key constraints
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Prevent duplicate reactions
    -- A user can only have ONE reaction of each type per post
    UNIQUE KEY unique_reaction (post_id, user_id, reaction_type),
    
    -- Indexes for performance
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_reaction_type (reaction_type)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User reactions to posts (like, heart, flower, wow)';

-- Display info
SELECT 'Reactions table created successfully' AS status;
SELECT COUNT(*) AS total_reactions FROM reactions;

-- Show table structure
DESCRIBE reactions;

