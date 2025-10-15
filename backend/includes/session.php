<?php
/**
 * Session Management
 * 
 * @version 1.0.0
 * @date 2025-10-15
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access not permitted');
}

/**
 * Initialize secure session
 */
function initSession() {
    if (session_status() === PHP_SESSION_NONE) {
        // Secure session configuration
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); // Set to 1 if using HTTPS
        ini_set('session.cookie_samesite', 'Lax');
        
        session_name('NEURALNOVA_SESSION');
        session_start();
        
        // Regenerate session ID for security
        if (!isset($_SESSION['initiated'])) {
            session_regenerate_id(true);
            $_SESSION['initiated'] = true;
        }
    }
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}

/**
 * Get current user data
 */
function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'] ?? null,
        'email' => $_SESSION['user_email'] ?? null,
        'full_name' => $_SESSION['user_name'] ?? null,
        'status' => $_SESSION['user_status'] ?? null
    ];
}

/**
 * Set user session data
 */
function setUserSession($userId, $email, $fullName, $status = 'active') {
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_status'] = $status;
    $_SESSION['login_time'] = time();
    
    // Regenerate session ID after login for security
    session_regenerate_id(true);
}

/**
 * Destroy user session (logout)
 */
function destroyUserSession() {
    $_SESSION = [];
    
    if (isset($_COOKIE[session_name()])) {
        setcookie(session_name(), '', time() - 3600, '/');
    }
    
    session_destroy();
}

/**
 * Check session timeout (optional)
 * Default: 24 hours
 */
function checkSessionTimeout($maxLifetime = 86400) {
    if (isset($_SESSION['login_time'])) {
        $elapsed = time() - $_SESSION['login_time'];
        
        if ($elapsed > $maxLifetime) {
            destroyUserSession();
            return false;
        }
    }
    
    return true;
}

/**
 * Require authentication
 */
function requireAuth() {
    if (!isLoggedIn()) {
        sendUnauthorized('Authentication required');
    }
    
    if (!checkSessionTimeout()) {
        sendUnauthorized('Session expired');
    }
}

