<?php
/**
 * API Response Helper
 * Standardized JSON responses
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
 * Send JSON response
 * 
 * @param bool $success Success status
 * @param string $message Response message
 * @param mixed $data Response data
 * @param array $errors Validation errors
 * @param int $httpCode HTTP status code
 */
function sendResponse($success, $message, $data = null, $errors = [], $httpCode = 200) {
    http_response_code($httpCode);
    
    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send success response
 */
function sendSuccess($message, $data = null, $httpCode = 200) {
    sendResponse(true, $message, $data, [], $httpCode);
}

/**
 * Send error response
 */
function sendError($message, $errors = [], $httpCode = 400) {
    sendResponse(false, $message, null, $errors, $httpCode);
}

/**
 * Send validation error response
 */
function sendValidationError($errors) {
    sendError('Validation failed', $errors, 422);
}

/**
 * Send unauthorized response
 */
function sendUnauthorized($message = 'Unauthorized') {
    sendError($message, [], 401);
}

/**
 * Send forbidden response
 */
function sendForbidden($message = 'Forbidden') {
    sendError($message, [], 403);
}

/**
 * Send not found response
 */
function sendNotFound($message = 'Resource not found') {
    sendError($message, [], 404);
}

/**
 * Send server error response
 */
function sendServerError($message = 'Internal server error') {
    sendError($message, [], 500);
}

