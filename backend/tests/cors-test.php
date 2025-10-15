<?php
/**
 * CORS Test - Check if CORS headers are working
 */

// CORS Headers - Allow ALL for testing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle OPTIONS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'CORS is working! ✅',
    'timestamp' => date('Y-m-d H:i:s'),
    'request_info' => [
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'Unknown',
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'No origin header',
        'referer' => $_SERVER['HTTP_REFERER'] ?? 'No referer',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

