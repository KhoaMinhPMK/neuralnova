<?php
/**
 * =============================================
 * Delete Post
 * POST /api/posts/delete.php
 * Phase: 4 - Posts API
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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['post_id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid input or missing post_id'
    ]);
    exit;
}

$postId = intval($input['post_id']);

try {
    // Check if post exists and belongs to user
    $stmt = $pdo->prepare("SELECT id, user_id, media_url FROM posts WHERE id = ?");
    $stmt->execute([$postId]);
    $post = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$post) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Post not found'
        ]);
        exit;
    }
    
    if ($post['user_id'] != $userId) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'You can only delete your own posts'
        ]);
        exit;
    }
    
    // Delete associated media file (if exists)
    if ($post['media_url']) {
        deleteUploadedFile($post['media_url']);
    }
    
    // Delete post (CASCADE will delete reactions and comments)
    $deleteStmt = $pdo->prepare("DELETE FROM posts WHERE id = ?");
    $deleteStmt->execute([$postId]);
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Post deleted successfully',
        'post_id' => $postId,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}

