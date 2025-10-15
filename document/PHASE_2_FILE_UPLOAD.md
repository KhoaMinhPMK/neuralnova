# ✅ Phase 2: File Upload System - Complete

**Date**: October 15, 2025  
**Status**: 🟢 Ready to Deploy  
**Duration**: 1-2 hours

---

## 📦 Files Created

### **Backend Files**:
```
✅ backend/includes/file_upload.php         (Upload helper with 10+ functions)
✅ backend/uploads/.htaccess                (Security rules)
✅ backend/uploads/README.md                (Documentation)
✅ backend/uploads/avatars/.htaccess        (PHP disabled)
✅ backend/uploads/covers/.htaccess         (PHP disabled)
✅ backend/uploads/posts/.htaccess          (PHP disabled)
```

**Total**: 6 files (1 PHP helper + 4 security files + 1 doc)

---

## 🗂️ Directory Structure

```
backend/
└── uploads/
    ├── .htaccess              # Main security rules + CORS
    ├── README.md              # Documentation
    ├── avatars/               # User avatars (5 MB max)
    │   └── .htaccess          # PHP execution disabled
    ├── covers/                # Cover photos (10 MB max)
    │   └── .htaccess          # PHP execution disabled
    └── posts/                 # Post media (20 MB max)
        └── .htaccess          # PHP execution disabled
```

---

## 🔧 Functions Available

### **1. `initUploadDirectories()`**
- Creates upload directories if missing
- Creates `.htaccess` files for security
- **Usage**: Auto-called by `uploadFile()`

---

### **2. `uploadFile($file, $type, $userId)`**
**Main upload function**

**Parameters**:
- `$file` - `$_FILES['fieldname']` array
- `$type` - `'avatar'`, `'cover'`, or `'post'`
- `$userId` - User ID (for filename)

**Returns**:
```php
[
    'success' => true,
    'path' => 'avatars/avatar_1_1760512345_a3f7c8e9.jpg',
    'filename' => 'avatar_1_1760512345_a3f7c8e9.jpg',
    'size' => 123456,
    'type' => 'image/jpeg'
]
// or on error:
[
    'success' => false,
    'error' => 'File too large. Maximum size: 5 MB'
]
```

**Example**:
```php
require_once '../includes/file_upload.php';

if (isset($_FILES['avatar'])) {
    $result = uploadFile($_FILES['avatar'], 'avatar', $userId);
    
    if ($result['success']) {
        // Save $result['path'] to database
        $avatarPath = $result['path'];
    } else {
        echo $result['error'];
    }
}
```

---

### **3. `deleteUploadedFile($relativePath)`**
**Delete uploaded file**

**Parameters**:
- `$relativePath` - Path from database (e.g., `avatars/avatar_1_123.jpg`)

**Returns**: `true` if deleted, `false` otherwise

**Example**:
```php
$oldAvatarPath = 'avatars/avatar_1_old.jpg';
if (deleteUploadedFile($oldAvatarPath)) {
    echo "Old avatar deleted";
}
```

---

### **4. `getFileUrl($relativePath, $baseUrl = null)`**
**Get full URL for frontend**

**Parameters**:
- `$relativePath` - Path from database
- `$baseUrl` - Optional base URL (auto-detected if null)

**Returns**: Full URL string

**Example**:
```php
$avatarPath = 'avatars/avatar_1_123.jpg';
$url = getFileUrl($avatarPath);
// Returns: https://neuralnova.space/backend/uploads/avatars/avatar_1_123.jpg
```

---

### **5. `validateImageDimensions($filePath, $minW, $minH, $maxW, $maxH)`**
**Validate image size (optional)**

**Parameters**:
- `$filePath` - Full path to image
- `$minWidth`, `$minHeight` - Minimum dimensions (optional)
- `$maxWidth`, `$maxHeight` - Maximum dimensions (optional)

**Returns**:
```php
[
    'valid' => true,
    'width' => 1024,
    'height' => 768
]
```

**Example**:
```php
$tmpPath = $_FILES['avatar']['tmp_name'];
$validation = validateImageDimensions($tmpPath, 100, 100, 2000, 2000);

if (!$validation['valid']) {
    echo $validation['error'];
}
```

---

### **6. `getFileMetadata($relativePath)`**
**Get file info**

**Returns**:
```php
[
    'path' => 'avatars/avatar_1_123.jpg',
    'size' => 123456,
    'modified' => 1760512345,
    'type' => 'image/jpeg',
    'width' => 1024,  // if image
    'height' => 768   // if image
]
```

---

### **7. `cleanupOldFiles($daysOld = 30, $directory = null)`**
**Maintenance function** (for cron job)

**Parameters**:
- `$daysOld` - Delete files older than X days
- `$directory` - Specific directory (null = all)

**Returns**: Number of files deleted

**Example**:
```php
$deleted = cleanupOldFiles(30); // Delete files older than 30 days
echo "Deleted {$deleted} orphaned files";
```

---

## 📏 File Validation Rules

### **Avatars**
- **Max Size**: 5 MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Recommended**: 400x400 px (square)

### **Covers**
- **Max Size**: 10 MB
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Recommended**: 1500x500 px (3:1 ratio)

### **Posts**
- **Max Size**: 20 MB
- **Allowed Types**: JPEG, PNG, GIF, WebP, MP4, WebM, MOV
- **Recommended**: Max 1920x1080 px

---

## 🔒 Security Features

### **1. PHP Execution Disabled**
```apache
# .htaccess in each upload directory
php_flag engine off
```

**Why**: Prevents malicious PHP files from being executed

---

### **2. File Type Validation**
```php
// Only allow specific MIME types
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', ...]
ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', ...]
```

**Checked via**: `mime_content_type()` (not just extension)

---

### **3. Random Filenames**
```php
// Format: {type}_{userId}_{timestamp}_{random}.{ext}
$randomString = bin2hex(random_bytes(8));
// Example: avatar_1_1760512345_a3f7c8e9.jpg
```

**Why**: Prevents enumeration attacks

---

### **4. Directory Listing Disabled**
```apache
Options -Indexes
```

**Why**: Prevents browsing upload directory

---

### **5. CORS Headers**
```apache
Header set Access-Control-Allow-Origin "*"
```

**Why**: Allows frontend to load media files

---

## 🚀 VPS Deployment

### **Step 1: Upload Files via Git**

```bash
# On local machine
git add backend/includes/file_upload.php
git add backend/uploads/
git commit -m "Phase 2: File upload system"
git push origin main

# On VPS
cd /path/to/neuralnova
git pull origin main
```

---

### **Step 2: Set Permissions**

```bash
# SSH into VPS
ssh user@neuralnova.space

# Navigate to backend
cd /path/to/neuralnova/backend

# Set directory permissions (755 = rwxr-xr-x)
chmod 755 uploads/
chmod 755 uploads/avatars/
chmod 755 uploads/covers/
chmod 755 uploads/posts/

# Ensure Apache can write
chown -R www-data:www-data uploads/
# or on some servers:
chown -R apache:apache uploads/
```

---

### **Step 3: Verify Permissions**

```bash
ls -la uploads/
# Should show: drwxr-xr-x ... www-data www-data ... avatars/
```

---

### **Step 4: Test Upload**

Create `backend/test/test-upload.php`:

```php
<?php
require_once '../includes/file_upload.php';

// Test directory creation
initUploadDirectories();

// Check if directories exist
$dirs = [
    'uploads/avatars/',
    'uploads/covers/',
    'uploads/posts/'
];

foreach ($dirs as $dir) {
    $fullPath = dirname(__DIR__) . '/' . $dir;
    echo $dir . ': ' . (file_exists($fullPath) ? '✅ EXISTS' : '❌ MISSING') . "\n";
    echo 'Writable: ' . (is_writable($fullPath) ? '✅ YES' : '❌ NO') . "\n\n";
}
```

**Access**: `https://neuralnova.space/backend/test/test-upload.php`

**Expected**:
```
uploads/avatars/: ✅ EXISTS
Writable: ✅ YES

uploads/covers/: ✅ EXISTS
Writable: ✅ YES

uploads/posts/: ✅ EXISTS
Writable: ✅ YES
```

---

## 🧪 Usage Examples

### **Example 1: Upload Avatar**

```php
<?php
require_once '../includes/file_upload.php';
require_once '../config/database.php';
require_once '../includes/session.php';

startSecureSession();

if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit;
}

$userId = $_SESSION['user_id'];

if (isset($_FILES['avatar'])) {
    $result = uploadFile($_FILES['avatar'], 'avatar', $userId);
    
    if ($result['success']) {
        // Update database
        $stmt = $pdo->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
        $stmt->execute([$result['path'], $userId]);
        
        echo json_encode([
            'success' => true,
            'path' => $result['path'],
            'url' => getFileUrl($result['path'])
        ]);
    } else {
        echo json_encode($result);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No file uploaded']);
}
```

---

### **Example 2: Upload Cover**

```php
if (isset($_FILES['cover'])) {
    $result = uploadFile($_FILES['cover'], 'cover', $userId);
    
    if ($result['success']) {
        $stmt = $pdo->prepare("UPDATE users SET cover_url = ? WHERE id = ?");
        $stmt->execute([$result['path'], $userId]);
        
        echo json_encode(['success' => true, 'url' => getFileUrl($result['path'])]);
    }
}
```

---

### **Example 3: Upload Post Media**

```php
if (isset($_FILES['media'])) {
    $result = uploadFile($_FILES['media'], 'post', $userId);
    
    if ($result['success']) {
        // Determine media type
        $isVideo = strpos($result['type'], 'video/') === 0;
        $mediaType = $isVideo ? 'video' : 'image';
        
        // Insert post
        $stmt = $pdo->prepare("
            INSERT INTO posts (user_id, media_url, media_type, caption) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$userId, $result['path'], $mediaType, $_POST['caption']]);
        
        echo json_encode(['success' => true, 'post_id' => $pdo->lastInsertId()]);
    }
}
```

---

### **Example 4: Delete Old Avatar**

```php
// Before uploading new avatar, delete old one
$stmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
$stmt->execute([$userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user['avatar_url']) {
    deleteUploadedFile($user['avatar_url']);
}

// Then upload new avatar
$result = uploadFile($_FILES['avatar'], 'avatar', $userId);
```

---

## ⚠️ Important Notes

### **1. php.ini Configuration**

Ensure these settings in `php.ini`:

```ini
upload_max_filesize = 25M
post_max_size = 30M
memory_limit = 128M
max_execution_time = 300
```

**Check Current Settings**:
```php
echo ini_get('upload_max_filesize'); // Should be 25M or higher
echo ini_get('post_max_size');       // Should be 30M or higher
```

---

### **2. .gitignore**

Add to `.gitignore`:
```
backend/uploads/*
!backend/uploads/.htaccess
!backend/uploads/README.md
!backend/uploads/avatars/.htaccess
!backend/uploads/covers/.htaccess
!backend/uploads/posts/.htaccess
```

**Why**: Never commit user uploads to Git

---

### **3. Backup Strategy**

**Uploads should be backed up separately from code**:

```bash
# Backup uploads (VPS)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/

# Restore uploads
tar -xzf uploads_backup_20251015.tar.gz
```

---

### **4. CDN Integration (Future)**

For production, consider using a CDN:
- CloudFlare Images
- AWS S3 + CloudFront
- DigitalOcean Spaces

**Benefits**:
- Faster delivery
- Reduced server load
- Better caching

---

## ✅ Phase 2 Checklist

- [x] File upload helper created (`file_upload.php`)
- [x] Upload directories created (`avatars/`, `covers/`, `posts/`)
- [x] Security `.htaccess` files in place
- [x] Documentation written
- [ ] Deployed to VPS
- [ ] Permissions set (755 for dirs)
- [ ] Test upload successful
- [ ] php.ini settings verified
- [ ] .gitignore updated

---

## 🎉 Phase 2 Complete!

**What's Done**:
- ✅ Upload system with 10+ helper functions
- ✅ Secure directory structure
- ✅ File type & size validation
- ✅ Random filename generation
- ✅ PHP execution disabled in uploads
- ✅ CORS enabled for media access

**What's Next**:
➡️ **Phase 3**: Profile API  
➡️ Create `backend/api/profile/get.php`  
➡️ Create `backend/api/profile/update.php`  
➡️ Create `backend/api/profile/upload-avatar.php`  
➡️ Create `backend/api/profile/upload-cover.php`

---

**Status**: ✅ Ready to Deploy  
**Files**: 6 (1 PHP + 4 security + 1 doc)  
**Functions**: 10  
**Max Upload**: 20 MB (posts)
