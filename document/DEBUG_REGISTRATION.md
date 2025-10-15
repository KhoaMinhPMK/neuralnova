---
noteId: "fc26bf40a9c311f0aa12ab3fbbc998b5"
tags: []

---

# 🐛 Debug Registration Issue

## ❌ Problem:
Test API works, but registration from web doesn't save to database.

---

## 🔍 Debug Steps:

### **Step 1: Open Browser Console**

1. Mở trang: `https://neuralnova.space/pages/auth/index.html`
2. Nhấn **F12** (hoặc Right-click → Inspect)
3. Vào tab **Console**
4. Giữ Console mở

---

### **Step 2: Open Network Tab**

1. Trong DevTools, chuyển sang tab **Network**
2. Check ☑️ "Preserve log"
3. Clear history (icon 🚫)

---

### **Step 3: Try to Register**

1. Click "Sign up"
2. Nhập thông tin:
   - Full Name: `Debug Test`
   - Email: `debug@test.com`
   - Password: `Test@123`
   - Check ✅ Terms
3. Click "Sign Up"

---

### **Step 4: Check Console Tab**

Look for **RED errors**:

#### ❌ **If you see CORS error:**
```
Access to fetch at 'https://neuralnova.space/backend/api/auth/register.php' 
from origin 'https://neuralnova.space' has been blocked by CORS policy
```

**Solution:** Update `backend/.htaccess` CORS headers

---

#### ❌ **If you see 404 error:**
```
GET https://neuralnova.space/backend/api/auth/register.php 404 (Not Found)
```

**Solution:** Backend files not on VPS or wrong path

---

#### ❌ **If you see 500 error:**
```
POST https://neuralnova.space/backend/api/auth/register.php 500 (Internal Server Error)
```

**Solution:** PHP/Database error on backend

---

### **Step 5: Check Network Tab**

1. Find request: `register.php`
2. Click on it
3. Check tabs:

**Headers tab:**
- Request URL: Should be `https://neuralnova.space/backend/api/auth/register.php`
- Request Method: POST
- Status Code: Should be 200 (OK)

**Payload tab:**
- Should show:
  ```json
  {
    "full_name": "Debug Test",
    "email": "debug@test.com",
    "password": "Test@123",
    "terms_accepted": true
  }
  ```

**Response tab:**
- Should show JSON:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "data": {...}
  }
  ```

**If Response shows error:**
- Copy the entire JSON response
- Send it to me

---

## 🎯 Common Issues & Solutions:

### **Issue 1: Mixed Content (HTTP/HTTPS)**

**Error:**
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure resource 'http://...'
```

**Solution:**
All files must use HTTPS (already done ✅)

---

### **Issue 2: CORS Not Configured**

**Error:**
```
No 'Access-Control-Allow-Origin' header is present
```

**Solution:**
Check `backend/.htaccess` has:
```apache
Header set Access-Control-Allow-Origin "https://neuralnova.space"
Header set Access-Control-Allow-Credentials "true"
```

---

### **Issue 3: Session Cookies Blocked**

**Error:**
```
This Set-Cookie was blocked because it had the "Secure" 
attribute but was not received over a secure connection
```

**Solution:**
Backend session config needs HTTPS enabled

---

### **Issue 4: Database Not Connected**

**Response:**
```json
{
  "success": false,
  "message": "Database connection failed"
}
```

**Solution:**
Check `backend/config/database.php` credentials on VPS

---

## 📸 What to Send Me:

### 1. Console Tab Screenshot
- Show any RED errors

### 2. Network Tab Info
- Request URL
- Status Code
- Response JSON

### 3. Copy & Paste:
```
Console Errors: [paste here]

Network Request:
- URL: [paste]
- Method: [GET/POST]
- Status: [200/404/500]

Response:
[paste JSON]
```

---

## 🧪 Quick Test:

### **Test API directly via Browser:**

Open this URL in browser:
```
https://neuralnova.space/backend/tests/debug.php
```

**Should show:**
```json
{
  "summary": {
    "overall_status": "ALL CHECKS PASSED"
  }
}
```

❌ **If NOT passed:** Backend has issues

---

### **Test registration API directly:**

Open browser Console (F12) → Paste this code:

```javascript
fetch('https://neuralnova.space/backend/api/auth/register.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include',
  body: JSON.stringify({
    full_name: 'Console Test',
    email: 'consoletest@test.com',
    password: 'Test@123',
    terms_accepted: true
  })
})
.then(res => res.json())
.then(data => console.log('✅ Response:', data))
.catch(err => console.error('❌ Error:', err));
```

**Check Console output:**
- ✅ If success → Frontend có vấn đề
- ❌ If error → Backend có vấn đề

---

## 🔧 Auto-Fix Script:

Add this to `pages/auth/app.js` (for debugging):

```javascript
// Add after registerForm.addEventListener('submit', ...)

// Log all details
console.log('🔍 DEBUG INFO:');
console.log('API URL:', API_BASE_URL);
console.log('Form data:', {
  full_name: fullName,
  email: email,
  password: '[hidden]',
  terms_accepted: termsAccepted
});

// Log response
const response = await fetch(...);
console.log('📡 Response Status:', response.status);
console.log('📡 Response OK:', response.ok);

const data = await response.json();
console.log('📦 Response Data:', data);
```

---

**Làm các bước trên và gửi kết quả cho tôi!** 🚀

Đặc biệt quan trọng:
1. ✅ Screenshot Console tab (F12)
2. ✅ Copy Response JSON từ Network tab
3. ✅ Test API trực tiếp bằng Console code
