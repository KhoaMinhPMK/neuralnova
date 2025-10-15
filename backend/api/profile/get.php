<?php
/**
 * =============================================
 * Get User Profile
 * GET /api/profile/get.php?user_id={id}
 * or GET /api/profile/get.php (current user)
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
    // Get target user ID (from query or session)
    $targetUserId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
    
    // If no user_id provided, use current logged-in user
    if ($targetUserId === null) {
        if (!isLoggedIn()) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Not authenticated'
            ]);
            exit;
        }
        $targetUserId = $_SESSION['user_id'];
    }
    
    // Get user profile from database
    $stmt = $pdo->prepare("
        SELECT 
            id,
            full_name,
            email,
            bio,
            interests,
            country,
            avatar_url,
            cover_url,
            gps_coords,
            ip_region,
            ip_display,
            custom_user_id,
            status,
            created_at,
            last_login
        FROM users 
        WHERE id = ? AND status = 'active'
    ");
    
    $stmt->execute([$targetUserId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'User not found'
        ]);
        exit;
    }
    
    // Convert file paths to full URLs
    $user['avatar_url'] = $user['avatar_url'] ? getFileUrl($user['avatar_url']) : null;
    $user['cover_url'] = $user['cover_url'] ? getFileUrl($user['cover_url']) : null;
    
    // Parse interests from comma-separated string to array
    $user['interests'] = $user['interests'] ? explode(',', $user['interests']) : [];
    
    // Parse GPS coordinates
    if ($user['gps_coords']) {
        $coords = explode(',', $user['gps_coords']);
        $user['gps'] = [
            'lat' => floatval(trim($coords[0])),
            'lng' => floatval(trim($coords[1]))
        ];
    } else {
        $user['gps'] = null;
    }
    
    // Remove GPS string (we use the parsed object)
    unset($user['gps_coords']);
    
    // Get user statistics
    $statsStmt = $pdo->prepare("
        SELECT 
            (SELECT COUNT(*) FROM posts WHERE user_id = ?) AS post_count,
            (SELECT COUNT(DISTINCT r.post_id) FROM reactions r JOIN posts p ON r.post_id = p.id WHERE p.user_id = ?) AS reactions_received,
            (SELECT COUNT(*) FROM comments c JOIN posts p ON c.post_id = p.id WHERE p.user_id = ?) AS comments_received
    ");
    
    $statsStmt->execute([$targetUserId, $targetUserId, $targetUserId]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Add stats to user object
    $user['stats'] = [
        'posts' => intval($stats['post_count']),
        'reactions' => intval($stats['reactions_received']),
        'comments' => intval($stats['comments_received'])
    ];
    
    // Check if viewing own profile
    $user['is_own_profile'] = isLoggedIn() && $_SESSION['user_id'] == $targetUserId;
    
    // Hide email if not own profile
    if (!$user['is_own_profile']) {
        unset($user['email']);
    }
    
    // Success response
    echo json_encode([
        'success' => true,
        'user' => $user,
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

