<?php
/**
 * =============================================
 * Delete Comment
 * POST /api/comments/delete.php
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

if (!$input || !isset($input['comment_id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing comment_id'
    ]);
    exit;
}

$commentId = intval($input['comment_id']);

try {
    // Check if comment exists and belongs to user
    $stmt = $pdo->prepare("SELECT id, user_id FROM comments WHERE id = ?");
    $stmt->execute([$commentId]);
    $comment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$comment) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Comment not found'
        ]);
        exit;
    }
    
    if ($comment['user_id'] != $userId) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'You can only delete your own comments'
        ]);
        exit;
    }
    
    // Delete comment
    $deleteStmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
    $deleteStmt->execute([$commentId]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Comment deleted successfully',
        'comment_id' => $commentId,
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

