<?php
// backend/api/profile/badges.php
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
    
    // Temporarily return empty badges to avoid errors
    // TODO: Implement proper badge calculation when database schema is complete
    $badges = [];
    
    // Simple badge: Early Bird (everyone gets it)
    $badges[] = [
        'id' => 'early_bird',
        'name' => 'Early Bird',
        'description' => 'One of the first users',
        'icon' => 'zap',
        'color' => '#06b6d4',
        'earned_at' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode([
        'success' => true,
        'badges' => $badges,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Return empty badges instead of error
    echo json_encode([
        'success' => true,
        'badges' => [],
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}

function calculateUserBadges($pdo, $userId) {
    $badges = [];
    
    // Get user stats
    $stats = getUserStats($pdo, $userId);
    
    // Explorer Badge - 3+ different species
    if ($stats['species_count'] >= 3) {
        $badges[] = [
            'id' => 'explorer',
            'name' => 'Explorer',
            'description' => 'Observed 3+ different species',
            'icon' => 'map-pin',
            'color' => '#10b981',
            'earned_at' => $stats['first_species_date'] ?? null
        ];
    }
    
    // Regional Badge - 3+ different regions
    if ($stats['regions_count'] >= 3) {
        $badges[] = [
            'id' => 'regional',
            'name' => 'Regional Expert',
            'description' => 'Explored 3+ different regions',
            'icon' => 'globe',
            'color' => '#3b82f6',
            'earned_at' => $stats['first_region_date'] ?? null
        ];
    }
    
    // Bloom Master Badge - 80%+ accuracy rate
    if ($stats['accuracy_rate'] >= 80 && $stats['total_observations'] >= 3) {
        $badges[] = [
            'id' => 'bloom_master',
            'name' => 'Bloom Master',
            'description' => '80%+ prediction accuracy',
            'icon' => 'flower-2',
            'color' => '#8b5cf6',
            'earned_at' => $stats['accuracy_achieved_date'] ?? null
        ];
    }
    
    // Pro Photographer - 10+ posts with media
    if ($stats['posts_with_media'] >= 10) {
        $badges[] = [
            'id' => 'pro_photographer',
            'name' => 'Pro Photographer',
            'description' => 'Posted 10+ media posts',
            'icon' => 'camera',
            'color' => '#f59e0b',
            'earned_at' => $stats['media_achieved_date'] ?? null
        ];
    }
    
    // Social Butterfly - 50+ total reactions
    if ($stats['total_reactions'] >= 50) {
        $badges[] = [
            'id' => 'social_butterfly',
            'name' => 'Social Butterfly',
            'description' => 'Received 50+ reactions',
            'icon' => 'heart',
            'color' => '#ef4444',
            'earned_at' => $stats['reactions_achieved_date'] ?? null
        ];
    }
    
    // Early Bird - First 100 users
    if ($stats['user_rank'] <= 100) {
        $badges[] = [
            'id' => 'early_bird',
            'name' => 'Early Bird',
            'description' => 'One of the first 100 users',
            'icon' => 'zap',
            'color' => '#06b6d4',
            'earned_at' => $stats['registration_date'] ?? null
        ];
    }
    
    // Dedicated Observer - 30+ posts
    if ($stats['total_posts'] >= 30) {
        $badges[] = [
            'id' => 'dedicated_observer',
            'name' => 'Dedicated Observer',
            'description' => 'Posted 30+ observations',
            'icon' => 'eye',
            'color' => '#84cc16',
            'earned_at' => $stats['posts_achieved_date'] ?? null
        ];
    }
    
    return $badges;
}

function getUserStats($pdo, $userId) {
    // Check if columns exist first
    $columnsCheck = $pdo->query("SHOW COLUMNS FROM posts LIKE 'species'");
    $hasSpeciesColumn = $columnsCheck->rowCount() > 0;
    
    $observationCheck = $pdo->query("SHOW COLUMNS FROM posts LIKE 'observation_date'");
    $hasObservationColumn = $observationCheck->rowCount() > 0;
    
    // Get species count and first date
    if ($hasSpeciesColumn) {
        $speciesStmt = $pdo->prepare("
            SELECT 
                COUNT(DISTINCT species) as species_count,
                MIN(created_at) as first_species_date
            FROM posts 
            WHERE user_id = ? AND species IS NOT NULL
        ");
        $speciesStmt->execute([$userId]);
        $speciesData = $speciesStmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $speciesData = ['species_count' => 0, 'first_species_date' => null];
    }
    
    // Get regions count and first date
    if ($hasSpeciesColumn) {
        $regionsStmt = $pdo->prepare("
            SELECT 
                COUNT(DISTINCT region) as regions_count,
                MIN(created_at) as first_region_date
            FROM posts 
            WHERE user_id = ? AND region IS NOT NULL
        ");
        $regionsStmt->execute([$userId]);
        $regionsData = $regionsStmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $regionsData = ['regions_count' => 0, 'first_region_date' => null];
    }
    
    // Get total posts and posts with media
    $postsStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_posts,
            COUNT(CASE WHEN media_url IS NOT NULL THEN 1 END) as posts_with_media,
            MIN(created_at) as posts_achieved_date
        FROM posts 
        WHERE user_id = ?
    ");
    $postsStmt->execute([$userId]);
    $postsData = $postsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get total reactions
    $reactionsStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_reactions,
            MIN(created_at) as reactions_achieved_date
        FROM reactions r
        JOIN posts p ON r.post_id = p.id
        WHERE p.user_id = ?
    ");
    $reactionsStmt->execute([$userId]);
    $reactionsData = $reactionsStmt->fetch(PDO::FETCH_ASSOC);
    
    // Get accuracy rate
    if ($hasSpeciesColumn && $hasObservationColumn) {
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
    } else {
        $totalObservations = 0;
        $accurateObservations = 0;
        $accuracyRate = 0;
    }
    
    // Get user rank (registration order)
    $rankStmt = $pdo->prepare("
        SELECT 
            COUNT(*) + 1 as user_rank,
            created_at as registration_date
        FROM users 
        WHERE created_at < (SELECT created_at FROM users WHERE id = ?)
    ");
    $rankStmt->execute([$userId]);
    $rankData = $rankStmt->fetch(PDO::FETCH_ASSOC);
    
    return [
        'species_count' => $speciesData['species_count'] ?? 0,
        'first_species_date' => $speciesData['first_species_date'],
        'regions_count' => $regionsData['regions_count'] ?? 0,
        'first_region_date' => $regionsData['first_region_date'],
        'total_posts' => $postsData['total_posts'] ?? 0,
        'posts_with_media' => $postsData['posts_with_media'] ?? 0,
        'posts_achieved_date' => $postsData['posts_achieved_date'],
        'total_reactions' => $reactionsData['total_reactions'] ?? 0,
        'reactions_achieved_date' => $reactionsData['reactions_achieved_date'],
        'accuracy_rate' => $accuracyRate,
        'total_observations' => $totalObservations,
        'accurate_observations' => $accurateObservations,
        'user_rank' => $rankData['user_rank'] ?? 999,
        'registration_date' => $rankData['registration_date']
    ];
}
?>
