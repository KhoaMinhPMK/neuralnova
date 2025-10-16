<?php
// backend/api/profile/timeline.php
define('API_ACCESS', true);
require_once '../../config/database.php';
require_once '../../includes/session.php';

// Set headers
header('Content-Type: application/json');

// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost',
    'http://127.0.0.1',
    'https://neuralnova.space',
    'http://neuralnova.space'
];

$originAllowed = false;
foreach ($allowedOrigins as $allowed) {
    if ($origin === $allowed || strpos($origin, $allowed . ':') === 0) {
        header("Access-Control-Allow-Origin: $origin");
        $originAllowed = true;
        break;
    }
}

if (!$originAllowed && $origin) {
    if (strpos($origin, 'http://localhost') === 0 || strpos($origin, 'http://127.0.0.1') === 0) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Initialize session
initSession();

// Check authentication
if (!isLoggedIn()) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Authentication required'
    ]);
    exit;
}

try {
    $pdo = getDBConnection();
    $userId = $_SESSION['user_id'];
    
    // Get user's posts with bloom data
    $stmt = $pdo->prepare("
        SELECT 
            p.id,
            p.caption,
            p.media_url,
            p.created_at,
            p.updated_at,
            p.species,
            p.region,
            p.bloom_window,
            p.observation_date,
            p.coordinates
        FROM posts p 
        WHERE p.user_id = ? 
        AND p.species IS NOT NULL 
        AND p.observation_date IS NOT NULL
        ORDER BY p.observation_date ASC
    ");
    
    $stmt->execute([$userId]);
    $posts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Process timeline items
    $timeline = [];
    foreach ($posts as $post) {
        $isAccurate = false;
        if ($post['bloom_window'] && $post['observation_date']) {
            $isAccurate = isDateWithinBloomWindow($post['observation_date'], $post['bloom_window']);
        }
        
        $timeline[] = [
            'id' => $post['id'],
            'species' => $post['species'],
            'region' => $post['region'],
            'observation_date' => $post['observation_date'],
            'bloom_window' => $post['bloom_window'],
            'is_accurate' => $isAccurate,
            'created_at' => $post['created_at']
        ];
    }
    
    // Calculate stats
    $stats = calculateUserStats($pdo, $userId);
    
    echo json_encode([
        'success' => true,
        'timeline' => $timeline,
        'stats' => $stats,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("Timeline error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to load timeline'
    ]);
}

function isDateWithinBloomWindow($dateStr, $window) {
    if (!$window || $window === 'Quanh năm') return true;
    if ($window === '—') return false;
    
    // Parse window format: "MM-MM" or "Quanh năm"
    if (strpos($window, '-') === false) return false;
    
    $parts = explode('-', $window);
    if (count($parts) !== 2) return false;
    
    $startMonth = intval($parts[0]);
    $endMonth = intval($parts[1]);
    $observationMonth = intval(date('n', strtotime($dateStr)));
    
    if ($startMonth <= $endMonth) {
        return $observationMonth >= $startMonth && $observationMonth <= $endMonth;
    } else {
        // Cross-year window (e.g., 12-02)
        return $observationMonth >= $startMonth || $observationMonth <= $endMonth;
    }
}

function calculateUserStats($pdo, $userId) {
    // Get species count
    $speciesStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT species) as species_count 
        FROM posts 
        WHERE user_id = ? AND species IS NOT NULL
    ");
    $speciesStmt->execute([$userId]);
    $speciesCount = $speciesStmt->fetch(PDO::FETCH_ASSOC)['species_count'] ?? 0;
    
    // Get regions count
    $regionsStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT region) as regions_count 
        FROM posts 
        WHERE user_id = ? AND region IS NOT NULL
    ");
    $regionsStmt->execute([$userId]);
    $regionsCount = $regionsStmt->fetch(PDO::FETCH_ASSOC)['regions_count'] ?? 0;
    
    // Get total posts
    $postsStmt = $pdo->prepare("
        SELECT COUNT(*) as total_posts 
        FROM posts 
        WHERE user_id = ?
    ");
    $postsStmt->execute([$userId]);
    $totalPosts = $postsStmt->fetch(PDO::FETCH_ASSOC)['total_posts'] ?? 0;
    
    // Get accuracy rate
    $accuracyStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_observations,
            SUM(CASE 
                WHEN bloom_window = 'Quanh năm' THEN 1
                WHEN bloom_window IS NOT NULL AND observation_date IS NOT NULL THEN
                    CASE 
                        WHEN bloom_window LIKE '%-%' THEN
                            CASE 
                                WHEN SUBSTRING(bloom_window, 1, 2) <= SUBSTRING(bloom_window, 4, 2) THEN
                                    MONTH(observation_date) BETWEEN SUBSTRING(bloom_window, 1, 2) AND SUBSTRING(bloom_window, 4, 2)
                                ELSE
                                    MONTH(observation_date) >= SUBSTRING(bloom_window, 1, 2) OR MONTH(observation_date) <= SUBSTRING(bloom_window, 4, 2)
                            END
                        ELSE 0
                    END
                ELSE 0
            END) as accurate_observations
        FROM posts 
        WHERE user_id = ? 
        AND species IS NOT NULL 
        AND observation_date IS NOT NULL
    ");
    $accuracyStmt->execute([$userId]);
    $accuracyData = $accuracyStmt->fetch(PDO::FETCH_ASSOC);
    
    $totalObservations = $accuracyData['total_observations'] ?? 0;
    $accurateObservations = $accuracyData['accurate_observations'] ?? 0;
    $accuracyRate = $totalObservations > 0 ? round(($accurateObservations / $totalObservations) * 100) : 0;
    
    return [
        'species_count' => $speciesCount,
        'regions_count' => $regionsCount,
        'total_posts' => $totalPosts,
        'accuracy_rate' => $accuracyRate,
        'total_observations' => $totalObservations,
        'accurate_observations' => $accurateObservations
    ];
}
?>
