# 🚀 NeuralNova Backend API

**RESTful API for NeuralNova SaaS Platform**

---

## 📁 Cấu trúc Backend

```
backend/
├── config/
│   └── database.php              # Database configuration
│
├── sql/
│   ├── 001_users_table.sql       # Users table schema
│   └── README.md                 # SQL import instructions
│
├── api/
│   └── auth/
│       ├── register.php          # User registration
│       ├── login.php             # User login
│       ├── logout.php            # User logout
│       └── check-session.php    # Check authentication
│
├── includes/
│   ├── response.php              # API response helpers
│   ├── validation.php            # Input validation
│   └── session.php               # Session management
│
├── tests/                        # 🧪 Testing & debugging tools
│   ├── test-connection.php       # Simple connection test
│   ├── debug.php                 # Comprehensive diagnostics
│   ├── test-api.html             # Interactive API tester
│   └── README.md                 # Testing guide
│
├── .htaccess                     # Apache configuration
└── README.md                     # This file
```

---

## 🛠️ Setup Instructions

### 1. Database Setup

```bash
# Mở phpMyAdmin
# Import file: backend/sql/001_users_table.sql
```

Hoặc dùng MySQL CLI:
```bash
mysql -u root -p < backend/sql/001_users_table.sql
```

### 2. Configure Database Connection

Chỉnh sửa `backend/config/database.php`:

```php
define('DB_HOST', 'localhost');        # VPS database host
define('DB_NAME', 'neuralnova');       # Database name
define('DB_USER', 'root');             # Database username
define('DB_PASS', 'your_password');    # Database password
```

### 3. Test API

**Option 1: Interactive Web Interface (Recommended)**
```
http://localhost/neuralnova/backend/tests/test-api.html
```

**Option 2: Diagnostics Tool**
```
http://localhost/neuralnova/backend/tests/debug.php
```

**Option 3: cURL Commands**
```bash
# Test health check
curl http://localhost/neuralnova/backend/api/auth/check-session.php

# Test registration
curl -X POST http://localhost/neuralnova/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"Test@123","terms_accepted":true}'
```

---

## 📡 API Endpoints

### Base URL
```
https://neuralnova.space/backend/api/
```

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register.php`

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "terms_accepted": true
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "email_verified": false
    },
    "redirect": "/web/index.html"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "message": "Email already registered",
  "errors": {
    "email": "This email is already in use"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

---

#### 2. Login User
**POST** `/auth/login.php`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "status": "active",
      "email_verified": false
    },
    "redirect": "/web/index.html"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "password": "Email or password is incorrect"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

---

#### 3. Logout User
**POST** `/auth/logout.php`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "redirect": "/web/pages/auth/index.html"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

---

#### 4. Check Session
**GET** `/auth/check-session.php`

**Success Response (200):**
```json
{
  "success": true,
  "message": "User is authenticated",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "full_name": "John Doe",
      "status": "active"
    },
    "authenticated": true
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Not authenticated",
  "errors": {
    "auth": "User is not logged in"
  },
  "timestamp": "2025-10-15 12:00:00"
}
```

---

## 🔐 Security Features

### ✅ Implemented (Phase 1)

1. **Password Security**
   - BCrypt hashing
   - Minimum 8 characters
   - Requires uppercase, lowercase, number

2. **Input Validation**
   - Email format validation
   - Name sanitization
   - XSS prevention

3. **SQL Injection Protection**
   - PDO prepared statements
   - Parameter binding

4. **Session Security**
   - HTTPOnly cookies
   - Session regeneration
   - 24-hour timeout

5. **CORS Configuration**
   - Configurable origins
   - Credentials support

### 🔜 Future Enhancements (Phase 2)

- [ ] Email verification system
- [ ] Password reset flow
- [ ] Two-factor authentication (2FA)
- [ ] Rate limiting (prevent brute force)
- [ ] IP whitelist/blacklist
- [ ] OAuth integration (Google, Facebook, GitHub)
- [ ] JWT token authentication
- [ ] Audit logging
- [ ] Account lockout after failed attempts

---

## 🧪 Testing

### Test Account
```
Email: test@neuralnova.space
Password: Test@123
```

### Postman Collection
Import `backend/tests/NeuralNova_API.postman_collection.json` (to be created)

### Manual Testing

1. **Test Registration:**
```bash
curl -X POST https://neuralnova.space/backend/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "newuser@test.com",
    "password": "Password123",
    "terms_accepted": true
  }'
```

2. **Test Login:**
```bash
curl -X POST https://neuralnova.space/backend/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@neuralnova.space",
    "password": "Test@123"
  }'
```

3. **Test Check Session:**
```bash
curl -X GET https://neuralnova.space/backend/api/auth/check-session.php \
  --cookie "NEURALNOVA_SESSION=your_session_id"
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (Registration successful) |
| 400 | Bad Request (Invalid input) |
| 401 | Unauthorized (Invalid credentials) |
| 403 | Forbidden (Account banned/inactive) |
| 404 | Not Found |
| 409 | Conflict (Email already exists) |
| 422 | Validation Error |
| 500 | Server Error |

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(64) NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    google_id VARCHAR(100) NULL,
    facebook_id VARCHAR(100) NULL,
    github_id VARCHAR(100) NULL,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"
**Solution:** Check `backend/config/database.php` credentials

### Issue: "CORS error"
**Solution:** Update `.htaccess` with your domain:
```apache
Header set Access-Control-Allow-Origin "https://neuralnova.space"
```

### Issue: "Session not working"
**Solution:** 
1. Check PHP session configuration
2. Ensure cookies are enabled
3. Set `session.cookie_secure` to 1 if using HTTPS

### Issue: "500 Internal Server Error"
**Solution:** 
1. Check PHP error logs: `/var/log/php_errors.log`
2. Enable error display (development only):
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```

---

## 📝 Development Notes

### Local Development (XAMPP)
```
http://localhost/neuralnova/backend/api/auth/register.php
```

### Production (VPS)
```
https://neuralnova.space/backend/api/auth/register.php
```

### Git Workflow
```bash
# Local machine
git add backend/
git commit -m "feat: add authentication API"
git push origin main

# VPS
cd /var/www/html/neuralnova  # Adjust path
git pull origin main
```

---

## 🛡️ Security Checklist (Production)

- [ ] Change database credentials
- [ ] Enable HTTPS (SSL certificate)
- [ ] Update CORS to specific domain
- [ ] Set `session.cookie_secure` to 1
- [ ] Disable PHP error display
- [ ] Enable error logging
- [ ] Set strong session encryption key
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Backup database regularly

---

## 📞 Support

**Developer:** NeuralNova Team  
**Version:** 1.0.0  
**Last Updated:** October 15, 2025

---

## 📄 License

Proprietary - NeuralNova SaaS Platform
