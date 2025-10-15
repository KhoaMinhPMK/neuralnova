# 🔍 Create Post Debug Guide

**Issue**: Post created but content is NULL  
**Date**: October 16, 2025

---

## ❌ **CURRENT PROBLEM**

Post được tạo thành công nhưng:
```json
{
  "content": null,      // ❌ Should have caption
  "image_url": null     // ❌ Should have media_url if provided
}
```

---

## 🧪 **DEBUG STEPS**

### **Step 1: Check Browser Console**

Hard refresh (`Ctrl + F5`) để load app.js v2.3, sau đó:

1. Click "What's on your mind?"
2. Type: `Test post content`
3. Image URL: `https://example.com/image.jpg`
4. Click "Post"

**Expected Console Output**:
```
📝 Creating post: {content: "Test post content", imageUrl: "https://example.com/image.jpg"}
📤 Sending FormData to: https://neuralnova.space/backend/api/posts/create.php
📡 Response status: 200
📡 Response headers: application/json
📦 Response data: {...}
```

---

### **Step 2: Check PHP Error Log**

**XAMPP (Windows)**:
```
C:\xampp\apache\logs\error.log
```

Look for:
```
POST data: Array
(
    [caption] => Test post content
    [media_url] => https://example.com/image.jpg
    [is_public] => 1
)
```

If `[caption]` is **empty** or **missing** → FormData not sent correctly

---

### **Step 3: Network Tab**

Open `F12` → Network tab:

1. Create post
2. Find request to `create.php`
3. Check **Request Payload**:

**Should see**:
```
------WebKitFormBoundary...
Content-Disposition: form-data; name="caption"

Test post content
------WebKitFormBoundary...
Content-Disposition: form-data; name="media_url"

https://example.com/image.jpg
------WebKitFormBoundary...
Content-Disposition: form-data; name="is_public"

1
```

If payload is **empty** → Frontend not sending data

---

## 🔧 **POSSIBLE FIXES**

### **Fix 1: FormData Not Sending**

If Network tab shows empty payload, issue is frontend.

**Check**:
```javascript
const formData = new FormData();
formData.append('caption', content);  // content must not be empty
```

**Solution**: Ensure `content` variable has value before sending

---

### **Fix 2: Backend Not Reading POST**

If Network tab shows data but backend gets NULL:

**Possible causes**:
- Content-Type header interfering
- ModSecurity blocking
- PHP not parsing multipart/form-data

**Solution**: Check `$_POST` is populated in backend

---

### **Fix 3: Column Name Mismatch**

If data arrives but not saved:

**Check INSERT**:
```sql
INSERT INTO posts (caption, ...)
VALUES (?, ...)
```

And bind:
```php
$stmt->execute([$caption, ...]);
```

Ensure `$caption` variable is in correct position

---

## 📝 **EXPECTED FLOW**

```
Frontend
    ↓
FormData {
  caption: "Test",
  media_url: "url",
  is_public: "1"
}
    ↓
POST to /api/posts/create.php
    ↓
Backend receives $_POST['caption']
    ↓
INSERT INTO posts (caption, media_url, is_public)
    ↓
SELECT caption AS content
    ↓
Response: {content: "Test", image_url: "url"}
```

---

## 🎯 **QUICK TEST**

Test backend directly with curl:

```bash
curl -X POST https://neuralnova.space/backend/api/posts/create.php \
  -H "Cookie: PHPSESSID=your_session_id" \
  -F "caption=Test from curl" \
  -F "media_url=https://example.com/test.jpg" \
  -F "is_public=1"
```

**Expected**:
```json
{
  "success": true,
  "post": {
    "content": "Test from curl",
    "image_url": "https://example.com/test.jpg"
  }
}
```

If this works → Frontend issue  
If this fails → Backend issue

---

**Next**: Hard refresh and paste Console output + Network payload
