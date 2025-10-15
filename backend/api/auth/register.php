<?php
/**
 * User Registration API
 * POST /backend/api/auth/register.php
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
require_once '../../config/database.php';
require_once '../../includes/response.php';
require_once '../../includes/validation.php';
require_once '../../includes/session.php';

try {
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate input exists
    if (!$input) {
        sendError('Invalid JSON data', [], 400);
    }
    
    // Extract data
    $fullName = $input['full_name'] ?? '';
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $termsAccepted = $input['terms_accepted'] ?? false;
    
    // Check required fields
    if (empty($fullName) || empty($email) || empty($password)) {
        sendError('All fields are required', [
            'full_name' => empty($fullName) ? 'Full name is required' : null,
            'email' => empty($email) ? 'Email is required' : null,
            'password' => empty($password) ? 'Password is required' : null
        ], 400);
    }
    
    // Check terms accepted
    if (!$termsAccepted) {
        sendError('You must accept the terms and conditions', ['terms' => 'Terms must be accepted'], 400);
    }
    
    // Validate data
    $validation = validateRegistrationData($fullName, $email, $password);
    
    if (!$validation['valid']) {
        sendValidationError($validation['errors']);
    }
    
    // Use validated data
    $fullName = $validation['data']['full_name'];
    $email = $validation['data']['email'];
    
    // Get database connection
    $pdo = getDBConnection();
    
    // Check if email already exists
    if (emailExists($email, $pdo)) {
        sendError('Email already registered', ['email' => 'This email is already in use'], 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Insert user into database
    $stmt = $pdo->prepare("
        INSERT INTO users (full_name, email, password, status, email_verified, created_at) 
        VALUES (?, ?, ?, 'active', 0, NOW())
    ");
    
    $stmt->execute([$fullName, $email, $hashedPassword]);
    
    // Get inserted user ID
    $userId = $pdo->lastInsertId();
    
    // Initialize session
    initSession();
    
    // Set user session (auto login after registration)
    setUserSession($userId, $email, $fullName, 'active');
    
    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$userId]);
    
    // Success response
    sendSuccess('Registration successful', [
        'user' => [
            'id' => $userId,
            'full_name' => $fullName,
            'email' => $email,
            'status' => 'active',
            'email_verified' => false
        ],
        'redirect' => '/web/index.html' // Redirect to home page
    ], 201);
    
} catch (PDOException $e) {
    error_log("Registration Error: " . $e->getMessage());
    sendServerError('Registration failed. Please try again later.');
    
} catch (Exception $e) {
    error_log("Unexpected Error: " . $e->getMessage());
    sendServerError('An unexpected error occurred.');
}

