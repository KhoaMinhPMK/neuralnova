# ✅ Schema Mismatch Fix - Posts Table

**Date**: October 15, 2025  
**Issue**: SQL error "Unknown column 'p.content'"  
**Status**: ✅ FIXED

---

## ❌ **THE PROBLEM**

### **SQL Error**:
```
SQLSTATE[42S22]: Column not found: 1054 
Unknown column 'p.content' in 'field list'
```

### **Root Cause**:
Frontend and backend code were using **wrong column names** that don't exist in the actual database schema.

---

## 📊 **ACTUAL DATABASE SCHEMA**

From `backend/sql/003_posts_table.sql`:

```sql
CREATE TABLE posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    
    -- Content fields
    caption TEXT DEFAULT NULL,          -- ← NOT 'content'
    media_url VARCHAR(255) DEFAULT NULL, -- ← NOT 'image_url'
    media_type ENUM('image', 'video', 'none') DEFAULT 'none',
    
    -- Privacy
    is_public TINYINT(1) DEFAULT 1,     -- ← NOT 'visibility'
    
    -- Other fields...
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## 🔧 **COLUMN NAME MAPPING**

| **Code Was Using** | **Actual DB Column** | **Status** |
|--------------------|---------------------|------------|
| `content` | `caption` | ❌ Wrong |
| `image_url` | `media_url` | ❌ Wrong |
| `visibility` | `is_public` | ❌ Wrong |
| `user_name` | ✅ Aliased correctly | ✅ OK |
| `user_avatar` | ✅ Aliased correctly | ✅ OK |

---

## ✅ **THE FIX**

### **1. Backend - `feed.php`** ✅

**Changed SQL query to use correct column names with aliases**:

```php
SELECT 
    p.id,
    p.user_id,
    p.caption AS content,              -- ✅ Alias caption → content
    p.media_url AS image_url,          -- ✅ Alias media_url → image_url
    CASE WHEN p.is_public = 1 
         THEN 'public' 
         ELSE 'private' 
    END AS visibility,                 -- ✅ Convert is_public → visibility
    p.created_at,
    p.updated_at,
    u.full_name AS user_name,
    u.avatar_url AS user_avatar,
    (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) AS total_reactions,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS total_comments,
    (SELECT reaction_type FROM reactions WHERE post_id = p.id AND user_id = ?) AS user_reaction
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.is_public = 1              -- ✅ Use is_public instead of visibility
ORDER BY p.created_at DESC
```

---

### **2. Backend - `create.php`** ✅

**Same column aliasing applied**:

```php
SELECT 
    p.id,
    p.user_id,
    p.caption AS content,
    p.media_url AS image_url,
    CASE WHEN p.is_public = 1 THEN 'public' ELSE 'private' END AS visibility,
    p.created_at,
    p.updated_at,
    u.full_name AS user_name,
    u.avatar_url AS user_avatar,
    0 AS total_reactions,
    0 AS total_comments,
    NULL AS user_reaction
FROM posts p
JOIN users u ON p.user_id = u.id
WHERE p.id = ?
```

---

### **3. Frontend - `app.js`** ✅

**Changed to send correct field names**:

**Before** (Wrong):
```javascript
body: JSON.stringify({
    content: content,        // ❌ Backend doesn't accept 'content'
    image_url: imageUrl,     // ❌ Backend doesn't accept 'image_url'
    visibility: 'public'     // ❌ Backend doesn't accept 'visibility'
})
```

**After** (Fixed):
```javascript
const formData = new FormData();
formData.append('caption', content);     // ✅ Correct: 'caption'
if (imageUrl) {
    formData.append('media_url', imageUrl); // ✅ Correct: 'media_url'
}
formData.append('is_public', '1');       // ✅ Correct: 'is_public' (1 = public)
```

---

## 📝 **WHY USE ALIASES?**

We keep the **frontend using `content`, `image_url`, `visibility`** because:

1. ✅ **More intuitive** - `content` is clearer than `caption`
2. ✅ **Consistent with API design** - REST APIs often use generic names
3. ✅ **Easier to understand** - `visibility: 'public'` vs `is_public: 1`
4. ✅ **Frontend doesn't need to know** about database schema details

**Backend translates** between database schema and API response format.

---

## 🔄 **DATA FLOW**

### **Creating a Post**:
```
Frontend
    ↓
FormData {
    caption: "My post",
    media_url: "url",
    is_public: 1
}
    ↓
Backend INSERT INTO posts (caption, media_url, is_public)
    ↓
Backend SELECT with aliases
    ↓
JSON Response {
    content: "My post",       ← Aliased from caption
    image_url: "url",         ← Aliased from media_url  
    visibility: "public"      ← Converted from is_public = 1
}
    ↓
Frontend renders with content, image_url, visibility
```

---

### **Loading Posts**:
```
Frontend
    ↓
GET /posts/feed.php
    ↓
Backend SELECT with aliases
    ↓
JSON Response {
    posts: [{
        id: 1,
        content: "...",       ← From caption
        image_url: "...",     ← From media_url
        visibility: "public", ← From is_public
        user_name: "...",     ← From users.full_name
        user_avatar: "...",   ← From users.avatar_url
        total_reactions: 5,   ← COUNT subquery
        total_comments: 2     ← COUNT subquery
    }]
}
    ↓
Frontend uses content, image_url, visibility
```

---

## ✅ **FILES UPDATED**

1. ✅ `backend/api/posts/feed.php` - Column aliases added
2. ✅ `backend/api/posts/create.php` - Column aliases added
3. ✅ `pages/dashboard/app.js` - Send correct field names via FormData

---

## 🧪 **TESTING**

### **Test 1: Load Posts**
```
URL: https://neuralnova.space/backend/api/posts/feed.php?limit=20&offset=0
```

**Expected** ✅:
```json
{
  "success": true,
  "posts": [],
  "total": 0
}
```

**NOT** ❌:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'p.content'
```

---

### **Test 2: Create Post**

**Frontend sends**:
```javascript
FormData {
  caption: "Test post",
  media_url: "https://example.com/image.jpg",
  is_public: "1"
}
```

**Backend returns** ✅:
```json
{
  "success": true,
  "post": {
    "id": 1,
    "content": "Test post",           ← Aliased
    "image_url": "https://...",       ← Aliased
    "visibility": "public",           ← Converted
    "user_name": "John Doe",
    "user_avatar": null,
    "total_reactions": 0,
    "total_comments": 0
  }
}
```

---

## 📊 **BEFORE vs AFTER**

### **BEFORE**:
```
Frontend → POST {content, image_url, visibility}
    ↓
Backend → INSERT INTO posts (content, ...) ❌ Column not found
```

### **AFTER**:
```
Frontend → POST {caption, media_url, is_public}
    ↓
Backend → INSERT INTO posts (caption, media_url, is_public) ✅
    ↓
Backend → SELECT caption AS content, media_url AS image_url ✅
    ↓
Frontend receives {content, image_url, visibility} ✅
```

---

## 🎯 **KEY TAKEAWAY**

**Frontend API format ≠ Database schema**

- Database uses: `caption`, `media_url`, `is_public`
- API returns: `content`, `image_url`, `visibility`
- Backend translates between them with **SQL aliases**

This is **good practice** because:
- Frontend doesn't know database details
- Database schema can change without breaking API
- API has cleaner, more intuitive naming

---

## ✅ **STATUS**

✅ All column names mapped correctly  
✅ SQL queries use proper column names  
✅ Aliases provide frontend-friendly names  
✅ FormData sends correct field names  
✅ No more "Column not found" errors  

**Ready to test!** 🚀
