<?php
/**
 * =============================================
 * Upload User Cover Photo
 * POST /api/profile/upload-cover.php
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

// Get database connection
$pdo = getDBConnection();

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
    if (!isset($_FILES['cover'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No cover photo provided'
        ]);
        exit;
    }
    
    // Get old cover path (to delete later)
    $stmt = $pdo->prepare("SELECT cover_url FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    $oldCoverPath = $user['cover_url'];
    
    // Upload new cover
    $uploadResult = uploadFile($_FILES['cover'], 'cover', $userId);
    
    if (!$uploadResult['success']) {
        http_response_code(422);
        echo json_encode($uploadResult);
        exit;
    }
    
    // Optional: Validate image dimensions (relaxed for better UX)
    $tmpPath = $_FILES['cover']['tmp_name'];
    $imageInfo = getimagesize($tmpPath);
    
    if ($imageInfo === false) {
        // Not a valid image
        deleteUploadedFile($uploadResult['path']);
        
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Not a valid image file'
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    $width = $imageInfo[0];
    $height = $imageInfo[1];
    
    // Relaxed validation: min 100x100, max 5000x5000
    if ($width < 100 || $height < 100) {
        deleteUploadedFile($uploadResult['path']);
        
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Image too small. Minimum 100x100 pixels',
            'width' => $width,
            'height' => $height
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    if ($width > 5000 || $height > 5000) {
        deleteUploadedFile($uploadResult['path']);
        
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Image too large. Maximum 5000x5000 pixels',
            'width' => $width,
            'height' => $height
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // Update database
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET cover_url = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
    ");
    $updateStmt->execute([$uploadResult['path'], $userId]);
    
    // Delete old cover (if exists)
    if ($oldCoverPath) {
        deleteUploadedFile($oldCoverPath);
    }
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Cover photo uploaded successfully',
        'cover' => [
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

