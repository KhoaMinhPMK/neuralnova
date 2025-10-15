<?php
/**
 * User Logout API
 * POST /backend/api/auth/logout.php
 * 
 * @version 1.0.0
 * @date 2025-10-15
 */

// Define API access
define('API_ACCESS', true);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Change to your domain in production
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
        sendError('Not logged in', [], 400);
    }
    
    // Destroy session
    destroyUserSession();
    
    // Success response
    sendSuccess('Logout successful', [
        'redirect' => '/web/pages/auth/index.html'
    ], 200);
    
} catch (Exception $e) {
    error_log("Logout Error: " . $e->getMessage());
    sendServerError('Logout failed. Please try again.');
}

