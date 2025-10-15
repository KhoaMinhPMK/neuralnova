# 🔍 Debug Backend Errors - Step by Step

**Issue**: Backend returning HTML error instead of JSON  
**Error**: `Unexpected token '<', "<br /><b>"... is not valid JSON`

---

## 📋 **STEP-BY-STEP DEBUG GUIDE**

### **STEP 1: Check Console for Full Error**

Sau khi hard refresh (`Ctrl + F5`), mở Console (`F12`), tìm:

```
❌ BACKEND ERROR - Returned HTML instead of JSON:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<br />
<b>Fatal error</b>: [Error details here]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Copy toàn bộ error message** để debug.

---

### **STEP 2: Test Backend API Directly**

Mở URL này trực tiếp trong browser:

```
https://neuralnova.space/backend/api/posts/feed.php?limit=20&offset=0
```

**EXPECTED (Good)** ✅:
```json
{
  "success": true,
  "posts": [],
  "total": 0,
  "timestamp": "2025-10-15 12:00:00"
}
```

**ACTUAL (Bad)** ❌:
```html
<br />
<b>Fatal error</b>: Call to undefined function initSession() in 
/home/neuralnova/backend/api/posts/feed.php on line 43
```

---

### **STEP 3: Common Backend Errors & Fixes**

---

#### ❌ **ERROR 1: Function Not Found**

```
Fatal error: Call to undefined function initSession()
```

**Cause**: Missing `require_once` statement

**Fix**: Add to top of API file
```php
<?php
define('API_ACCESS', true);

require_once '../../config/database.php';
require_once '../../includes/session.php';  // ← Add this
require_once '../../includes/file_upload.php';

initSession(); // Now this will work
```

---

#### ❌ **ERROR 2: File Not Found**

```
Warning: require_once(../../includes/session.php): 
failed to open stream: No such file or directory
```

**Cause**: File path incorrect or file missing

**Fix**:
1. Check file exists: `backend/includes/session.php`
2. Check path from API file is correct
3. Verify folder structure:
   ```
   backend/
   ├── api/
   │   └── posts/
   │       └── feed.php         (relative: ../../includes/)
   └── includes/
       └── session.php
   ```

---

#### ❌ **ERROR 3: Database Connection Failed**

```
Warning: mysqli_connect(): (HY000/1045): 
Access denied for user 'root'@'localhost' (using password: NO)
```

**Cause**: Wrong database credentials

**Fix**: Edit `backend/config/database.php`
```php
$host = 'localhost';
$database = 'neuralnova';  // Check DB name
$username = 'root';         // Check username
$password = 'your_password'; // Add password if needed
```

Test connection:
```bash
mysql -u root -p
USE neuralnova;
SHOW TABLES;
```

---

#### ❌ **ERROR 4: Table Not Found**

```
Table 'neuralnova.posts' doesn't exist
```

**Cause**: SQL migrations not run

**Fix**: Run SQL files in order
```sql
-- In phpMyAdmin or MySQL CLI:

-- 1. Users table
SOURCE backend/sql/001_users_table.sql;

-- 2. User profile extension
SOURCE backend/sql/002_users_profile_extension.sql;

-- 3. Posts table
SOURCE backend/sql/003_posts_table.sql;

-- 4. Reactions table
SOURCE backend/sql/004_reactions_table.sql;

-- 5. Comments table
SOURCE backend/sql/005_comments_table.sql;

-- 6. Activities table
SOURCE backend/sql/006_activities_table.sql;
```

Verify:
```sql
SHOW TABLES;
DESCRIBE posts;
```

---

#### ❌ **ERROR 5: Missing Column**

```
Unknown column 'image_url' in 'field list'
```

**Cause**: Table structure outdated

**Fix**: Check table schema
```sql
DESCRIBE posts;
```

Should have:
- `id`
- `user_id`
- `content`
- `image_url`  ← Must exist
- `visibility`
- `created_at`
- `updated_at`

If missing, re-run migration:
```sql
DROP TABLE posts;
SOURCE backend/sql/003_posts_table.sql;
```

---

#### ❌ **ERROR 6: CORS Policy**

```
Access to fetch at 'https://neuralnova.space/backend/api/posts/feed.php' 
from origin 'https://neuralnova.space' has been blocked by CORS policy
```

**Cause**: CORS headers missing or incorrect

**Fix**: Check API file has CORS headers
```php
<?php
// MUST be at the very top, before any output
header('Content-Type: application/json');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://neuralnova.space',
    'http://neuralnova.space'
];

foreach ($allowedOrigins as $allowed) {
    if (strpos($origin, $allowed) === 0) {
        header("Access-Control-Allow-Origin: $origin");
        break;
    }
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
```

---

#### ❌ **ERROR 7: Session Issues**

```
Warning: session_start(): Cannot send session cookie - 
headers already sent
```

**Cause**: Output before headers (spaces, BOM, echo)

**Fix**:
1. Ensure no spaces/newlines before `<?php`
2. No `echo` or `print` before headers
3. Save file as UTF-8 **without BOM**
4. Call `session_start()` only once

---

#### ❌ **ERROR 8: PHP Version**

```
Parse error: syntax error, unexpected '?', expecting variable
```

**Cause**: Using PHP 8.0+ syntax on older PHP

**Fix**: Check PHP version
```bash
php -v
```

Should be >= 7.4. If not:
```bash
# Update PHP (Ubuntu/Debian)
sudo apt update
sudo apt install php8.0

# Restart Apache
sudo service apache2 restart
```

---

### **STEP 4: Check PHP Error Logs**

**XAMPP (Windows)**:
```
C:\xampp\apache\logs\error.log
C:\xampp\php\logs\php_error_log
```

**Linux VPS**:
```bash
tail -f /var/log/apache2/error.log
tail -f /var/log/php/error.log
```

**Enable PHP Error Display** (development only):
```php
// Add to top of API file temporarily
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

---

### **STEP 5: Test API File Directly**

Create test file: `backend/test/test-feed.php`

```php
<?php
// Simple test without framework
header('Content-Type: application/json');

echo json_encode([
    'success' => true,
    'message' => 'API is working!',
    'php_version' => phpversion(),
    'timestamp' => date('Y-m-d H:i:s')
]);
```

Access: `https://neuralnova.space/backend/test/test-feed.php`

If this works → Problem is in your actual feed.php file

---

### **STEP 6: Minimal Working Example**

Replace `feed.php` content temporarily with this:

```php
<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

try {
    // Test 1: PHP works
    echo json_encode([
        'success' => true,
        'message' => 'Basic PHP works',
        'posts' => [],
        'total' => 0
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
```

If this works → Problem is in includes/database/session code

---

## 🔧 **QUICK FIX CHECKLIST**

- [ ] Hard refresh browser (`Ctrl + F5`)
- [ ] Check Console for full error message
- [ ] Test API URL directly in browser
- [ ] Verify all SQL tables exist
- [ ] Check database credentials
- [ ] Verify `initSession()` is defined
- [ ] Check all `require_once` paths
- [ ] Review PHP error logs
- [ ] Test with minimal code first
- [ ] Enable error display temporarily

---

## 📞 **NEXT STEPS**

1. **Hard refresh** dashboard
2. **Copy full error** from Console (between the ━ lines)
3. **Paste error here** so I can see exact issue
4. I'll provide **specific fix** for your error

---

**Common Pattern**:
- Most errors = Missing `require_once` or wrong path
- Quick test = Open API URL directly, see HTML error
- Fix = Add correct includes, check database

**Let's debug together!** 🔍
