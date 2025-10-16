-- =============================================
-- Demo Data for NeuralNova
-- Insert fake users, posts, comments, reactions
-- For demo video and testing
-- =============================================

-- Clear existing demo data (optional - uncomment if needed)
-- DELETE FROM comments WHERE user_id > 5;
-- DELETE FROM reactions WHERE user_id > 5;
-- DELETE FROM posts WHERE user_id > 5;
-- DELETE FROM activities WHERE user_id > 5;
-- DELETE FROM users WHERE id > 5;

-- =============================================
-- 1. DEMO USERS (Astronomy/Space enthusiasts)
-- =============================================

-- Password for all demo accounts: Demo123!
-- Hash: $2y$10$YourHashHere (you'll need to generate this)

INSERT INTO users (email, password, full_name, bio, avatar_url, cover_url, country, interests, ip_display, ip_region, custom_user_id, created_at) VALUES

-- User 1: Professional Astronomer
('astronomer.sarah@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
'Dr. Sarah Chen', 
'Astrophysicist specializing in exoplanets 🔭 | PhD from MIT | Searching for life beyond Earth',
'https://i.pravatar.cc/300?img=1',
'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200',
'United States',
'Exoplanets,Spectroscopy,Astrobiology,Research',
'Cambridge, MA',
'North America',
'dr_sarah_chen',
DATE_SUB(NOW(), INTERVAL 180 DAY)),

-- User 2: Amateur Astronomer
('stargazer.mike@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Mike Johnson',
'Amateur astronomer & astrophotographer 📷✨ | Backyard telescope enthusiast | Sharing the cosmos',
'https://i.pravatar.cc/300?img=12',
'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200',
'Australia',
'Astrophotography,Deep Sky Objects,Telescopes,Imaging',
'Sydney',
'Oceania',
'stargazer_mike',
DATE_SUB(NOW(), INTERVAL 150 DAY)),

-- User 3: Space Engineer
('rocket.emma@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Emma Rodriguez',
'Aerospace Engineer at SpaceX 🚀 | Building the future of space travel | Mars enthusiast',
'https://i.pravatar.cc/300?img=5',
'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=1200',
'United States',
'Rocket Science,Mars,SpaceX,Engineering,Innovation',
'Los Angeles, CA',
'North America',
'rocket_emma',
DATE_SUB(NOW(), INTERVAL 120 DAY)),

-- User 4: Science Educator
('cosmos.alex@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Alex Kumar',
'Science educator & YouTuber 🎓 | Making astronomy accessible to everyone | 500K subscribers',
'https://i.pravatar.cc/300?img=33',
'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1200',
'India',
'Science Education,YouTube,Public Outreach,Teaching',
'Mumbai',
'Asia',
'cosmos_alex',
DATE_SUB(NOW(), INTERVAL 90 DAY)),

-- User 5: Student Researcher
('nebula.lisa@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Lisa Thompson',
'Physics PhD student 🎓 | Researching black holes | Coffee-powered researcher ☕',
'https://i.pravatar.cc/300?img=9',
'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
'United Kingdom',
'Black Holes,Quantum Physics,Research,Dark Matter',
'Oxford',
'Europe',
'nebula_lisa',
DATE_SUB(NOW(), INTERVAL 60 DAY)),

-- User 6: Observatory Director
('observatory.james@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Dr. James Martinez',
'Director at Palomar Observatory 🔭 | 30 years studying the universe | Mentor & stargazer',
'https://i.pravatar.cc/300?img=13',
'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1200',
'United States',
'Observatory,Telescope,Mentorship,Professional Astronomy',
'San Diego, CA',
'North America',
'observatory_james',
DATE_SUB(NOW(), INTERVAL 200 DAY)),

-- User 7: Space Journalist
('spacenews.maria@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Maria Silva',
'Space journalist 📰 | Covering NASA missions | Breaking space news | SpaceNews contributor',
'https://i.pravatar.cc/300?img=10',
'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=1200',
'Brazil',
'Space News,NASA,Journalism,Space Missions',
'São Paulo',
'South America',
'spacenews_maria',
DATE_SUB(NOW(), INTERVAL 75 DAY)),

-- User 8: Meteorite Collector
('meteorite.tom@demo.space', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
'Tom Anderson',
'Meteorite hunter & collector 🌠 | Found 50+ space rocks | Selling authentic meteorites',
'https://i.pravatar.cc/300?img=15',
'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200',
'Canada',
'Meteorites,Collecting,Space Rocks,Geology',
'Alberta',
'North America',
'meteorite_tom',
DATE_SUB(NOW(), INTERVAL 45 DAY));

-- =============================================
-- 2. DEMO POSTS (Varied & Engaging Content)
-- =============================================

INSERT INTO posts (user_id, caption, media_url, is_public, post_date, created_at) VALUES

-- Posts from Dr. Sarah Chen (User 6)
(6, 
'🎉 Exciting news! Our team just discovered 3 new exoplanets in the habitable zone of their star system! After analyzing data from the James Webb Space Telescope for months, we found these Earth-sized worlds orbiting a red dwarf star 124 light-years away. 

One of them shows promising signs of water vapor in its atmosphere. This could be a game-changer in our search for extraterrestrial life! 🌍✨

Paper will be published in Nature Astronomy next month. Stay tuned!

#Exoplanets #Astrobiology #JWST #SpaceDiscovery',
'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800',
1,
DATE_SUB(NOW(), INTERVAL 2 DAY),
DATE_SUB(NOW(), INTERVAL 2 DAY)),

(6,
'Morning coffee thoughts ☕: 

Did you know that the atoms in your body were literally forged in the cores of dying stars billions of years ago? 

Every carbon atom in your DNA, every calcium atom in your bones, every iron atom in your blood - all created through nuclear fusion inside stars that lived and died before our Sun even existed.

We are, quite literally, made of stardust. How beautiful is that? ✨

#Astronomy #Science #Astrophysics #CarlSagan',
NULL,
1,
DATE_SUB(NOW(), INTERVAL 5 DAY),
DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Posts from Mike Johnson (User 7)
(7,
'Finally captured the Andromeda Galaxy after months of trying! 🌌

Setup:
- 8" Celestron SCT
- ZWO ASI294MC camera
- 180x60s exposures (3 hours total)
- Processed in PixInsight

Shot from my backyard in Sydney. Light pollution was a challenge but the result was worth it! Our nearest galactic neighbor, 2.5 million light-years away, containing over 1 trillion stars.

What are you imaging this week?

#Astrophotography #M31 #Andromeda #DeepSky #BackyardAstronomy',
'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800',
1,
DATE_SUB(NOW(), INTERVAL 1 DAY),
DATE_SUB(NOW(), INTERVAL 1 DAY)),

(7,
'Telescope upgrade advice needed! 🔭

Currently using an 8" SCT but considering upgrading to a 10" or 12" for better deep-sky views. Budget is around $2000.

Main interests:
- Deep sky objects (galaxies, nebulae)
- Some planetary work
- Astrophotography

Should I go for the 10" with better mount or 12" with my current mount?

Drop your recommendations below! 👇',
NULL,
1,
DATE_SUB(NOW(), INTERVAL 3 DAY),
DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Posts from Emma Rodriguez (User 8)
(8,
'🚀 Incredible day at SpaceX today!

Watched the Starship test flight from mission control. The precision of that booster catch with the chopstick arms was absolutely insane! Years of engineering coming together in those few seconds.

We are literally living in the future. Mars, here we come! 🔴

Cannot share too many details (NDA life 😅) but trust me, what we are working on will blow your minds soon.

#SpaceX #Starship #Mars #Engineering #AerospaceEngineering',
'https://images.unsplash.com/photo-1516849677043-ef67c9557e16?w=800',
1,
DATE_SUB(NOW(), INTERVAL 4 DAY),
DATE_SUB(NOW(), INTERVAL 4 DAY)),

(8,
'Hot take 🔥:

Mars colonization is not just about "Plan B" or escaping Earth. It is about the next step in human evolution and ensuring our species survives potential extinction events.

Critics say we should fix Earth first. I say - why not both? We can tackle climate change AND expand into space. They are not mutually exclusive goals.

Space exploration drives innovation that helps Earth too. GPS, water purification, medical devices - all space tech spinoffs.

Thoughts? Am I too optimistic? Let us debate! 💭

#SpaceExploration #Mars #Future #SpaceDebate',
NULL,
1,
DATE_SUB(NOW(), INTERVAL 7 DAY),
DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- Posts from Alex Kumar (User 9)
(9,
'NEW VIDEO ALERT! 🎥

"Why Black Holes Do NOT Suck (And What They Actually Do)"

Just dropped on my channel! Spent 3 weeks on this one, explaining one of the biggest misconceptions in astronomy with awesome animations.

Link in bio! Like, comment, subscribe - you know the drill 😊

Topics covered:
- What is a black hole really?
- Event horizons explained
- Spaghettification (yes, it is real!)
- Supermassive vs stellar black holes
- Could Earth fall into one?

Perfect for students or anyone curious about the universe! 

#Astronomy #BlackHoles #ScienceEducation #YouTube #Space',
'https://images.unsplash.com/photo-1543722530-d2c3201371e7?w=800',
1,
DATE_SUB(NOW(), INTERVAL 6 DAY),
DATE_SUB(NOW(), INTERVAL 6 DAY)),

-- Posts from Lisa Thompson (User 10)
(10,
'PhD life update: Chapter 3 is DONE! 🎓📚

87 pages on black hole information paradox. My supervisor said "interesting but needs more work" which in academic speak means "complete rewrite" 😭😂

But hey, Stephen Hawking struggled with this problem for decades, so I am in good company!

Coffee count today: 6 ☕☕☕☕☕☕
Hours of sleep: 4 😴
Existential crises: 2 🤯

Worth it though. Science is hard but beautiful.

Any other PhD students here? How are you surviving?

#PhDLife #BlackHoles #Research #AcademicLife #QuantumPhysics',
NULL,
1,
DATE_SUB(NOW(), INTERVAL 8 DAY),
DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Posts from James Martinez (User 11)
(11,
'After 30 years at Palomar Observatory, I still get chills every time we open the dome. 🔭

Tonight we are observing a supernova remnant that exploded 1000 years ago. The light we are capturing tonight left that star during the Middle Ages on Earth.

By the time that light reaches our telescope, it has traveled through 1000 years of expanding universe, past countless stars and galaxies, just to land on our detector.

Every photon tells a story. Every observation is a time machine.

This is why I never get tired of astronomy. ✨

#Astronomy #Observatory #Palomar #Telescope #Universe',
'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800',
1,
DATE_SUB(NOW(), INTERVAL 10 DAY),
DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Posts from Maria Silva (User 12)
(12,
'🚨 BREAKING: NASA announces new Mars sample return timeline!

According to sources at JPL, the mission timeline has been revised:

- Perseverance continues collecting samples
- Sample return mission now targeting 2033 (delayed from 2031)
- New budget allocation: $7.8 billion
- Partnership with ESA confirmed

This will be the first time Martian soil returns to Earth! 🔴🌍

Full article dropping on SpaceNews in 1 hour. Stay tuned!

What do you think - worth the wait and cost?

#NASA #Mars #SpaceNews #Perseverance #Breaking',
'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800',
1,
DATE_SUB(NOW(), INTERVAL 12 DAY),
DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Posts from Tom Anderson (User 13)
(13,
'🌠 NEW FIND! Just authenticated this beautiful Martian meteorite!

Found in the Sahara Desert, confirmed NWA (North West Africa) classification. Analysis shows:

- 4.5 billion years old
- Ejected from Mars ~2 million years ago
- Contains olivine crystals
- Weighs 127 grams

This rock has been to Mars and back before any human! How cool is that?

Available for collectors - DM for details. 💰

Comes with certificate of authenticity from the Meteoritical Society.

#Meteorite #Mars #SpaceRocks #Collecting #Astronomy',
'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800',
1,
DATE_SUB(NOW(), INTERVAL 15 DAY),
DATE_SUB(NOW(), INTERVAL 15 DAY));

-- =============================================
-- 3. DEMO COMMENTS (Engaging Discussions)
-- =============================================

INSERT INTO comments (post_id, user_id, comment_text, created_at) VALUES

-- Comments on Dr. Sarah's exoplanet discovery (Post 1)
(1, 7, 'This is incredible! Congrats Dr. Chen! Would love to image this system once you publish the coordinates. Any estimate on the apparent magnitude?', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 9, 'WOW! Making a video about this discovery next week. Can I interview you for it? This is exactly the kind of news that gets people excited about science! 🎥', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 10, 'As a student, this is so inspiring! How long did the data analysis take? And what spectroscopy methods did you use?', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(1, 6, 'Thank you all! @nebula_lisa We used transmission spectroscopy during planetary transits. Analysis took about 8 months. @cosmos_alex Yes to interview - DM me! 😊', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Comments on Mike's Andromeda photo (Post 3)
(3, 6, 'Stunning work Mike! The detail in the spiral arms is amazing. What was your seeing condition that night?', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 11, 'Beautiful capture! We should collaborate - I can give you access to our 200-inch telescope for a night. The results would be spectacular! 🔭', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 7, 'Thanks everyone! @observatory_james Seeing was around 2.5 arcseconds. @dr_sarah_chen That would be a dream come true! 🤩', DATE_SUB(NOW(), INTERVAL 20 HOUR)),

-- Comments on Emma's SpaceX post (Post 4)
(4, 12, 'I was covering this live! The engineering is just mind-blowing. Hoping to get an interview with Elon about Mars timeline soon 🚀', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 9, 'The future is NOW! Making an explainer video about how the chopstick catch works. Space is getting exciting again! 😁', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 8, 'Cannot confirm or deny but... good things are coming 😉 Stay tuned!', DATE_SUB(NOW(), INTERVAL 3 DAY)),

-- Comments on Alex's YouTube video (Post 6)
(6, 10, 'Just watched it! Best explanation of event horizons I have seen. Using this for my students! 👏', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 6, 'Excellent science communication! We need more educators like you making complex topics accessible.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 9, 'Thank you so much! Comments like these make all the late-night editing worth it 🙏❤️', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Comments on Lisa's PhD update (Post 7)
(7, 6, 'Hang in there Lisa! The information paradox is notoriously difficult. You are making great progress! ☕', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 11, 'PhD survivor here - it gets better! My thesis defense was 15 years ago and I still have nightmares sometimes 😂 You got this!', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(7, 10, 'Thanks for the encouragement everyone! Just submitted the revision. Fingers crossed! 🤞', DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- Comments on Tom's meteorite (Post 9)
(9, 6, 'Beautiful specimen! I have a small collection myself. The olivine content is particularly interesting!', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(9, 13, 'Thanks Dr. Chen! This one is special. If you are interested, I can get you a thin section for analysis 🔬', DATE_SUB(NOW(), INTERVAL 14 DAY));

-- =============================================
-- 4. DEMO REACTIONS (Likes and Hearts)
-- =============================================

INSERT INTO reactions (post_id, user_id, reaction_type, created_at) VALUES

-- Reactions on Post 1 (Sarah's discovery)
(1, 7, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 8, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 9, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 10, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 11, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 12, 'like', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 13, 'like', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Reactions on Post 3 (Mike's photo)
(3, 6, 'like', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 8, 'like', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 9, 'like', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 11, 'like', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 13, 'like', DATE_SUB(NOW(), INTERVAL 20 HOUR)),

-- Reactions on Post 4 (Emma's SpaceX)
(4, 6, 'like', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 7, 'like', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 9, 'like', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 10, 'like', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(4, 12, 'like', DATE_SUB(NOW(), INTERVAL 4 DAY)),

-- Reactions on Post 6 (Alex's video)
(6, 6, 'like', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 7, 'like', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 8, 'like', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 10, 'like', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(6, 11, 'like', DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Reactions on Post 7 (Lisa's PhD)
(7, 6, 'like', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 8, 'like', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(7, 9, 'like', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(7, 11, 'like', DATE_SUB(NOW(), INTERVAL 7 DAY)),

-- More reactions on other posts
(2, 9, 'like', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(2, 10, 'like', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 7, 'like', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(5, 9, 'like', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(8, 6, 'like', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(8, 9, 'like', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(9, 6, 'like', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(9, 8, 'like', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(10, 6, 'like', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(10, 7, 'like', DATE_SUB(NOW(), INTERVAL 15 DAY));

-- =============================================
-- 5. ACTIVITIES LOG (User Actions)
-- =============================================

INSERT INTO activities (user_id, activity_type, target_type, target_id, created_at) VALUES

-- Recent activities
(6, 'post_created', 'post', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'comment_created', 'comment', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(9, 'comment_created', 'comment', 2, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(7, 'post_created', 'post', 3, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(11, 'comment_created', 'comment', 5, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 'post_created', 'post', 4, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(12, 'comment_created', 'comment', 7, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(9, 'post_created', 'post', 6, DATE_SUB(NOW(), INTERVAL 6 DAY)),
(10, 'post_created', 'post', 7, DATE_SUB(NOW(), INTERVAL 8 DAY)),
(11, 'post_created', 'post', 8, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(12, 'post_created', 'post', 9, DATE_SUB(NOW(), INTERVAL 12 DAY)),
(13, 'post_created', 'post', 10, DATE_SUB(NOW(), INTERVAL 15 DAY));

-- =============================================
-- DONE! 🎉
-- =============================================

-- To run this script:
-- mysql -u root -p neuralnova < 999_demo_data.sql

-- Or in phpMyAdmin:
-- 1. Select 'neuralnova' database
-- 2. Go to 'SQL' tab
-- 3. Copy and paste this entire file
-- 4. Click 'Go'

-- Remember to update passwords with proper bcrypt hashes if needed!
-- All demo accounts use password: Demo123!

