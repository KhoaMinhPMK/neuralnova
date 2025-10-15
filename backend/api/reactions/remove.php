<?php
/**
 * =============================================
 * Remove Reaction from Post
 * POST /api/reactions/remove.php
 * Phase: 5 - Reactions API
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

if (!$input || !isset($input['post_id']) || !isset($input['reaction_type'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Missing post_id or reaction_type'
    ]);
    exit;
}

$postId = intval($input['post_id']);
$reactionType = trim($input['reaction_type']);

// Validate reaction type
$validReactions = ['like', 'heart', 'flower', 'wow'];
if (!in_array($reactionType, $validReactions)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid reaction type. Allowed: ' . implode(', ', $validReactions)
    ]);
    exit;
}

try {
    // Delete reaction
    $deleteStmt = $pdo->prepare("
        DELETE FROM reactions 
        WHERE post_id = ? AND user_id = ? AND reaction_type = ?
    ");
    
    $deleteStmt->execute([$postId, $userId, $reactionType]);
    
    if ($deleteStmt->rowCount() === 0) {
        // No reaction found to delete
        echo json_encode([
            'success' => true,
            'message' => 'No reaction to remove',
            'not_found' => true
        ]);
        exit;
    }
    
    // Get updated reaction counts
    $countStmt = $pdo->prepare("
        SELECT 
            reaction_type,
            COUNT(*) AS count
        FROM reactions
        WHERE post_id = ?
        GROUP BY reaction_type
    ");
    
    $countStmt->execute([$postId]);
    $reactions = $countStmt->fetchAll(PDO::FETCH_ASSOC);
    
    $reactionCounts = [
        'like' => 0,
        'heart' => 0,
        'flower' => 0,
        'wow' => 0,
        'total' => 0
    ];
    
    foreach ($reactions as $reaction) {
        $reactionCounts[$reaction['reaction_type']] = intval($reaction['count']);
        $reactionCounts['total'] += intval($reaction['count']);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Reaction removed successfully',
        'reaction_type' => $reactionType,
        'counts' => $reactionCounts,
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

