# 🧪 Backend Testing & Debugging Tools

This folder contains all test and debug utilities for the NeuralNova backend API.

---

## 📁 Files

### 1. `test-connection.php`
**Purpose:** Simple connection test to verify backend is accessible

**URL (Local):**
```
http://localhost/neuralnova/backend/tests/test-connection.php
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Backend is working! ✅",
  "server_info": {...}
}
```

---

### 2. `debug.php`
**Purpose:** Comprehensive diagnostic tool that checks:
- PHP version & extensions
- Database connection
- Database & table existence
- User count
- Session configuration
- Write permissions

**URL (Local):**
```
http://localhost/neuralnova/backend/tests/debug.php
```

**Use When:**
- Database connection issues
- API not working
- Setup verification
- Troubleshooting

---

### 3. `test-api.html`
**Purpose:** Interactive API testing interface with UI

**URL (Local):**
```
http://localhost/neuralnova/backend/tests/test-api.html
```

**Features:**
- Test registration
- Test login
- Test logout
- Test check-session
- View JSON responses
- Beautiful UI

---

## 🚀 Quick Start Testing

### Step 1: Test Backend Connection
```
http://localhost/neuralnova/backend/tests/test-connection.php
```
✅ Should show: "Backend is working!"

### Step 2: Run Diagnostics
```
http://localhost/neuralnova/backend/tests/debug.php
```
✅ Check all statuses are "OK"

### Step 3: Test API Endpoints
```
http://localhost/neuralnova/backend/tests/test-api.html
```
✅ Try register & login

---

## 📝 Production Notes

⚠️ **IMPORTANT:** These test files should **NOT** be deployed to production!

Add to `.gitignore`:
```
backend/tests/
```

Or delete before pushing to VPS:
```bash
rm -rf backend/tests/
```

---

**Last Updated:** October 15, 2025
