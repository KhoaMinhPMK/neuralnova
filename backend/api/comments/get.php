<?php
/**
 * =============================================
 * Get Comments for Post
 * GET /api/comments/get.php?post_id={id}&limit={n}&offset={n}
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

header('Access-Control-Allow-Methods: GET, OPTIONS');
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

try {
    // Get query parameters
    if (!isset($_GET['post_id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Post ID required'
        ]);
        exit;
    }
    
    $postId = intval($_GET['post_id']);
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 50;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Limit max to 100 comments per request
    if ($limit > 100) {
        $limit = 100;
    }
    
    // Get comments with author info
    $stmt = $pdo->prepare("
        SELECT 
            c.*,
            u.full_name AS author_name,
            u.avatar_url AS author_avatar,
            u.custom_user_id AS author_username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = ?
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
    ");
    
    $stmt->execute([$postId, $limit, $offset]);
    $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process comments
    foreach ($comments as &$comment) {
        // Convert author avatar to URL
        if ($comment['author_avatar']) {
            $comment['author_avatar'] = getFileUrl($comment['author_avatar']);
        }
        
        // Check if current user is the comment author
        $comment['is_author'] = isLoggedIn() && $_SESSION['user_id'] == $comment['user_id'];
    }
    
    // Get total count
    $countStmt = $pdo->prepare("SELECT COUNT(*) AS total FROM comments WHERE post_id = ?");
    $countStmt->execute([$postId]);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'comments' => $comments,
        'pagination' => [
            'total' => intval($total['total']),
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < intval($total['total'])
        ],
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

