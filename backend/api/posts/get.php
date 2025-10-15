<?php
/**
 * =============================================
 * Get Single Post
 * GET /api/posts/get.php?post_id={id}
 * Phase: 4 - Posts API
 * =============================================
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';
require_once '../../includes/session.php';
require_once '../../includes/file_upload.php';

startSecureSession();

try {
    // Get post ID from query string
    if (!isset($_GET['post_id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Post ID required'
        ]);
        exit;
    }
    
    $postId = intval($_GET['post_id']);
    
    // Get post with author info
    $stmt = $pdo->prepare("
        SELECT 
            p.*,
            u.full_name AS author_name,
            u.avatar_url AS author_avatar,
            u.custom_user_id AS author_username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    
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
    
    // Check privacy
    if (!$post['is_public']) {
        // Private post - only owner can view
        if (!isLoggedIn() || $_SESSION['user_id'] != $post['user_id']) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'This post is private'
            ]);
            exit;
        }
    }
    
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
            $post['gps_blurred'] = true;
            $post['gps']['lat'] = round($post['gps']['lat'], 1); // Blur to 1 decimal place
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
    
    $reactionsStmt->execute([$postId]);
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
    
    // Check if current user has reacted
    if (isLoggedIn()) {
        $userReactionStmt = $pdo->prepare("
            SELECT reaction_type 
            FROM reactions 
            WHERE post_id = ? AND user_id = ?
        ");
        
        $userReactionStmt->execute([$postId, $_SESSION['user_id']]);
        $userReaction = $userReactionStmt->fetch(PDO::FETCH_ASSOC);
        
        $post['user_reaction'] = $userReaction ? $userReaction['reaction_type'] : null;
    } else {
        $post['user_reaction'] = null;
    }
    
    // Get comment count
    $commentCountStmt = $pdo->prepare("
        SELECT COUNT(*) AS count FROM comments WHERE post_id = ?
    ");
    
    $commentCountStmt->execute([$postId]);
    $commentCount = $commentCountStmt->fetch(PDO::FETCH_ASSOC);
    
    $post['comment_count'] = intval($commentCount['count']);
    
    // Check if current user is the author
    $post['is_author'] = isLoggedIn() && $_SESSION['user_id'] == $post['user_id'];
    
    // Success response
    echo json_encode([
        'success' => true,
        'post' => $post,
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

