<?php
// Test badges API directly
define('API_ACCESS', true);
require_once '../config/database.php';
require_once '../includes/session.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Testing Badges API</h1>";

// Start session
session_start();

// Mock user login
$_SESSION['user_id'] = 5; // Your user ID
$_SESSION['user_email'] = 'khoaminh@gmail.com';
$_SESSION['last_activity'] = time();

echo "<p>Session user_id: " . $_SESSION['user_id'] . "</p>";

try {
    $pdo = getDBConnection();
    echo "<p>✅ Database connected</p>";
    
    $userId = $_SESSION['user_id'];
    
    // Test species count query
    echo "<h2>Test 1: Species Count</h2>";
    $speciesStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT species) as species_count 
        FROM posts 
        WHERE user_id = ? AND species IS NOT NULL
    ");
    $speciesStmt->execute([$userId]);
    $result = $speciesStmt->fetch(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    // Test regions count query
    echo "<h2>Test 2: Regions Count</h2>";
    $regionsStmt = $pdo->prepare("
        SELECT COUNT(DISTINCT region) as regions_count 
        FROM posts 
        WHERE user_id = ? AND region IS NOT NULL
    ");
    $regionsStmt->execute([$userId]);
    $result = $regionsStmt->fetch(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    // Test accuracy query
    echo "<h2>Test 3: Accuracy</h2>";
    $accuracyStmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total_observations
        FROM posts 
        WHERE user_id = ? 
        AND species IS NOT NULL 
        AND observation_date IS NOT NULL
    ");
    $accuracyStmt->execute([$userId]);
    $result = $accuracyStmt->fetch(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($result);
    echo "</pre>";
    
    echo "<h2>✅ All queries passed!</h2>";
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR:</h2>";
    echo "<pre style='color:red'>";
    echo $e->getMessage();
    echo "\n\nStack trace:\n";
    echo $e->getTraceAsString();
    echo "</pre>";
}
?>

