<?php
/**
 * =============================================
 * Add Comment to Post
 * POST /api/comments/add.php
 * Phase: 6 - Comments API
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

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['post_id']) || !isset($input['comment_text'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing post_id or comment_text'
    ]);
    exit;
}

$postId = intval($input['post_id']);
$commentText = trim($input['comment_text']);

// Validate comment text
if (empty($commentText)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => 'Comment cannot be empty'
    ]);
    exit;
}

if (strlen($commentText) > 1000) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => 'Comment too long. Maximum 1000 characters.'
    ]);
    exit;
}

try {
    // Check if post exists
    $postStmt = $pdo->prepare("SELECT id FROM posts WHERE id = ?");
    $postStmt->execute([$postId]);
    
    if (!$postStmt->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Post not found'
        ]);
        exit;
    }
    
    // Insert comment
    $insertStmt = $pdo->prepare("
        INSERT INTO comments (post_id, user_id, comment_text) 
        VALUES (?, ?, ?)
    ");
    
    $insertStmt->execute([$postId, $userId, $commentText]);
    
    $commentId = $pdo->lastInsertId();
    
    // Get created comment with user info
    $commentStmt = $pdo->prepare("
        SELECT 
            c.*,
            u.full_name AS author_name,
            u.avatar_url AS author_avatar,
            u.custom_user_id AS author_username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
    ");
    
    $commentStmt->execute([$commentId]);
    $comment = $commentStmt->fetch(PDO::FETCH_ASSOC);
    
    // Convert author avatar to URL
    if ($comment['author_avatar']) {
        $comment['author_avatar'] = getFileUrl($comment['author_avatar']);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment added successfully',
        'comment' => $comment,
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

