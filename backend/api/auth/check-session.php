<?php
/**
 * Check User Session API
 * GET /backend/api/auth/check-session.php
 * 
 * Returns current logged-in user info
 * 
 * @version 1.0.0
 * @date 2025-10-15
 */

// Define API access
define('API_ACCESS', true);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Change to your domain in production
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Load dependencies
require_once '../../includes/response.php';
require_once '../../includes/session.php';

try {
    // Initialize session
    initSession();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        sendError('Not authenticated', ['auth' => 'User is not logged in'], 401);
    }
    
    // Check session timeout
    if (!checkSessionTimeout()) {
        sendError('Session expired', ['auth' => 'Please login again'], 401);
    }
    
    // Get current user data
    $user = getCurrentUser();
    
    // Success response
    sendSuccess('User is authenticated', [
        'user' => $user,
        'authenticated' => true
    ], 200);
    
} catch (Exception $e) {
    error_log("Check Session Error: " . $e->getMessage());
    sendServerError('Failed to check session');
}

