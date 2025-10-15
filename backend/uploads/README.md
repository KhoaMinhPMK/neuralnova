# 📁 NeuralNova Uploads Directory

**Purpose**: Store user-uploaded files (avatars, covers, post media)  
**Security**: PHP execution disabled via `.htaccess`

---

## 📂 Directory Structure

```
uploads/
├── .htaccess              # Security rules
├── README.md              # This file
├── avatars/               # User avatar images
│   ├── .htaccess          # PHP disabled
│   └── avatar_{userId}_{timestamp}_{random}.{ext}
├── covers/                # User cover photos
│   ├── .htaccess          # PHP disabled
│   └── cover_{userId}_{timestamp}_{random}.{ext}
└── posts/                 # Post media (images/videos)
    ├── .htaccess          # PHP disabled
    └── post_{userId}_{timestamp}_{random}.{ext}
```

---

## 🔒 Security

1. **PHP Execution Disabled**: `.htaccess` prevents PHP execution
2. **File Type Validation**: Only images and videos allowed
3. **Size Limits**:
   - Avatars: 5 MB max
   - Covers: 10 MB max
   - Posts: 20 MB max
4. **Random Filenames**: Prevent guessing/enumeration
5. **CORS Enabled**: Media accessible from frontend

---

## 📊 File Naming Convention

**Format**: `{type}_{userId}_{timestamp}_{random}.{ext}`

**Examples**:
- `avatar_1_1760512345_a3f7c8e9.jpg`
- `cover_1_1760512346_b2d4e1f5.png`
- `post_1_1760512347_c8a9f3d2.mp4`

**Parts**:
- `type`: avatar, cover, post
- `userId`: User ID from database
- `timestamp`: Unix timestamp
- `random`: 16-char hex string
- `ext`: File extension (jpg, png, gif, webp, mp4, webm)

---

## 🎯 Allowed File Types

### **Images** (All Categories)
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

### **Videos** (Posts Only)
- MP4 (`.mp4`)
- WebM (`.webm`)
- QuickTime (`.mov`)

---

## 📏 Size Limits

| Type | Max Size | Recommended Dimensions |
|------|----------|------------------------|
| Avatar | 5 MB | 400x400 px (square) |
| Cover | 10 MB | 1500x500 px (3:1 ratio) |
| Post Image | 20 MB | 1920x1080 px max |
| Post Video | 20 MB | 1920x1080 px, <60 sec |

---

## 🔗 URL Access

**Base URL**: `https://neuralnova.space/backend/uploads/`

**Examples**:
- Avatar: `https://neuralnova.space/backend/uploads/avatars/avatar_1_1760512345_a3f7c8e9.jpg`
- Cover: `https://neuralnova.space/backend/uploads/covers/cover_1_1760512346_b2d4e1f5.png`
- Post: `https://neuralnova.space/backend/uploads/posts/post_1_1760512347_c8a9f3d2.mp4`

---

## 🧹 Cleanup Policy

**Orphaned Files**: Files not referenced in database  
**Frequency**: Monthly (via cron job)  
**Retention**: 30 days for orphaned files

**Cleanup Script**:
```php
require_once '../includes/file_upload.php';
$deleted = cleanupOldFiles(30); // Delete files older than 30 days
echo "Deleted {$deleted} old files";
```

---

## 📋 Permissions

**Directory**: `755` (rwxr-xr-x)  
**Files**: `644` (rw-r--r--)

**Set Permissions**:
```bash
# On VPS
chmod 755 uploads/
chmod 755 uploads/avatars/
chmod 755 uploads/covers/
chmod 755 uploads/posts/
```

---

## ⚠️ Important Notes

1. **Never commit uploads** to Git (already in `.gitignore`)
2. **Backup uploads separately** from code
3. **Monitor disk space** - videos can grow quickly
4. **CDN recommended** for production (CloudFlare, etc.)
5. **Test uploads** on VPS after deployment

---

**Created**: October 15, 2025  
**Status**: ✅ Ready for Use
