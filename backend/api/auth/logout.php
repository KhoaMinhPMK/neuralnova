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

// CORS: Get origin from request for credentials support
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://neuralnova.space',
    'http://neuralnova.space'
];

// Check if origin is allowed
foreach ($allowedOrigins as $allowed) {
    if (strpos($origin, $allowed) === 0) {
        header("Access-Control-Allow-Origin: $origin");
        break;
    }
}

// If no match, allow current origin for development
if (!headers_sent() && !isset($origin)) {
    header("Access-Control-Allow-Origin: " . ($_SERVER['HTTP_ORIGIN'] ?? 'http://localhost'));
}

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

