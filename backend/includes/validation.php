<?php
/**
 * Input Validation & Sanitization
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
 * Validate email
 */
function validateEmail($email) {
    $email = filter_var($email, FILTER_SANITIZE_EMAIL);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    return $email;
}

/**
 * Validate password strength
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 */
function validatePassword($password) {
    if (strlen($password) < 8) {
        return ['valid' => false, 'message' => 'Password must be at least 8 characters'];
    }
    
    if (!preg_match('/[A-Z]/', $password)) {
        return ['valid' => false, 'message' => 'Password must contain at least one uppercase letter'];
    }
    
    if (!preg_match('/[a-z]/', $password)) {
        return ['valid' => false, 'message' => 'Password must contain at least one lowercase letter'];
    }
    
    if (!preg_match('/[0-9]/', $password)) {
        return ['valid' => false, 'message' => 'Password must contain at least one number'];
    }
    
    return ['valid' => true, 'message' => 'Password is valid'];
}

/**
 * Validate full name
 */
function validateFullName($name) {
    $name = trim($name);
    if (strlen($name) < 2) {
        return ['valid' => false, 'message' => 'Full name must be at least 2 characters'];
    }
    
    if (strlen($name) > 100) {
        return ['valid' => false, 'message' => 'Full name must not exceed 100 characters'];
    }
    
    // Remove special characters except spaces, hyphens, apostrophes
    $name = preg_replace("/[^a-zA-Z0-9\s\-\']/u", "", $name);
    
    return ['valid' => true, 'message' => 'Full name is valid', 'value' => $name];
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    return $input;
}

/**
 * Check if email exists in database
 */
function emailExists($email, $pdo) {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    return $stmt->fetch() !== false;
}

/**
 * Validate registration data
 */
function validateRegistrationData($fullName, $email, $password) {
    $errors = [];
    
    // Validate full name
    $nameValidation = validateFullName($fullName);
    if (!$nameValidation['valid']) {
        $errors['full_name'] = $nameValidation['message'];
    }
    
    // Validate email
    $validEmail = validateEmail($email);
    if (!$validEmail) {
        $errors['email'] = 'Invalid email format';
    }
    
    // Validate password
    $passwordValidation = validatePassword($password);
    if (!$passwordValidation['valid']) {
        $errors['password'] = $passwordValidation['message'];
    }
    
    return [
        'valid' => empty($errors),
        'errors' => $errors,
        'data' => [
            'full_name' => $nameValidation['value'] ?? $fullName,
            'email' => $validEmail ?: $email
        ]
    ];
}

/**
 * Generate secure random token
 */
function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

