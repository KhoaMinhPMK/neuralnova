-- Add observation_date column if missing
USE neuralnova;

-- Check and add observation_date
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS observation_date DATE DEFAULT NULL COMMENT 'Date when flower was observed';

-- Verify
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'neuralnova' 
AND TABLE_NAME = 'posts' 
AND COLUMN_NAME IN ('species', 'region', 'bloom_window', 'observation_date', 'coordinates', 'species_info');

