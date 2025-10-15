-- backend/sql/007_posts_enhancement.sql
-- Add bloom prediction fields to posts table

ALTER TABLE posts 
ADD COLUMN species VARCHAR(100) DEFAULT NULL COMMENT 'Flower species (sakura, lotus, etc.)',
ADD COLUMN region VARCHAR(50) DEFAULT NULL COMMENT 'Climate region (temperate-n, tropical, etc.)',
ADD COLUMN bloom_window VARCHAR(20) DEFAULT NULL COMMENT 'Predicted bloom window (MM-MM format)',
ADD COLUMN observation_date DATE DEFAULT NULL COMMENT 'Date when flower was observed',
ADD COLUMN coordinates VARCHAR(100) DEFAULT NULL COMMENT 'GPS coordinates (lat,lng)',
ADD COLUMN species_info TEXT DEFAULT NULL COMMENT 'Additional species information';

-- Add indexes for better performance
CREATE INDEX idx_posts_species ON posts(species);
CREATE INDEX idx_posts_region ON posts(region);
CREATE INDEX idx_posts_observation_date ON posts(observation_date);
CREATE INDEX idx_posts_user_species ON posts(user_id, species);
CREATE INDEX idx_posts_user_region ON posts(user_id, region);

-- Update existing posts to have default values
UPDATE posts SET 
    species = 'unknown',
    region = 'unknown',
    bloom_window = 'Quanh năm',
    observation_date = DATE(created_at)
WHERE species IS NULL;
