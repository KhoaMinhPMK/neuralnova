-- =============================================
-- NEURALNOVA - COMPLETE DATABASE SETUP
-- =============================================
-- File này tổng hợp TẤT CẢ các bảng cần thiết
-- Chạy file này trên phpMyAdmin để khởi tạo toàn bộ database
-- 
-- Thứ tự chạy:
--   1. Tạo database
--   2. Tạo bảng users (chính)
--   3. Mở rộng users với các trường profile
--   4. Tạo bảng posts
--   5. Tạo bảng reactions
--   6. Tạo bảng comments
--   7. Tạo bảng activities (optional)
--
-- Created: 2025-11-19
-- Author: NeuralNova Team
-- =============================================

-- =============================================
-- 1. TẠO DATABASE
-- =============================================

DROP DATABASE IF EXISTS neuralnova;
CREATE DATABASE neuralnova 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE neuralnova;

SELECT '✅ Step 1: Database created successfully!' AS status;

-- =============================================
-- 2. TẠO BẢNG USERS (CHÍNH)
-- =============================================

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
    
    -- Profile Info (will be extended below)
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

SELECT '✅ Step 2: Users table created!' AS status;

-- =============================================
-- 3. MỞ RỘNG BẢNG USERS VỚI PROFILE FIELDS
-- =============================================

ALTER TABLE users 
ADD COLUMN bio TEXT 
COMMENT 'User bio/introduction';

ALTER TABLE users 
ADD COLUMN interests VARCHAR(500) 
COMMENT 'Comma-separated interests (e.g., flowers, photography, travel)';

ALTER TABLE users 
ADD COLUMN country VARCHAR(2) 
COMMENT 'ISO 3166-1 alpha-2 country code (e.g., VN, US, JP)';

ALTER TABLE users 
ADD COLUMN cover_url VARCHAR(255) 
COMMENT 'Cover photo file path (relative to uploads directory)';

ALTER TABLE users 
ADD COLUMN gps_coords VARCHAR(100) 
COMMENT 'GPS coordinates (format: lat, lng)';

ALTER TABLE users 
ADD COLUMN ip_region VARCHAR(50) 
COMMENT 'IP region selection (auto, na, sa, eu, af, as, oc)';

ALTER TABLE users 
ADD COLUMN ip_display VARCHAR(100) 
COMMENT 'Display IP address for profile';

ALTER TABLE users 
ADD COLUMN custom_user_id VARCHAR(50) 
COMMENT 'User-customizable ID/username';

-- Add unique constraint for custom_user_id
ALTER TABLE users 
ADD UNIQUE KEY unique_custom_user_id (custom_user_id);

-- Add indexes for performance
CREATE INDEX idx_country ON users(country);
CREATE INDEX idx_custom_user_id ON users(custom_user_id);

SELECT '✅ Step 3: Users table extended with profile fields!' AS status;

-- =============================================
-- 4. TẠO BẢNG POSTS
-- =============================================

CREATE TABLE posts (
    -- Primary key
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User reference
    user_id INT NOT NULL COMMENT 'User who created the post',
    
    -- Bloom tracking fields (DO NOT duplicate - these are already here!)
    species VARCHAR(100) DEFAULT NULL COMMENT 'Flower species: sakura, lotus, sunflower, lavender, orchid',
    region VARCHAR(50) DEFAULT NULL COMMENT 'Climate region: temperate-n, temperate-s, tropical, med',
    bloom_window VARCHAR(50) DEFAULT NULL COMMENT 'Expected bloom period (e.g., 03-04, Quanh năm)',
    species_info TEXT DEFAULT NULL COMMENT 'Species information/description',
    
    -- Location & Date
    coordinates VARCHAR(100) DEFAULT NULL COMMENT 'GPS coordinates (format: lat, lng)',
    post_date DATE DEFAULT NULL COMMENT 'Date of observation/photo',
    observation_date DATE DEFAULT NULL COMMENT 'Date when flower was observed',
    
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
    INDEX idx_observation_date (observation_date),
    INDEX idx_is_public (is_public),
    INDEX idx_user_species (user_id, species),
    INDEX idx_user_region (user_id, region)
    
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User posts with bloom tracking and media';

SELECT '✅ Step 4: Posts table created!' AS status;

-- =============================================
-- 5. TẠO BẢNG REACTIONS
-- =============================================

CREATE TABLE reactions (
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

SELECT '✅ Step 5: Reactions table created!' AS status;

-- =============================================
-- 6. TẠO BẢNG COMMENTS
-- =============================================

CREATE TABLE comments (
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

SELECT '✅ Step 6: Comments table created!' AS status;

-- =============================================
-- 7. TẠO BẢNG ACTIVITIES (OPTIONAL - FOR TIMELINE)
-- =============================================

CREATE TABLE activities (
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

SELECT '✅ Step 7: Activities table created!' AS status;

-- =============================================
-- 8. INSERT TEST USER
-- =============================================
-- Password: "Test@123"
-- Hash được tạo bằng: password_hash('Test@123', PASSWORD_BCRYPT)

INSERT INTO users (full_name, email, password, email_verified, status) VALUES
(
    'Test User', 
    'test@neuralnova.space', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    1, 
    'active'
);

SELECT '✅ Step 8: Test user created (email: test@neuralnova.space, password: Test@123)' AS status;

-- =============================================
-- 9. VERIFY ALL TABLES
-- =============================================

SELECT '🎉 DATABASE SETUP COMPLETE!' AS status;
SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS divider;

SELECT 
    TABLE_NAME as 'Table',
    TABLE_ROWS as 'Rows',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Size (MB)',
    TABLE_COMMENT as 'Description'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'neuralnova'
ORDER BY TABLE_NAME;

SELECT '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' AS divider;
SELECT '✅ All tables created successfully!' AS final_status;
SELECT '✅ Test user: test@neuralnova.space / Test@123' AS login_info;
SELECT '✅ You can now run your PHP backend!' AS next_step;
