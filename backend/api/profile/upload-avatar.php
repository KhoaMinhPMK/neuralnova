<?php
/**
 * =============================================
 * Upload User Avatar
 * POST /api/profile/upload-avatar.php
 * Phase: 3 - Profile API
 * =============================================
 */

define('API_ACCESS', true);

header('Content-Type: application/json');

// CORS: Get origin from request for credentials support
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://neuralnova.space',
    'http://neuralnova.space'
];

foreach ($allowedOrigins as $allowed) {
    if (strpos($origin, $allowed) === 0) {
        header("Access-Control-Allow-Origin: $origin");
        break;
    }
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/session.php';
require_once '../../includes/file_upload.php';

initSession();

// Check authentication
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Not authenticated'
    ]);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Check if file was uploaded
    if (!isset($_FILES['avatar'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No avatar file provided'
        ]);
        exit;
    }
    
    // Get old avatar path (to delete later)
    $stmt = $pdo->prepare("SELECT avatar_url FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $oldAvatarPath = $user['avatar_url'];
    
    // Upload new avatar
    $uploadResult = uploadFile($_FILES['avatar'], 'avatar', $userId);
    
    if (!$uploadResult['success']) {
        http_response_code(422);
        echo json_encode($uploadResult);
        exit;
    }
    
    // Optional: Validate image dimensions (e.g., minimum 100x100, max 2000x2000)
    $tmpPath = $_FILES['avatar']['tmp_name'];
    $validation = validateImageDimensions($tmpPath, 100, 100, 2000, 2000);
    
    if (!$validation['valid']) {
        // Delete uploaded file
        deleteUploadedFile($uploadResult['path']);
        
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => $validation['error'],
            'width' => $validation['width'],
            'height' => $validation['height']
        ]);
        exit;
    }
    
    // Update database
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $updateStmt->execute([$uploadResult['path'], $userId]);
    
    // Delete old avatar (if exists)
    if ($oldAvatarPath) {
        deleteUploadedFile($oldAvatarPath);
    }
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Avatar uploaded successfully',
        'avatar' => [
            'path' => $uploadResult['path'],
            'url' => getFileUrl($uploadResult['path']),
            'filename' => $uploadResult['filename'],
            'size' => $uploadResult['size'],
            'dimensions' => [
                'width' => $validation['width'],
                'height' => $validation['height']
            ]
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    // Rollback: Delete uploaded file if database update failed
    if (isset($uploadResult) && $uploadResult['success']) {
        deleteUploadedFile($uploadResult['path']);
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}

