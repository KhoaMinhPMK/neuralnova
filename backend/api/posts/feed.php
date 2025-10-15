<?php
/**
 * =============================================
 * Get Posts Feed
 * GET /api/posts/feed.php?user_id={id}&limit={n}&offset={n}
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

try {
    // Get query parameters
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    $offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
    
    // Limit max to 100 posts per request
    if ($limit > 100) {
        $limit = 100;
    }
    
    // Build query based on filters
    $sql = "
        SELECT 
            p.*,
            u.full_name AS author_name,
            u.avatar_url AS author_avatar,
            u.custom_user_id AS author_username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE 1=1
    ";
    
    $params = [];
    
    // Filter by user ID (if provided)
    if ($userId) {
        $sql .= " AND p.user_id = ?";
        $params[] = $userId;
    } else {
        // If no user specified, only show public posts
        $sql .= " AND p.is_public = 1";
    }
    
    // If viewing own posts, show both public and private
    if (isLoggedIn() && $userId && $userId == $_SESSION['user_id']) {
        // Remove the is_public filter by rebuilding query
        $sql = "
            SELECT 
                p.*,
                u.full_name AS author_name,
                u.avatar_url AS author_avatar,
                u.custom_user_id AS author_username
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        ";
        $params = [$userId];
    }
    
    // Order by created_at DESC
    $sql .= " ORDER BY p.created_at DESC";
    
    // Add limit and offset
    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process each post
    foreach ($posts as &$post) {
        // Convert media path to URL
        if ($post['media_url']) {
            $post['media_url'] = getFileUrl($post['media_url']);
        }
        
        // Convert author avatar to URL
        if ($post['author_avatar']) {
            $post['author_avatar'] = getFileUrl($post['author_avatar']);
        }
        
        // Parse GPS coordinates
        if ($post['coordinates']) {
            $coords = explode(',', $post['coordinates']);
            $post['gps'] = [
                'lat' => floatval(trim($coords[0])),
                'lng' => floatval(trim($coords[1]))
            ];
            
            // Blur if requested
            if ($post['blur_location']) {
                $post['gps']['lat'] = round($post['gps']['lat'], 1);
                $post['gps']['lng'] = round($post['gps']['lng'], 1);
            }
        } else {
            $post['gps'] = null;
        }
        
        unset($post['coordinates']);
        
        // Get reaction counts
        $reactionsStmt = $pdo->prepare("
            SELECT 
                reaction_type,
                COUNT(*) AS count
            FROM reactions
            WHERE post_id = ?
            GROUP BY reaction_type
        ");
        
        $reactionsStmt->execute([$post['id']]);
        $reactions = $reactionsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $post['reactions'] = [
            'like' => 0,
            'heart' => 0,
            'flower' => 0,
            'wow' => 0,
            'total' => 0
        ];
        
        foreach ($reactions as $reaction) {
            $post['reactions'][$reaction['reaction_type']] = intval($reaction['count']);
            $post['reactions']['total'] += intval($reaction['count']);
        }
        
        // Get comment count
        $commentCountStmt = $pdo->prepare("
            SELECT COUNT(*) AS count FROM comments WHERE post_id = ?
        ");
        
        $commentCountStmt->execute([$post['id']]);
        $commentCount = $commentCountStmt->fetch(PDO::FETCH_ASSOC);
        
        $post['comment_count'] = intval($commentCount['count']);
        
        // Check if current user is the author
        $post['is_author'] = isLoggedIn() && $_SESSION['user_id'] == $post['user_id'];
    }
    
    // Get total count for pagination
    $countSql = "SELECT COUNT(*) AS total FROM posts p WHERE 1=1";
    $countParams = [];
    
    if ($userId) {
        $countSql .= " AND p.user_id = ?";
        $countParams[] = $userId;
    } else {
        $countSql .= " AND p.is_public = 1";
    }
    
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC);
    
    // Success response
    echo json_encode([
        'success' => true,
        'posts' => $posts,
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

