<?php
/**
 * =============================================
 * Update User Profile
 * POST /api/profile/update.php
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

// Get input (support both JSON and FormData)
$input = [];
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (strpos($contentType, 'application/json') !== false) {
    $input = json_decode(file_get_contents('php://input'), true);
} elseif (strpos($contentType, 'multipart/form-data') !== false || !empty($_POST)) {
    $input = $_POST;
} else {
    $input = json_decode(file_get_contents('php://input'), true);
}

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid input'
    ]);
    exit;
}

try {
    // Prepare update fields
    $updateFields = [];
    $updateValues = [];
    
    // Allowed fields to update
    $allowedFields = [
        'bio' => 'string',
        'interests' => 'string',  // Can be array or comma-separated string
        'country' => 'string',
        'gps_coords' => 'string',
        'gps_coordinates' => 'string',  // Alias for gps_coords
        'ip_region' => 'string',
        'ip_address' => 'string',  // Alias for ip_display
        'ip_display' => 'string',
        'custom_user_id' => 'string',
        'full_name' => 'string',
        'avatar_url' => 'string',  // Avatar image URL
        'cover_url' => 'string'    // Cover photo URL
    ];
    
    foreach ($allowedFields as $field => $type) {
        if (isset($input[$field])) {
            $value = $input[$field];
            $dbField = $field;
            
            // Handle field aliases
            if ($field === 'gps_coordinates') {
                $dbField = 'gps_coords';
            }
            if ($field === 'ip_address') {
                $dbField = 'ip_display';
            }
            
            // Handle GPS coordinates
            if (($field === 'gps_coords' || $field === 'gps_coordinates') && is_array($value)) {
                // Convert {lat, lng} to "lat, lng" string
                if (isset($value['lat']) && isset($value['lng'])) {
                    $value = $value['lat'] . ', ' . $value['lng'];
                } else {
                    continue; // Skip invalid GPS format
                }
            }
            
            // Handle interests (can be array or string)
            if ($field === 'interests') {
                if (is_array($value)) {
                    $value = implode(',', $value);
                }
                // Already string, keep as is
            }
            
            // Handle custom_user_id (username) - check uniqueness
            if ($field === 'custom_user_id' && !empty($value)) {
                $checkStmt = $pdo->prepare("
                    SELECT id FROM users 
                    WHERE custom_user_id = ? AND id != ?
                ");
                $checkStmt->execute([$value, $userId]);
                
                if ($checkStmt->fetch()) {
                    http_response_code(422);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Username already taken',
                        'field' => 'custom_user_id'
                    ]);
                    exit;
                }
                
                // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
                if (!preg_match('/^[a-zA-Z0-9_-]{3,20}$/', $value)) {
                    http_response_code(422);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Invalid username format. Use 3-20 alphanumeric characters, underscores, or hyphens.',
                        'field' => 'custom_user_id'
                    ]);
                    exit;
                }
            }
            
            // Add to update query (use dbField for actual column name)
            $updateFields[] = "$dbField = ?";
            $updateValues[] = $value;
        }
    }
    
    // Check if there are fields to update
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No valid fields to update'
        ]);
        exit;
    }
    
    // Add user ID to values
    $updateValues[] = $userId;
    
    // Build and execute update query
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($updateValues);
    
    // Get updated user profile
    $userStmt = $pdo->prepare("
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
            updated_at
        FROM users 
        WHERE id = ?
    ");
    
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Parse interests back to array
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
    
    unset($user['gps_coords']);
    
    // Success response
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
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

