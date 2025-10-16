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

// CORS: Dynamic origin for credentials support
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://neuralnova.space',
    'http://neuralnova.space'
];

// Check if origin matches allowed list (including ports)
$originAllowed = false;
foreach ($allowedOrigins as $allowed) {
    if ($origin === $allowed || strpos($origin, $allowed . ':') === 0) {
        header("Access-Control-Allow-Origin: $origin");
        $originAllowed = true;
        break;
    }
}

// Fallback for development - allow any localhost/127.0.0.1 with any port
if (!$originAllowed && $origin) {
    if (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

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
        // Return not authenticated (NOT an error - just not logged in)
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'message' => 'Not authenticated',
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // Check session timeout
    if (!checkSessionTimeout()) {
        // Session expired - return not authenticated
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'authenticated' => false,
            'message' => 'Session expired',
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // Get current user data
    $user = getCurrentUser();
    
    // Success response - user is authenticated
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'message' => 'User is authenticated',
        'user' => $user,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
    
} catch (Exception $e) {
    error_log("Check Session Error: " . $e->getMessage());
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'authenticated' => false,
        'message' => 'Session check failed',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

