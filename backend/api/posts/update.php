<?php
/**
 * =============================================
 * Update Post
 * POST /api/posts/update.php
 * Phase: 4 - Posts API
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
    $stmt = $pdo->prepare("SELECT id, user_id FROM posts WHERE id = ?");
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
            'error' => 'You can only edit your own posts'
        ]);
        exit;
    }
    
    // Prepare update fields
    $updateFields = [];
    $updateValues = [];
    
    // Allowed fields to update
    $allowedFields = [
        'caption' => 'string',
        'species' => 'string',
        'region' => 'string',
        'bloom_window' => 'string',
        'species_info' => 'string',
        'coordinates' => 'string',
        'post_date' => 'date',
        'is_public' => 'int',
        'blur_location' => 'int'
    ];
    
    foreach ($allowedFields as $field => $type) {
        if (isset($input[$field])) {
            $value = $input[$field];
            
            // Handle GPS coordinates
            if ($field === 'coordinates' && is_array($value)) {
                if (isset($value['lat']) && isset($value['lng'])) {
                    $value = $value['lat'] . ', ' . $value['lng'];
                } else {
                    continue;
                }
            }
            
            // Validate post date
            if ($field === 'post_date' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
                http_response_code(422);
                echo json_encode([
                    'success' => false,
                    'error' => 'Invalid date format. Use YYYY-MM-DD.',
                    'field' => 'post_date'
                ]);
                exit;
            }
            
            // Validate species
            if ($field === 'species') {
                $validSpecies = ['sakura', 'lotus', 'sunflower', 'lavender', 'orchid'];
                if (!in_array($value, $validSpecies) && $value !== null) {
                    http_response_code(422);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid species. Allowed: ' . implode(', ', $validSpecies)
                    ]);
                    exit;
                }
            }
            
            // Validate region
            if ($field === 'region') {
                $validRegions = ['temperate-n', 'temperate-s', 'tropical', 'med'];
                if (!in_array($value, $validRegions) && $value !== null) {
                    http_response_code(422);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid region. Allowed: ' . implode(', ', $validRegions)
                    ]);
                    exit;
                }
            }
            
            $updateFields[] = "$field = ?";
            $updateValues[] = $value;
        }
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No valid fields to update'
        ]);
        exit;
    }
    
    // Add updated_at
    $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
    
    // Add post ID to values
    $updateValues[] = $postId;
    
    // Execute update
    $sql = "UPDATE posts SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $updateStmt = $pdo->prepare($sql);
    $updateStmt->execute($updateValues);
    
    // Get updated post
    $postStmt = $pdo->prepare("SELECT * FROM posts WHERE id = ?");
    $postStmt->execute([$postId]);
    $updatedPost = $postStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'message' => 'Post updated successfully',
        'post' => $updatedPost,
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

