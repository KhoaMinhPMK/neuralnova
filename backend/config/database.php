<?php
/**
 * Database Configuration
 * NeuralNova Backend API
 * 
 * @version 1.0.0
 * @date 2025-10-15
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access not permitted');
}

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'neuralnova');
define('DB_USER', 'root');  // Thay đổi theo config VPS của bạn
define('DB_PASS', '');      // Thay đổi theo config VPS của bạn
define('DB_CHARSET', 'utf8mb4');

/**
 * Get database connection
 * 
 * @return PDO Database connection
 * @throws PDOException
 */
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
            
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new PDOException("Database connection failed");
        }
    }
    
    return $pdo;
}

/**
 * Test database connection
 * 
 * @return bool True if connection successful
 */
function testDBConnection() {
    try {
        $pdo = getDBConnection();
        $pdo->query("SELECT 1");
        return true;
    } catch (Exception $e) {
        error_log("DB Test Failed: " . $e->getMessage());
        return false;
    }
}

