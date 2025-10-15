# 🚀 NeuralNova Profile & Social Network Backend Roadmap

**Mục tiêu**: Xây dựng hệ thống profile và social network như Facebook  
**Timeline**: 3-5 ngày làm việc  
**Complexity**: ⭐⭐⭐⭐ (Advanced)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Design](#database-design)
3. [Backend API Structure](#backend-api-structure)
4. [Frontend Integration](#frontend-integration)
5. [Implementation Plan](#implementation-plan)
6. [Security & Optimization](#security--optimization)
7. [Testing Checklist](#testing-checklist)

---

## 🎯 Overview

### **Scope**:
- ✅ User Profile Management (bio, avatar, cover, interests)
- ✅ Posts System (create, read, update, delete)
- ✅ Media Upload (images, videos)
- ✅ Reactions (like, heart, flower, wow)
- ✅ Comments System
- ✅ Timeline & Activity Feed
- ✅ Bloom Tracking (species, regions, predictions)
- ✅ Badges & Statistics

### **Tech Stack**:
- **Backend**: PHP 8.0+, MySQL/MariaDB
- **Frontend**: Vanilla JS (existing)
- **File Storage**: Server filesystem
- **Session**: PHP sessions (existing)

---

## 🗄️ Database Design

### **Phase 1: Extend Users Table**

```sql
-- File: backend/sql/002_users_profile_extension.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT COMMENT 'User bio/introduction';
ALTER TABLE users ADD COLUMN IF NOT EXISTS interests VARCHAR(500) COMMENT 'Comma-separated interests';
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(2) COMMENT 'ISO country code';
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) COMMENT 'Avatar file path';
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url VARCHAR(255) COMMENT 'Cover photo path';
ALTER TABLE users ADD COLUMN IF NOT EXISTS gps_coords VARCHAR(100) COMMENT 'GPS coordinates';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_region VARCHAR(50) COMMENT 'IP region selection';
ALTER TABLE users ADD COLUMN IF NOT EXISTS ip_display VARCHAR(100) COMMENT 'Display IP address';
ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_user_id VARCHAR(50) UNIQUE COMMENT 'User-customizable ID';

-- Indexes for performance
CREATE INDEX idx_country ON users(country);
CREATE INDEX idx_custom_user_id ON users(custom_user_id);
```

---

### **Phase 2: Posts Table**

```sql
-- File: backend/sql/003_posts_table.sql

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Bloom tracking fields
    species VARCHAR(50) COMMENT 'Flower species: sakura, lotus, etc.',
    region VARCHAR(50) COMMENT 'Climate region: temperate-n, tropical, etc.',
    bloom_window VARCHAR(50) COMMENT 'Expected bloom period',
    species_info TEXT COMMENT 'Species information',
    
    -- Location & Date
    coordinates VARCHAR(100) COMMENT 'GPS coordinates (lat, lng)',
    post_date DATE COMMENT 'Date of observation/photo',
    
    -- Content
    caption TEXT COMMENT 'Post caption/description',
    media_url VARCHAR(255) COMMENT 'Media file path',
    media_type ENUM('image', 'video', 'none') DEFAULT 'none',
    
    -- Metadata
    is_public TINYINT(1) DEFAULT 1 COMMENT '1=public, 0=private',
    blur_location TINYINT(1) DEFAULT 0 COMMENT 'Blur GPS in public view',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_species (species),
    INDEX idx_post_date (post_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Phase 3: Reactions Table**

```sql
-- File: backend/sql/004_reactions_table.sql

CREATE TABLE IF NOT EXISTS reactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction_type ENUM('like', 'heart', 'flower', 'wow') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Prevent duplicate reactions (one type per user per post)
    UNIQUE KEY unique_reaction (post_id, user_id, reaction_type),
    
    -- Indexes
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Phase 4: Comments Table**

```sql
-- File: backend/sql/005_comments_table.sql

CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

### **Phase 5: Activity/Timeline Table** (Optional - cho newsfeed)

```sql
-- File: backend/sql/006_activities_table.sql

CREATE TABLE IF NOT EXISTS activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type ENUM('post_created', 'comment_added', 'reaction_added', 'profile_updated') NOT NULL,
    entity_type ENUM('post', 'comment', 'user') NOT NULL,
    entity_id INT NOT NULL COMMENT 'ID of post/comment/user',
    metadata JSON COMMENT 'Additional activity data',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔌 Backend API Structure

### **Directory Structure**:

```
backend/
├── api/
│   ├── auth/                    ✅ (Already exists)
│   │   ├── register.php
│   │   ├── login.php
│   │   ├── logout.php
│   │   └── check-session.php
│   │
│   ├── profile/                 🆕 NEW
│   │   ├── get.php              → GET user profile
│   │   ├── update.php           → POST update profile
│   │   ├── upload-avatar.php    → POST upload avatar
│   │   ├── upload-cover.php     → POST upload cover
│   │   └── stats.php            → GET user statistics
│   │
│   ├── posts/                   🆕 NEW
│   │   ├── create.php           → POST create new post
│   │   ├── list.php             → GET user's posts (with pagination)
│   │   ├── feed.php             → GET timeline/newsfeed
│   │   ├── get.php              → GET single post details
│   │   ├── update.php           → PUT/POST update post
│   │   ├── delete.php           → DELETE post
│   │   └── upload-media.php     → POST upload post media
│   │
│   ├── reactions/               🆕 NEW
│   │   ├── add.php              → POST add/toggle reaction
│   │   ├── remove.php           → DELETE remove reaction
│   │   └── count.php            → GET reaction counts for post
│   │
│   └── comments/                🆕 NEW
│       ├── create.php           → POST add comment
│       ├── list.php             → GET comments for post
│       ├── update.php           → PUT/POST edit comment
│       └── delete.php           → DELETE comment
│
├── config/
│   └── database.php             ✅ (Already exists)
│
├── includes/
│   ├── response.php             ✅ (Already exists)
│   ├── session.php              ✅ (Already exists)
│   ├── validation.php           ✅ (Already exists)
│   └── file_upload.php          🆕 NEW - File upload helpers
│
├── uploads/                     🆕 NEW - Media storage
│   ├── avatars/
│   ├── covers/
│   └── posts/
│
└── sql/
    ├── 001_users_table.sql      ✅ (Already exists)
    ├── 002_users_profile_extension.sql  🆕 NEW
    ├── 003_posts_table.sql      🆕 NEW
    ├── 004_reactions_table.sql  🆕 NEW
    ├── 005_comments_table.sql   🆕 NEW
    └── 006_activities_table.sql 🆕 NEW
```

---

## 📝 API Endpoints Specification

### **1. Profile APIs**

#### **GET /api/profile/get.php**
```
Query Params:
  - user_id (optional): Get specific user profile
  - If not provided: Get current logged-in user

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "custom_user_id": "johndoe123",
      "bio": "Nature lover...",
      "interests": "flowers, photography, travel",
      "country": "VN",
      "avatar_url": "/uploads/avatars/1_avatar.jpg",
      "cover_url": "/uploads/covers/1_cover.jpg",
      "gps_coords": "10.762622, 106.660172",
      "ip_region": "as",
      "ip_display": "27.111.228.1",
      "created_at": "2025-10-15 12:00:00"
    }
  }
}
```

#### **POST /api/profile/update.php**
```
Request Body:
{
  "bio": "Updated bio...",
  "interests": "flowers, photos",
  "country": "VN",
  "gps_coords": "10.762622, 106.660172",
  "ip_region": "as",
  "ip_display": "27.111.228.1",
  "custom_user_id": "johndoe123"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

#### **POST /api/profile/upload-avatar.php**
```
Content-Type: multipart/form-data

Form Data:
  - avatar: File (image/*), max 5MB

Response:
{
  "success": true,
  "data": {
    "avatar_url": "/uploads/avatars/1_1729012345.jpg"
  }
}
```

#### **POST /api/profile/upload-cover.php**
```
Content-Type: multipart/form-data

Form Data:
  - cover: File (image/*), max 10MB

Response:
{
  "success": true,
  "data": {
    "cover_url": "/uploads/covers/1_1729012345.jpg"
  }
}
```

#### **GET /api/profile/stats.php**
```
Response:
{
  "success": true,
  "data": {
    "total_posts": 15,
    "total_reactions": 48,
    "total_comments": 23,
    "species_count": 5,
    "regions_visited": 3,
    "bloom_accuracy": 85
  }
}
```

---

### **2. Posts APIs**

#### **POST /api/posts/create.php**
```
Request Body:
{
  "species": "sakura",
  "region": "temperate-n",
  "bloom_window": "03-04",
  "species_info": "Cherry blossoms...",
  "coordinates": "35.6762, 139.6503",
  "post_date": "2025-03-15",
  "caption": "Beautiful sakura in Tokyo!",
  "media_url": "/uploads/posts/1_1729012345.jpg",
  "media_type": "image",
  "is_public": 1,
  "blur_location": 0
}

Response:
{
  "success": true,
  "data": {
    "post_id": 42,
    "created_at": "2025-10-15 14:30:00"
  }
}
```

#### **GET /api/posts/list.php**
```
Query Params:
  - user_id (optional): Get posts from specific user
  - page (default: 1)
  - limit (default: 10)
  - species (optional): Filter by species
  - region (optional): Filter by region

Response:
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 42,
        "user": {
          "id": 1,
          "full_name": "John Doe",
          "avatar_url": "/uploads/avatars/1_avatar.jpg"
        },
        "species": "sakura",
        "region": "temperate-n",
        "bloom_window": "03-04",
        "coordinates": "35.68, 139.65",
        "post_date": "2025-03-15",
        "caption": "Beautiful sakura in Tokyo!",
        "media_url": "/uploads/posts/1_1729012345.jpg",
        "media_type": "image",
        "reactions": {
          "like": 5,
          "heart": 3,
          "flower": 2,
          "wow": 1
        },
        "comment_count": 4,
        "user_reaction": "heart",
        "created_at": "2025-10-15 14:30:00"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_posts": 25
    }
  }
}
```

#### **GET /api/posts/feed.php** (Timeline/Newsfeed)
```
Query Params:
  - page (default: 1)
  - limit (default: 20)

Response:
{
  "success": true,
  "data": {
    "posts": [...],  // Same structure as list.php
    "pagination": {...}
  }
}
```

#### **GET /api/posts/get.php**
```
Query Params:
  - post_id: Required

Response:
{
  "success": true,
  "data": {
    "post": {
      "id": 42,
      "user": {...},
      "species": "sakura",
      "caption": "...",
      "reactions": {...},
      "comments": [...]
    }
  }
}
```

#### **DELETE /api/posts/delete.php**
```
Request Body:
{
  "post_id": 42
}

Response:
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### **POST /api/posts/upload-media.php**
```
Content-Type: multipart/form-data

Form Data:
  - media: File (image/* or video/*), max 50MB

Response:
{
  "success": true,
  "data": {
    "media_url": "/uploads/posts/1_1729012345.jpg",
    "media_type": "image"
  }
}
```

---

### **3. Reactions APIs**

#### **POST /api/reactions/add.php**
```
Request Body:
{
  "post_id": 42,
  "reaction_type": "heart"
}

Response:
{
  "success": true,
  "data": {
    "action": "added",  // or "toggled" if already existed
    "new_count": 4
  }
}
```

#### **DELETE /api/reactions/remove.php**
```
Request Body:
{
  "post_id": 42,
  "reaction_type": "heart"
}

Response:
{
  "success": true,
  "data": {
    "new_count": 3
  }
}
```

#### **GET /api/reactions/count.php**
```
Query Params:
  - post_id: Required

Response:
{
  "success": true,
  "data": {
    "reactions": {
      "like": 5,
      "heart": 3,
      "flower": 2,
      "wow": 1
    },
    "total": 11,
    "user_reaction": "heart"
  }
}
```

---

### **4. Comments APIs**

#### **POST /api/comments/create.php**
```
Request Body:
{
  "post_id": 42,
  "comment_text": "Beautiful flowers!"
}

Response:
{
  "success": true,
  "data": {
    "comment_id": 15,
    "created_at": "2025-10-15 15:00:00"
  }
}
```

#### **GET /api/comments/list.php**
```
Query Params:
  - post_id: Required
  - page (default: 1)
  - limit (default: 50)

Response:
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 15,
        "user": {
          "id": 2,
          "full_name": "Jane Smith",
          "avatar_url": "/uploads/avatars/2_avatar.jpg"
        },
        "comment_text": "Beautiful flowers!",
        "created_at": "2025-10-15 15:00:00",
        "is_owner": false
      }
    ],
    "total": 4
  }
}
```

#### **DELETE /api/comments/delete.php**
```
Request Body:
{
  "comment_id": 15
}

Response:
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 🔧 Backend Helpers

### **File: backend/includes/file_upload.php**

```php
<?php
/**
 * File Upload Helper Functions
 */

if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access not permitted');
}

// Upload directory configuration
define('UPLOAD_BASE_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL_BASE', '/backend/uploads/');

// File size limits (in bytes)
define('MAX_AVATAR_SIZE', 5 * 1024 * 1024);  // 5MB
define('MAX_COVER_SIZE', 10 * 1024 * 1024);  // 10MB
define('MAX_POST_MEDIA_SIZE', 50 * 1024 * 1024); // 50MB

// Allowed MIME types
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/webm', 'video/quicktime']);

/**
 * Upload file to specified directory
 * 
 * @param array $file $_FILES array element
 * @param string $type 'avatar', 'cover', or 'post'
 * @param int $userId User ID for filename
 * @return array ['success' => bool, 'path' => string, 'url' => string, 'error' => string]
 */
function uploadFile($file, $type, $userId) {
    // Validate file exists
    if (!isset($file) || $file['error'] === UPLOAD_ERR_NO_FILE) {
        return ['success' => false, 'error' => 'No file uploaded'];
    }
    
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['success' => false, 'error' => 'Upload error: ' . $file['error']];
    }
    
    // Get file info
    $fileTmpPath = $file['tmp_name'];
    $fileName = $file['name'];
    $fileSize = $file['size'];
    $fileType = $file['type'];
    
    // Determine upload directory and limits
    switch ($type) {
        case 'avatar':
            $uploadDir = UPLOAD_BASE_DIR . 'avatars/';
            $maxSize = MAX_AVATAR_SIZE;
            $allowedTypes = ALLOWED_IMAGE_TYPES;
            break;
        case 'cover':
            $uploadDir = UPLOAD_BASE_DIR . 'covers/';
            $maxSize = MAX_COVER_SIZE;
            $allowedTypes = ALLOWED_IMAGE_TYPES;
            break;
        case 'post':
            $uploadDir = UPLOAD_BASE_DIR . 'posts/';
            $maxSize = MAX_POST_MEDIA_SIZE;
            $allowedTypes = array_merge(ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES);
            break;
        default:
            return ['success' => false, 'error' => 'Invalid upload type'];
    }
    
    // Create directory if not exists
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Validate file size
    if ($fileSize > $maxSize) {
        return ['success' => false, 'error' => 'File too large'];
    }
    
    // Validate file type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fileTmpPath);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $allowedTypes)) {
        return ['success' => false, 'error' => 'Invalid file type'];
    }
    
    // Generate unique filename
    $extension = pathinfo($fileName, PATHINFO_EXTENSION);
    $newFileName = $userId . '_' . time() . '.' . $extension;
    $destPath = $uploadDir . $newFileName;
    
    // Move file
    if (!move_uploaded_file($fileTmpPath, $destPath)) {
        return ['success' => false, 'error' => 'Failed to move uploaded file'];
    }
    
    // Generate URL
    $urlPath = UPLOAD_URL_BASE . ($type === 'post' ? 'posts/' : ($type === 'avatar' ? 'avatars/' : 'covers/')) . $newFileName;
    
    return [
        'success' => true,
        'path' => $destPath,
        'url' => $urlPath,
        'type' => in_array($mimeType, ALLOWED_VIDEO_TYPES) ? 'video' : 'image'
    ];
}

/**
 * Delete file from filesystem
 */
function deleteFile($filePath) {
    if (file_exists($filePath)) {
        return unlink($filePath);
    }
    return true;
}

/**
 * Validate image dimensions (optional)
 */
function validateImageDimensions($filePath, $minWidth = 0, $minHeight = 0, $maxWidth = 5000, $maxHeight = 5000) {
    $imageInfo = getimagesize($filePath);
    if (!$imageInfo) {
        return ['valid' => false, 'error' => 'Invalid image'];
    }
    
    list($width, $height) = $imageInfo;
    
    if ($width < $minWidth || $height < $minHeight) {
        return ['valid' => false, 'error' => 'Image too small'];
    }
    
    if ($width > $maxWidth || $height > $maxHeight) {
        return ['valid' => false, 'error' => 'Image too large'];
    }
    
    return ['valid' => true, 'width' => $width, 'height' => $height];
}
```

---

## 🎨 Frontend Integration

### **Changes Needed in pages/profile/app.js**

#### **1. Check Authentication on Page Load**

```javascript
// At the top of app.js
const API_BASE_URL = 'https://neuralnova.space/backend/api';

// Check if user is logged in
async function checkAuth() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (!data.success || !data.data.user) {
      // Not logged in, redirect to login
      window.location.href = '../auth/index.html?redirect=' + encodeURIComponent(window.location.pathname);
      return null;
    }
    
    return data.data.user;
  } catch (error) {
    console.error('Auth check failed:', error);
    window.location.href = '../auth/index.html';
    return null;
  }
}

// Run on page load
let currentUser = null;
(async () => {
  currentUser = await checkAuth();
  if (currentUser) {
    await loadProfileFromBackend();
  }
})();
```

#### **2. Load Profile from Backend**

```javascript
async function loadProfileFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/get.php`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success && data.data.user) {
      const profile = data.data.user;
      
      // Populate UI
      $('#username').value = profile.full_name || '';
      $('#userId').value = profile.custom_user_id || '';
      $('#bio').value = profile.bio || '';
      $('#interests').value = profile.interests || '';
      $('#countrySel').value = profile.country || '';
      $('#ipRegion').value = profile.ip_region || 'auto';
      $('#ipDisplay').textContent = profile.ip_display || '—';
      $('#introCoords').value = profile.gps_coords || '';
      
      // Set avatars
      if (profile.avatar_url) {
        $('#avatar').src = API_BASE_URL + '/..' + profile.avatar_url;
        $('#avatarHero').src = API_BASE_URL + '/..' + profile.avatar_url;
      }
      
      // Set cover
      if (profile.cover_url) {
        $('#cover').src = API_BASE_URL + '/..' + profile.cover_url;
      }
      
      // Update display
      $('#displayName').textContent = profile.full_name || 'User';
      $('#uid').textContent = profile.custom_user_id || profile.id;
      $('#ipShort').textContent = profile.ip_display || '—';
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
    toast('Failed to load profile');
  }
}
```

#### **3. Save Profile to Backend**

```javascript
$('#saveProfile').addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        custom_user_id: $('#userId').value.trim(),
        ip_region: $('#ipRegion').value,
        ip_display: $('#ipDisplay').textContent
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast('Profile saved successfully');
      $('#displayName').textContent = $('#username').value || 'User';
      $('#uid').textContent = $('#userId').value || '—';
    } else {
      toast(data.message || 'Failed to save', true);
    }
  } catch (error) {
    console.error('Save failed:', error);
    toast('Failed to save profile', true);
  }
});

$('#saveIntro').addEventListener('click', async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/update.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        bio: $('#bio').value.trim(),
        interests: $('#interests').value.trim(),
        country: $('#countrySel').value,
        gps_coords: $('#introCoords').value
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast('Intro saved successfully');
    } else {
      toast(data.message || 'Failed to save', true);
    }
  } catch (error) {
    console.error('Save failed:', error);
    toast('Failed to save intro', true);
  }
});
```

#### **4. Upload Avatar**

```javascript
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/profile/upload-avatar.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      const avatarUrl = API_BASE_URL + '/..' + data.data.avatar_url;
      $('#avatar').src = avatarUrl;
      $('#avatarHero').src = avatarUrl;
      toast('Avatar uploaded successfully');
    } else {
      toast(data.message || 'Upload failed', true);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    toast('Failed to upload avatar', true);
  }
}

$('#avatarInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) uploadAvatar(file);
});

$('#avatarInputHero').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) uploadAvatar(file);
});
```

#### **5. Upload Cover**

```javascript
async function uploadCover(file) {
  const formData = new FormData();
  formData.append('cover', file);
  
  try {
    const response = await fetch(`${API_BASE_URL}/profile/upload-cover.php`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      const coverUrl = API_BASE_URL + '/..' + data.data.cover_url;
      $('#cover').src = coverUrl;
      toast('Cover uploaded successfully');
    } else {
      toast(data.message || 'Upload failed', true);
    }
  } catch (error) {
    console.error('Upload failed:', error);
    toast('Failed to upload cover', true);
  }
}

$('#coverInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) uploadCover(file);
});
```

#### **6. Create Post**

```javascript
$('#pPublish').addEventListener('click', async () => {
  // First, upload media if present
  let mediaUrl = '';
  let mediaType = 'none';
  
  const mediaFile = $('#pMedia').files[0];
  if (mediaFile) {
    const formData = new FormData();
    formData.append('media', mediaFile);
    
    try {
      const uploadResponse = await fetch(`${API_BASE_URL}/posts/upload-media.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const uploadData = await uploadResponse.json();
      
      if (uploadData.success) {
        mediaUrl = uploadData.data.media_url;
        mediaType = uploadData.data.media_type;
      } else {
        toast('Media upload failed', true);
        return;
      }
    } catch (error) {
      console.error('Media upload failed:', error);
      toast('Failed to upload media', true);
      return;
    }
  }
  
  // Create post
  try {
    const response = await fetch(`${API_BASE_URL}/posts/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        species: $('#pSpecies').value,
        region: $('#pRegion').value,
        bloom_window: $('#pBloomWin').value,
        species_info: $('#pInfo').value,
        coordinates: $('#pCoords').value.trim(),
        post_date: $('#pDate').value,
        caption: $('#pCaption').value.trim(),
        media_url: mediaUrl,
        media_type: mediaType,
        is_public: 1,
        blur_location: 0
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      toast('Post published successfully');
      $('#pCaption').value = '';
      $('#pMedia').value = '';
      $('#pDate').value = '';
      $('#pCoords').value = '';
      
      // Reload feed
      await loadPostsFeed();
    } else {
      toast(data.message || 'Failed to publish', true);
    }
  } catch (error) {
    console.error('Publish failed:', error);
    toast('Failed to publish post', true);
  }
});
```

#### **7. Load Posts Feed**

```javascript
async function loadPostsFeed(page = 1) {
  try {
    const response = await fetch(`${API_BASE_URL}/posts/list.php?user_id=${currentUser.id}&page=${page}&limit=10`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      renderPostsFeed(data.data.posts);
    }
  } catch (error) {
    console.error('Failed to load posts:', error);
  }
}

function renderPostsFeed(posts) {
  const box = $('#postFeed');
  if (!box) return;
  
  box.innerHTML = posts.map(post => {
    const media = post.media_url ? 
      (post.media_type === 'video' ? 
        `<video src="${API_BASE_URL}/.." + ${post.media_url}" controls></video>` : 
        `<img src="${API_BASE_URL}/.." + ${post.media_url}" alt="media">`) : 
      '';
    
    return `<div class="card" data-post-id="${post.id}">
      <div class="head">
        <img src="${post.user.avatar_url ? API_BASE_URL + '/..' + post.user.avatar_url : '../../assets/images/logo.png'}" alt="avatar">
        <div>
          <div class="name">${post.user.full_name}</div>
          <div class="sub">${new Date(post.created_at).toLocaleString('vi-VN')}</div>
        </div>
      </div>
      <div class="body">
        <div><strong>${post.species}</strong> • ${post.region}</div>
        <div>Bloom window: ${post.bloom_window || '—'}</div>
        <div>${post.species_info || ''}</div>
        <div>Coordinates: ${post.coordinates || '—'} ${post.post_date ? '• Date: ' + post.post_date : ''}</div>
        <div class="media">${media}</div>
        <div>${post.caption || ''}</div>
      </div>
      <div class="actions">
        <div class="reacts">
          <button class="react-btn" data-action="react" data-type="like" data-id="${post.id}">
            <i data-lucide="thumbs-up"></i><span>${post.reactions.like || 0}</span>
          </button>
          <button class="react-btn" data-action="react" data-type="heart" data-id="${post.id}">
            <i data-lucide="heart"></i><span>${post.reactions.heart || 0}</span>
          </button>
          <button class="react-btn" data-action="react" data-type="flower" data-id="${post.id}">
            <i data-lucide="flower-2"></i><span>${post.reactions.flower || 0}</span>
          </button>
          <button class="react-btn" data-action="react" data-type="wow" data-id="${post.id}">
            <i data-lucide="sparkles"></i><span>${post.reactions.wow || 0}</span>
          </button>
        </div>
        <button class="chip-btn" data-action="comment" data-id="${post.id}">💬 Comment</button>
      </div>
      <div class="comments" id="comments_${post.id}" hidden></div>
    </div>`;
  }).join('') || '<div class="card">No posts yet</div>';
  
  // Wire up event listeners
  if (window.lucide) lucide.createIcons();
  wirePostActions();
}
```

#### **8. Reactions & Comments**

```javascript
function wirePostActions() {
  // Reactions
  $$('.react-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.id;
      const type = btn.dataset.type;
      
      try {
        const response = await fetch(`${API_BASE_URL}/reactions/add.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ post_id: postId, reaction_type: type })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Update count
          btn.querySelector('span').textContent = data.data.new_count;
        }
      } catch (error) {
        console.error('Reaction failed:', error);
      }
    });
  });
  
  // Comments toggle
  $$('.chip-btn[data-action="comment"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.id;
      const commentsDiv = $(`#comments_${postId}`);
      
      if (commentsDiv.hidden) {
        // Load comments
        await loadComments(postId);
        commentsDiv.hidden = false;
      } else {
        commentsDiv.hidden = true;
      }
    });
  });
}

async function loadComments(postId) {
  try {
    const response = await fetch(`${API_BASE_URL}/comments/list.php?post_id=${postId}`, {
      credentials: 'include'
    });
    const data = await response.json();
    
    if (data.success) {
      renderComments(postId, data.data.comments);
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
  }
}

function renderComments(postId, comments) {
  const commentsDiv = $(`#comments_${postId}`);
  
  commentsDiv.innerHTML = `
    ${comments.map(c => `
      <div class="item">
        <img src="${c.user.avatar_url ? API_BASE_URL + '/..' + c.user.avatar_url : '../../assets/images/logo.png'}" alt="avatar">
        <div>
          <strong>${c.user.full_name}</strong>
          <p>${c.comment_text}</p>
          <span class="time">${new Date(c.created_at).toLocaleString('vi-VN')}</span>
        </div>
      </div>
    `).join('')}
    <div class="write">
      <input id="comment_input_${postId}" placeholder="Write a comment..."/>
      <button class="chip-btn" data-action="send-comment" data-id="${postId}">Send</button>
    </div>
  `;
  
  // Wire send button
  $(`button[data-action="send-comment"][data-id="${postId}"]`).addEventListener('click', async () => {
    const input = $(`#comment_input_${postId}`);
    const text = input.value.trim();
    
    if (!text) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/comments/create.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId, comment_text: text })
      });
      
      const data = await response.json();
      
      if (data.success) {
        input.value = '';
        await loadComments(postId);
      }
    } catch (error) {
      console.error('Comment failed:', error);
    }
  });
}
```

---

## 📅 Implementation Plan

### **Phase 1: Database Setup** (Day 1 - Morning)

**Time**: 2-3 hours

1. ✅ Create SQL migration files:
   - `002_users_profile_extension.sql`
   - `003_posts_table.sql`
   - `004_reactions_table.sql`
   - `005_comments_table.sql`
   - `006_activities_table.sql` (optional)

2. ✅ Run migrations on VPS
3. ✅ Verify tables created correctly
4. ✅ Create indexes for performance

**Deliverable**: Database schema ready

---

### **Phase 2: File Upload System** (Day 1 - Afternoon)

**Time**: 3-4 hours

1. ✅ Create `backend/includes/file_upload.php`
2. ✅ Create upload directories:
   - `backend/uploads/avatars/`
   - `backend/uploads/covers/`
   - `backend/uploads/posts/`
3. ✅ Set proper permissions (755 for directories)
4. ✅ Test file upload with sample files

**Deliverable**: File upload helper ready

---

### **Phase 3: Profile APIs** (Day 2)

**Time**: 4-6 hours

1. ✅ Create `/api/profile/get.php`
2. ✅ Create `/api/profile/update.php`
3. ✅ Create `/api/profile/upload-avatar.php`
4. ✅ Create `/api/profile/upload-cover.php`
5. ✅ Create `/api/profile/stats.php`
6. ✅ Test all endpoints with Postman/test-api.html

**Deliverable**: Profile APIs functional

---

### **Phase 4: Posts APIs** (Day 3)

**Time**: 6-8 hours

1. ✅ Create `/api/posts/upload-media.php`
2. ✅ Create `/api/posts/create.php`
3. ✅ Create `/api/posts/list.php` (with pagination)
4. ✅ Create `/api/posts/feed.php`
5. ✅ Create `/api/posts/get.php`
6. ✅ Create `/api/posts/delete.php`
7. ✅ Test all endpoints

**Deliverable**: Posts system working

---

### **Phase 5: Reactions APIs** (Day 4 - Morning)

**Time**: 2-3 hours

1. ✅ Create `/api/reactions/add.php`
2. ✅ Create `/api/reactions/remove.php`
3. ✅ Create `/api/reactions/count.php`
4. ✅ Test reactions

**Deliverable**: Reactions functional

---

### **Phase 6: Comments APIs** (Day 4 - Afternoon)

**Time**: 2-3 hours

1. ✅ Create `/api/comments/create.php`
2. ✅ Create `/api/comments/list.php`
3. ✅ Create `/api/comments/delete.php`
4. ✅ Test comments

**Deliverable**: Comments functional

---

### **Phase 7: Frontend Integration** (Day 5)

**Time**: 6-8 hours

1. ✅ Update `pages/profile/app.js`:
   - Add auth check
   - Load profile from backend
   - Save profile to backend
   - Upload avatar/cover
   - Create posts
   - Load posts feed
   - Wire reactions
   - Wire comments

2. ✅ Update UI for loading states
3. ✅ Add error handling
4. ✅ Test full flow

**Deliverable**: Frontend fully integrated

---

### **Phase 8: Statistics & Timeline** (Bonus)

**Time**: 2-3 hours

1. ✅ Calculate stats from database
2. ✅ Render badges based on activity
3. ✅ Generate bloom accuracy timeline

**Deliverable**: Stats & timeline working

---

## 🔒 Security & Optimization

### **Security Measures**:

1. ✅ **Authentication**: All APIs check session
2. ✅ **Authorization**: Users can only edit their own posts
3. ✅ **Input Validation**: Sanitize all inputs
4. ✅ **File Validation**: Check MIME types, sizes
5. ✅ **SQL Injection**: Use PDO prepared statements
6. ✅ **XSS Prevention**: Escape outputs
7. ✅ **CSRF**: SameSite cookies
8. ✅ **Rate Limiting**: Prevent spam (optional)

### **Optimization**:

1. ✅ **Database Indexes**: On user_id, created_at, post_id
2. ✅ **Pagination**: Limit results per page
3. ✅ **Image Compression**: Resize large images (optional)
4. ✅ **CDN**: Serve media from CDN (future)
5. ✅ **Caching**: Cache user profiles (future)

---

## ✅ Testing Checklist

### **Profile Tests**:
- [ ] Get profile (logged in user)
- [ ] Get profile (specific user)
- [ ] Update profile info
- [ ] Upload avatar (JPG, PNG, GIF)
- [ ] Upload cover photo
- [ ] Get stats (accurate counts)

### **Posts Tests**:
- [ ] Create post with image
- [ ] Create post with video
- [ ] Create post without media
- [ ] List user's posts (pagination)
- [ ] Get single post details
- [ ] Delete own post
- [ ] Cannot delete other's post

### **Reactions Tests**:
- [ ] Add reaction (like, heart, flower, wow)
- [ ] Toggle reaction (remove if already exists)
- [ ] Get reaction counts
- [ ] Multiple users can react to same post

### **Comments Tests**:
- [ ] Add comment
- [ ] List comments for post
- [ ] Delete own comment
- [ ] Cannot delete other's comment

### **Security Tests**:
- [ ] Cannot access APIs without login
- [ ] Cannot edit other users' profiles
- [ ] Cannot delete other users' posts
- [ ] File upload validates size and type
- [ ] SQL injection attempts blocked
- [ ] XSS attempts escaped

---

## 📚 Documentation Files

After implementation, create these docs:

1. ✅ `backend/README.md` - Updated with new APIs
2. ✅ `document/PROFILE_API_DOCS.md` - API reference
3. ✅ `document/DATABASE_SCHEMA.md` - Full schema
4. ✅ `document/FILE_UPLOAD_GUIDE.md` - Upload instructions

---

## 🎯 Success Metrics

**By the end, you should have**:

1. ✅ Full user profile management
2. ✅ Posts with media upload
3. ✅ Reactions system (4 types)
4. ✅ Comments system
5. ✅ Timeline & feed
6. ✅ Statistics & badges
7. ✅ Secure & scalable backend
8. ✅ Seamless frontend integration

**It will feel like**: **Facebook for flower tracking!** 🌸

---

## 🚀 Next Steps

1. **Review this plan** - Make sure you understand each phase
2. **Set up environment** - Ensure VPS is ready
3. **Start Phase 1** - Database setup
4. **Daily progress** - Complete 1-2 phases per day
5. **Test thoroughly** - Use test files after each phase

---

**Ready to start?** Let me know and I'll begin with Phase 1! 🎉

---

**Estimated Total Time**: 25-35 hours (3-5 days)  
**Difficulty**: ⭐⭐⭐⭐ Advanced  
**Reward**: A fully functional social network! 🌟
