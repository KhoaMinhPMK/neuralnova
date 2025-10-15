-- =============================================
-- Create Sample Posts for Dashboard Testing
-- Run this SQL to populate the feed with test data
-- =============================================

-- NOTE: Change user_id to your actual user ID
-- Get your user ID by running: SELECT id FROM users LIMIT 1;

-- Sample Post 1: Welcome Post with Image
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'Welcome to NeuralNova! 🚀 This is our first post on the new social platform. Excited to see this community grow!', 
 'https://via.placeholder.com/600x400/0066cc/ffffff?text=Welcome+to+NeuralNova', 
 'public', 
 NOW());

-- Sample Post 2: Feature Announcement
INSERT INTO posts (user_id, content, visibility, created_at) VALUES
(1, 'Just testing the new dashboard features. The like and comment system works perfectly! 🎉 What do you all think?', 
 'public', 
 NOW() - INTERVAL 2 HOUR);

-- Sample Post 3: Nature Post with Image
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'The AI-powered bloom tracking is incredible! Just discovered this amazing cherry blossom spot 🌸 The forecast was spot on!', 
 'https://via.placeholder.com/600x400/ff69b4/ffffff?text=Cherry+Blossoms', 
 'public', 
 NOW() - INTERVAL 5 HOUR);

-- Sample Post 4: Environmental Update
INSERT INTO posts (user_id, content, visibility, created_at) VALUES
(1, 'Monitoring environmental changes from space has never been easier. This platform is a game changer for research! 🌍📊', 
 'public', 
 NOW() - INTERVAL 1 DAY);

-- Sample Post 5: Satellite Data
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'Our latest satellite imagery shows incredible biodiversity in the Amazon rainforest. The data is simply breathtaking! 🌳🛰️', 
 'https://via.placeholder.com/600x400/228B22/ffffff?text=Amazon+Rainforest', 
 'public', 
 NOW() - INTERVAL 1 DAY - INTERVAL 3 HOUR);

-- Sample Post 6: Sunflowers
INSERT INTO posts (user_id, content, image_url, visibility, created_at) VALUES
(1, 'Sunflower fields in full bloom! Thanks to NeuralNova''s bloom tracker, I didn''t miss this spectacular view 🌻', 
 'https://via.placeholder.com/600x400/FFD700/000000?text=Sunflower+Fields', 
 'public', 
 NOW() - INTERVAL 2 DAY);

-- Add some sample reactions
INSERT INTO reactions (user_id, post_id, reaction_type, created_at) VALUES
(1, 1, 'like', NOW() - INTERVAL 1 HOUR),
(1, 3, 'like', NOW() - INTERVAL 2 HOUR),
(1, 5, 'like', NOW() - INTERVAL 3 HOUR);

-- Add some sample comments
INSERT INTO comments (user_id, post_id, content, created_at) VALUES
(1, 1, 'This is amazing! Can''t wait to explore more features 🚀', NOW() - INTERVAL 30 MINUTE),
(1, 1, 'The UI looks really clean and modern!', NOW() - INTERVAL 15 MINUTE),
(1, 3, 'Beautiful photos! Where exactly is this located?', NOW() - INTERVAL 2 HOUR),
(1, 4, 'Great work on the environmental monitoring tools!', NOW() - INTERVAL 5 HOUR);

-- Verify data was inserted
SELECT 
    p.id,
    p.content,
    p.created_at,
    COUNT(DISTINCT r.id) as total_reactions,
    COUNT(DISTINCT c.id) as total_comments
FROM posts p
LEFT JOIN reactions r ON r.post_id = p.id
LEFT JOIN comments c ON c.post_id = p.id
GROUP BY p.id
ORDER BY p.created_at DESC;

-- Success message
SELECT '✅ Sample posts created successfully! Refresh your dashboard to see them.' AS Status;

