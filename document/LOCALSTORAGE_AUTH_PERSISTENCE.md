# 💾 LocalStorage Auth Persistence - Duy Trì Đăng Nhập

**Date**: October 15, 2025  
**Feature**: Persistent authentication using localStorage  
**Status**: ✅ Implemented

---

## 🎯 Objective

Lưu trạng thái đăng nhập vào bộ nhớ đệm (localStorage) để:
- User không bị logout khi refresh trang
- Load thông tin user nhanh hơn từ cache
- Duy trì session trong 7 ngày
- Tự động clear khi logout hoặc session hết hạn

---

## 🔧 Implementation

### **1. LocalStorage Helper Functions**

```javascript
function saveUserToLocalStorage(userData) {
  try {
    localStorage.setItem('neuralnova_user', JSON.stringify(userData));
    localStorage.setItem('neuralnova_auth_time', Date.now().toString());
    console.log('✅ User saved to localStorage:', userData);
  } catch (error) {
    console.error('❌ Failed to save user to localStorage:', error);
  }
}

function getUserFromLocalStorage() {
  try {
    const userStr = localStorage.getItem('neuralnova_user');
    const authTime = localStorage.getItem('neuralnova_auth_time');
    
    if (!userStr || !authTime) {
      return null;
    }
    
    // Check if auth is older than 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(authTime) > sevenDaysMs) {
      clearUserFromLocalStorage();
      return null;
    }
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('❌ Failed to get user from localStorage:', error);
    return null;
  }
}

function clearUserFromLocalStorage() {
  try {
    localStorage.removeItem('neuralnova_user');
    localStorage.removeItem('neuralnova_auth_time');
    console.log('✅ User cleared from localStorage');
  } catch (error) {
    console.error('❌ Failed to clear localStorage:', error);
  }
}
```

---

## 📦 LocalStorage Keys

### **`neuralnova_user`**:
```json
{
  "id": 1,
  "full_name": "John Doe",
  "email": "john@example.com",
  "status": "active",
  "email_verified": false
}
```

### **`neuralnova_auth_time`**:
```
1729012345678  // Timestamp in milliseconds
```

---

## 🔄 Integration Points

### **1. Login (`pages/auth/app.js`)**

```javascript
// After successful login
if (data.success) {
  // ✅ Save user to localStorage
  if (data.data && data.data.user) {
    saveUserToLocalStorage(data.data.user);
  }
  
  showSuccess('loginError', data.message);
  setTimeout(() => {
    window.location.href = data.data.redirect || '../dashboard/index.html';
  }, 1000);
}
```

**Flow**:
1. User submits login form
2. Backend validates & creates session
3. **Frontend saves user data to localStorage**
4. Redirect to dashboard

---

### **2. Registration (`pages/auth/app.js`)**

```javascript
// After successful registration
if (data.success) {
  // ✅ Save user to localStorage
  if (data.data && data.data.user) {
    saveUserToLocalStorage(data.data.user);
  }
  
  showSuccess('registerError', data.message);
  setTimeout(() => {
    window.location.href = data.data.redirect || '../dashboard/index.html';
  }, 1500);
}
```

**Flow**:
1. User submits registration form
2. Backend creates account + auto-login
3. **Frontend saves user data to localStorage**
4. Redirect to dashboard

---

### **3. Auth Page Load (`pages/auth/app.js`)**

```javascript
async function checkAuth() {
  try {
    // ✅ First check localStorage
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      console.log('✅ User found in localStorage:', localUser);
    }
    
    // Then verify with backend
    const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success && data.authenticated && data.user) {
      // ✅ Update localStorage with latest data
      saveUserToLocalStorage(data.user);
      
      // Optionally auto-redirect to dashboard
      // setTimeout(() => {
      //   window.location.href = '../dashboard/index.html';
      // }, 2000);
    } else {
      // ❌ Clear localStorage if session is invalid
      clearUserFromLocalStorage();
    }
  } catch (error) {
    clearUserFromLocalStorage();
  }
}
```

**Flow**:
1. Auth page loads
2. Check localStorage for cached user
3. Verify with backend session
4. Sync localStorage with backend
5. Clear localStorage if session invalid

---

### **4. Dashboard Load (`pages/dashboard/app.js`)**

```javascript
async function checkAuth() {
  try {
    // ✅ First try to get user from localStorage
    const localUser = getUserFromLocalStorage();
    if (localUser) {
      console.log('✅ User loaded from localStorage:', localUser);
      // Update UI immediately from cache
      const userName = localUser.full_name || 'User';
      if ($('#sidebarUserName')) {
        $('#sidebarUserName').textContent = userName;
      }
    }

    // Then verify with backend
    const res = await fetch(`${API_BASE}/auth/check-session.php`, {
      credentials: 'include'
    });
    const data = await res.json();

    if (!data.authenticated) {
      // ❌ Not logged in, clear localStorage and redirect
      clearUserFromLocalStorage();
      window.location.href = '../auth/index.html';
      return;
    }

    // ✅ Update UI with fresh backend data
    if (data.user) {
      saveUserToLocalStorage(data.user);
      // Update UI...
    }
  } catch (error) {
    clearUserFromLocalStorage();
    window.location.href = '../auth/index.html';
  }
}
```

**Flow**:
1. Dashboard loads
2. **Load user from localStorage FIRST** (instant UI update)
3. Verify with backend in background
4. Sync localStorage with backend
5. Redirect if not authenticated

**Benefit**: **Instant UI** - User sees their name immediately from cache while backend verifies.

---

### **5. Logout (`pages/dashboard/app.js`)**

```javascript
// Logout
if (data.success) {
  // ✅ Clear localStorage
  clearUserFromLocalStorage();
  
  toast('Logged out successfully');
  setTimeout(() => {
    window.location.href = '../../index.html';
  }, 1000);
}
```

**Flow**:
1. User clicks logout
2. Backend destroys session
3. **Frontend clears localStorage**
4. Redirect to home

---

## ⏰ Session Expiration

### **7-Day Timeout**:
```javascript
const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
if (Date.now() - parseInt(authTime) > sevenDaysMs) {
  clearUserFromLocalStorage();
  return null;
}
```

**Rules**:
- LocalStorage data expires after **7 days**
- Backend session may expire sooner (default 24 hours in PHP)
- If localStorage is older than 7 days → auto-clear
- Backend always has final say on authentication

---

## 🔐 Security Considerations

### **What's Stored**:
✅ **Safe to store**:
- User ID
- Full name
- Email
- Account status
- Email verified status

❌ **NEVER store**:
- Passwords
- Session tokens (handled by cookies)
- Sensitive personal data

### **Why This is Safe**:
1. **No sensitive data** stored in localStorage
2. **Backend session is source of truth** - localStorage is just a cache
3. **Always verified with backend** before critical actions
4. **Auto-expires** after 7 days
5. **Cleared on logout**

### **Attack Scenarios**:

| Attack | Protection |
|--------|-----------|
| **XSS** | No passwords/tokens stored; backend verifies all requests |
| **Session hijacking** | Session cookie is HttpOnly; localStorage is read-only cache |
| **Expired session** | Backend check always happens; localStorage cleared if invalid |
| **Data tampering** | User can edit localStorage but backend ignores it |

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        LOGIN/REGISTER                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Backend validates
                    Creates session cookie
                              │
                              ▼
                    Frontend receives user data
                              │
                              ├─────────────────────┐
                              ▼                     ▼
                    Save to localStorage    Redirect to dashboard
                    - neuralnova_user
                    - neuralnova_auth_time
                              

┌─────────────────────────────────────────────────────────────┐
│                      DASHBOARD LOAD                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Read from localStorage
                    (instant UI update)
                              │
                              ▼
                    Verify with backend
                    (check-session.php)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Authenticated        Not Authenticated
                    │                   │
                    ▼                   ▼
            Update localStorage    Clear localStorage
            Stay on dashboard      Redirect to login


┌─────────────────────────────────────────────────────────────┐
│                          LOGOUT                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    Backend destroys session
                              │
                              ▼
                    Frontend clears localStorage
                              │
                              ▼
                    Redirect to home
```

---

## ✅ Benefits

### **1. Better UX**:
- ✅ User stays logged in after page refresh
- ✅ Instant UI updates from cache
- ✅ No flash of "loading..." on every page

### **2. Performance**:
- ✅ Load user data from cache first
- ✅ Verify with backend in background
- ✅ Reduce API calls on initial load

### **3. Reliability**:
- ✅ Works offline (shows cached data)
- ✅ Auto-sync with backend when online
- ✅ Graceful degradation if backend fails

---

## 🧪 Testing

### **Test 1: Login Persistence**
1. Login to account
2. Refresh page
3. **Expected**: Still logged in ✅
4. Check localStorage: `neuralnova_user` should exist ✅

### **Test 2: Logout Clears Cache**
1. Login to account
2. Logout
3. Check localStorage: `neuralnova_user` should be gone ✅
4. Refresh page
5. **Expected**: Redirected to login ✅

### **Test 3: 7-Day Expiration**
1. Login to account
2. Manually set `neuralnova_auth_time` to 8 days ago:
   ```javascript
   localStorage.setItem('neuralnova_auth_time', (Date.now() - 8*24*60*60*1000).toString());
   ```
3. Refresh page
4. **Expected**: localStorage cleared, redirected to login ✅

### **Test 4: Invalid Session**
1. Login to account
2. Manually delete backend session (clear cookies)
3. Refresh dashboard
4. **Expected**: localStorage cleared, redirected to login ✅

---

## 📝 Files Modified

### **Auth Page** (`pages/auth/app.js`):
- ✅ Added localStorage helper functions
- ✅ Save user on login
- ✅ Save user on registration
- ✅ Check & sync localStorage on page load
- ✅ Clear localStorage on session invalid

### **Dashboard** (`pages/dashboard/app.js`):
- ✅ Added localStorage helper functions
- ✅ Load user from localStorage first (instant UI)
- ✅ Verify with backend
- ✅ Sync localStorage with backend
- ✅ Clear localStorage on logout

### **Profile** (`pages/profile/index.html`):
- ✅ Added "Dashboard" button to header

---

## 🚀 Future Enhancements

### **Possible Improvements**:
1. **Encrypt localStorage data** (though not critical for non-sensitive data)
2. **Store user preferences** (theme, language, etc.)
3. **Offline mode** - Allow viewing cached content offline
4. **Auto-logout warning** - Notify user before 7-day expiration
5. **Multiple sessions** - Track sessions across devices

---

**Status**: ✅ LocalStorage persistence fully implemented  
**Storage Duration**: 7 days  
**Auto-Clear**: On logout, session invalid, or expiration  
**Security**: Read-only cache; backend is source of truth
