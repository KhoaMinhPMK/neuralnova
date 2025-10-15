<?php
// backend/api/posts/upload-media.php
define('API_ACCESS', true);
require_once '../../config/database.php';
require_once '../../includes/session.php';
require_once '../../includes/cors.php';
require_once '../../includes/file_upload.php';

// Handle CORS
handleCors(['POST', 'OPTIONS'], ['Content-Type']);

// Initialize session
initSession();

// Check authentication
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required'
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Check if file was uploaded
    if (!isset($_FILES['media']) || $_FILES['media']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No file uploaded or upload error'
        ]);
        exit;
    }
    
    $file = $_FILES['media'];
    $userId = $_SESSION['user_id'];
    
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    $fileType = $file['type'];
    
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM) are allowed.'
        ]);
        exit;
    }
    
    // Determine if it's image or video
    $isVideo = strpos($fileType, 'video/') === 0;
    $subfolder = $isVideo ? 'videos' : 'images';
    
    // Upload file with new signature
    $uploadResult = uploadFile($file, "posts/{$subfolder}", [
        'user_id' => $userId,
        'max_size' => $isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024, // 50MB for videos, 10MB for images
        'allowed_types' => $allowedTypes
    ]);
    
    if (!$uploadResult['success']) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $uploadResult['error']
        ]);
        exit;
    }
    
    // Return success with file info
    echo json_encode([
        'success' => true,
        'message' => 'Media uploaded successfully',
        'file' => [
            'url' => $uploadResult['url'],
            'filename' => $uploadResult['filename'],
            'type' => $isVideo ? 'video' : 'image',
            'size' => $file['size']
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Media upload error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Upload failed'
    ]);
}
?>
