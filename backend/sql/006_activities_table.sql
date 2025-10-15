-- =============================================
-- NeuralNova Activities Table
-- Store user activity for timeline/feed
-- Created: October 15, 2025
-- Phase: 1 - Database Setup
-- Optional: For advanced newsfeed features
-- =============================================

USE neuralnova;

-- Drop table if exists (for development only)
-- DROP TABLE IF EXISTS activities;

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User reference
    user_id INT NOT NULL COMMENT 'User who performed the activity',
    
    -- Activity details
    activity_type ENUM(
        'post_created', 
        'comment_added', 
        'reaction_added', 
        'profile_updated'
    ) NOT NULL COMMENT 'Type of activity performed',
    
    -- Entity reference
    entity_type ENUM('post', 'comment', 'user') NOT NULL COMMENT 'Type of entity involved',
    entity_id INT NOT NULL COMMENT 'ID of the post/comment/user',
    
    -- Additional data (JSON format)
    metadata JSON DEFAULT NULL COMMENT 'Additional activity data in JSON format',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When activity occurred',
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_activity_type (activity_type),
    INDEX idx_entity (entity_type, entity_id)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User activity log for timeline/newsfeed';

-- Display info
SELECT 'Activities table created successfully' AS status;
SELECT COUNT(*) AS total_activities FROM activities;

-- Show table structure
DESCRIBE activities;

