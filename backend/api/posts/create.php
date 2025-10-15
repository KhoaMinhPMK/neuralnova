<?php
/**
 * =============================================
 * Create New Post
 * POST /api/posts/create.php
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
    // Handle media upload first (if provided)
    $mediaPath = null;
    $mediaType = 'none';
    
    if (isset($_FILES['media'])) {
        $uploadResult = uploadFile($_FILES['media'], 'post', $userId);
        
        if (!$uploadResult['success']) {
            http_response_code(422);
            echo json_encode($uploadResult);
            exit;
        }
        
        $mediaPath = $uploadResult['path'];
        
        // Determine media type
        $isVideo = strpos($uploadResult['type'], 'video/') === 0;
        $mediaType = $isVideo ? 'video' : 'image';
    }
    
    // Get form data
    $caption = isset($_POST['caption']) ? trim($_POST['caption']) : null;
    $species = isset($_POST['species']) ? trim($_POST['species']) : null;
    $region = isset($_POST['region']) ? trim($_POST['region']) : null;
    $bloomWindow = isset($_POST['bloom_window']) ? trim($_POST['bloom_window']) : null;
    $speciesInfo = isset($_POST['species_info']) ? trim($_POST['species_info']) : null;
    $coordinates = isset($_POST['coordinates']) ? trim($_POST['coordinates']) : null;
    $postDate = isset($_POST['post_date']) ? trim($_POST['post_date']) : null;
    $isPublic = isset($_POST['is_public']) ? intval($_POST['is_public']) : 1;
    $blurLocation = isset($_POST['blur_location']) ? intval($_POST['blur_location']) : 0;
    
    // Handle GPS coordinates if provided as object
    if (isset($_POST['gps']) && !empty($_POST['gps'])) {
        $gps = json_decode($_POST['gps'], true);
        if (isset($gps['lat']) && isset($gps['lng'])) {
            $coordinates = $gps['lat'] . ', ' . $gps['lng'];
        }
    }
    
    // Validate post date format (YYYY-MM-DD)
    if ($postDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $postDate)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid date format. Use YYYY-MM-DD.',
            'field' => 'post_date'
        ]);
        exit;
    }
    
    // Validate species (if provided)
    $validSpecies = ['sakura', 'lotus', 'sunflower', 'lavender', 'orchid'];
    if ($species && !in_array($species, $validSpecies)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid species. Allowed: ' . implode(', ', $validSpecies),
            'field' => 'species'
        ]);
        exit;
    }
    
    // Validate region (if provided)
    $validRegions = ['temperate-n', 'temperate-s', 'tropical', 'med'];
    if ($region && !in_array($region, $validRegions)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid region. Allowed: ' . implode(', ', $validRegions),
            'field' => 'region'
        ]);
        exit;
    }
    
    // Insert post into database
    $stmt = $pdo->prepare("
        INSERT INTO posts (
            user_id, 
            species, 
            region, 
            bloom_window, 
            species_info, 
            coordinates, 
            post_date, 
            caption, 
            media_url, 
            media_type, 
            is_public, 
            blur_location
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $userId,
        $species,
        $region,
        $bloomWindow,
        $speciesInfo,
        $coordinates,
        $postDate,
        $caption,
        $mediaPath,
        $mediaType,
        $isPublic,
        $blurLocation
    ]);
    
    $postId = $pdo->lastInsertId();
    
    // Get created post with user info
    $postStmt = $pdo->prepare("
        SELECT 
            p.*,
            u.full_name AS author_name,
            u.avatar_url AS author_avatar,
            u.custom_user_id AS author_username
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    ");
    
    $postStmt->execute([$postId]);
    $post = $postStmt->fetch(PDO::FETCH_ASSOC);
    
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
    } else {
        $post['gps'] = null;
    }
    
    // Remove raw coordinates string
    unset($post['coordinates']);
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Post created successfully',
        'post' => $post,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (PDOException $e) {
    // Rollback: Delete uploaded media if post creation failed
    if (isset($mediaPath) && $mediaPath) {
        deleteUploadedFile($mediaPath);
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error',
        'message' => $e->getMessage()
    ]);
}

