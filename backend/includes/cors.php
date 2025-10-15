<?php
/**
 * CORS Configuration Helper
 * Handles Cross-Origin Resource Sharing for cookie-based authentication
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
 * Set CORS headers for cookie-based authentication
 * 
 * IMPORTANT: When using credentials (cookies), you CANNOT use wildcard (*) for origin
 * Browser security blocks cookies when Origin: * and Credentials: true
 * 
 * @param array $methods Allowed HTTP methods
 */
function setCorsHeaders($methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
    // List of allowed origins
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'https://neuralnova.space',
        'http://neuralnova.space'
    ];
    
    // Get request origin
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Check if origin is allowed
    $originAllowed = false;
    foreach ($allowedOrigins as $allowed) {
        if (strpos($origin, $allowed) === 0) {
            header("Access-Control-Allow-Origin: $origin");
            $originAllowed = true;
            break;
        }
    }
    
    // If no match and in development, allow current origin
    if (!$originAllowed && $origin) {
        // Development mode: allow any localhost/127.0.0.1
        if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/', $origin)) {
            header("Access-Control-Allow-Origin: $origin");
        }
    }
    
    // Set other CORS headers
    header('Access-Control-Allow-Methods: ' . implode(', ', $methods));
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
}

/**
 * Handle OPTIONS preflight request
 */
function handlePreflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

