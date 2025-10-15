<?php
/**
 * =============================================
 * Upload User Cover Photo
 * POST /api/profile/upload-cover.php
 * Phase: 3 - Profile API
 * =============================================
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/session.php';
require_once '../../includes/file_upload.php';

startSecureSession();

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
    
    // Optional: Validate image dimensions (e.g., minimum 800x200, max 3000x1000)
    $tmpPath = $_FILES['cover']['tmp_name'];
    $validation = validateImageDimensions($tmpPath, 800, 200, 3000, 1000);
    
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

