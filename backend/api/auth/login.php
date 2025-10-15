<?php
/**
 * User Login API
 * POST /backend/api/auth/login.php
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
    $email = $input['email'] ?? '';
    $password = $input['password'] ?? '';
    
    // Check required fields
    if (empty($email) || empty($password)) {
        sendError('Email and password are required', [
            'email' => empty($email) ? 'Email is required' : null,
            'password' => empty($password) ? 'Password is required' : null
        ], 400);
    }
    
    // Validate email format
    $validEmail = validateEmail($email);
    if (!$validEmail) {
        sendError('Invalid email format', ['email' => 'Please enter a valid email'], 400);
    }
    
    // Get database connection
    $pdo = getDBConnection();
    
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT id, full_name, email, password, status, email_verified 
        FROM users 
        WHERE email = ? 
        LIMIT 1
    ");
    $stmt->execute([$validEmail]);
    $user = $stmt->fetch();
    
    // Check if user exists
    if (!$user) {
        sendError('Invalid credentials', ['email' => 'Email or password is incorrect'], 401);
    }
    
    // Verify password
    if (!password_verify($password, $user['password'])) {
        sendError('Invalid credentials', ['password' => 'Email or password is incorrect'], 401);
    }
    
    // Check account status
    if ($user['status'] === 'banned') {
        sendError('Account has been banned', ['account' => 'Your account has been suspended'], 403);
    }
    
    if ($user['status'] === 'inactive') {
        sendError('Account is inactive', ['account' => 'Please contact support to activate your account'], 403);
    }
    
    // Initialize session
    initSession();
    
    // Set user session
    setUserSession(
        $user['id'],
        $user['email'],
        $user['full_name'],
        $user['status']
    );
    
    // Update last login
    $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $updateStmt->execute([$user['id']]);
    
    // Success response
    sendSuccess('Login successful', [
        'user' => [
            'id' => $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'status' => $user['status'],
            'email_verified' => (bool)$user['email_verified']
        ],
        'redirect' => '/web/index.html' // Redirect to home page
    ], 200);
    
} catch (PDOException $e) {
    error_log("Login Error: " . $e->getMessage());
    sendServerError('Login failed. Please try again later.');
    
} catch (Exception $e) {
    error_log("Unexpected Error: " . $e->getMessage());
    sendServerError('An unexpected error occurred.');
}

