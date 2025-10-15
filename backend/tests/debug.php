<?php
/**
 * Debug Script - Check Database Connection & Configuration
 */

// Enable error display
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// 1. Check PHP Version
$results['checks']['php_version'] = [
    'status' => version_compare(PHP_VERSION, '7.0.0', '>=') ? 'OK' : 'FAIL',
    'value' => PHP_VERSION,
    'message' => 'PHP version must be >= 7.0'
];

// 2. Check PDO Extension
$results['checks']['pdo_extension'] = [
    'status' => extension_loaded('pdo') ? 'OK' : 'FAIL',
    'message' => 'PDO extension required'
];

// 3. Check MySQL PDO Driver
$results['checks']['pdo_mysql'] = [
    'status' => extension_loaded('pdo_mysql') ? 'OK' : 'FAIL',
    'message' => 'PDO MySQL driver required'
];

// 4. Database Configuration
$db_config = [
    'host' => 'localhost',
    'name' => 'neuralnova',
    'user' => 'root',
    'pass' => ''
];

$results['checks']['db_config'] = [
    'status' => 'INFO',
    'value' => [
        'host' => $db_config['host'],
        'database' => $db_config['name'],
        'user' => $db_config['user'],
        'password' => empty($db_config['pass']) ? 'empty' : 'set'
    ]
];

// 5. Test Database Connection
try {
    $dsn = "mysql:host={$db_config['host']};charset=utf8mb4";
    $pdo = new PDO($dsn, $db_config['user'], $db_config['pass']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $results['checks']['db_connection'] = [
        'status' => 'OK',
        'message' => 'Connected to MySQL server'
    ];
    
    // 6. Check if database exists
    $stmt = $pdo->query("SHOW DATABASES LIKE '{$db_config['name']}'");
    $dbExists = $stmt->rowCount() > 0;
    
    $results['checks']['database_exists'] = [
        'status' => $dbExists ? 'OK' : 'FAIL',
        'message' => $dbExists ? "Database '{$db_config['name']}' exists" : "Database '{$db_config['name']}' NOT FOUND"
    ];
    
    if ($dbExists) {
        // 7. Connect to specific database
        $pdo = new PDO("mysql:host={$db_config['host']};dbname={$db_config['name']};charset=utf8mb4", 
                       $db_config['user'], $db_config['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // 8. Check if users table exists
        $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
        $tableExists = $stmt->rowCount() > 0;
        
        $results['checks']['users_table'] = [
            'status' => $tableExists ? 'OK' : 'FAIL',
            'message' => $tableExists ? 'Users table exists' : 'Users table NOT FOUND - Please import backend/sql/001_users_table.sql'
        ];
        
        if ($tableExists) {
            // 9. Check table structure
            $stmt = $pdo->query("DESCRIBE users");
            $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $requiredColumns = ['id', 'full_name', 'email', 'password', 'status', 'created_at'];
            $missingColumns = array_diff($requiredColumns, $columns);
            
            $results['checks']['table_structure'] = [
                'status' => empty($missingColumns) ? 'OK' : 'FAIL',
                'columns' => $columns,
                'missing_columns' => array_values($missingColumns),
                'message' => empty($missingColumns) ? 'All required columns exist' : 'Missing columns detected'
            ];
            
            // 10. Count users
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $results['checks']['user_count'] = [
                'status' => 'INFO',
                'value' => $count,
                'message' => "{$count} user(s) in database"
            ];
            
            // 11. List users (last 5)
            $stmt = $pdo->query("SELECT id, full_name, email, status, created_at FROM users ORDER BY id DESC LIMIT 5");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $results['checks']['recent_users'] = [
                'status' => 'INFO',
                'value' => $users,
                'message' => 'Recent users'
            ];
        }
    }
    
} catch (PDOException $e) {
    $results['checks']['db_connection'] = [
        'status' => 'FAIL',
        'error' => $e->getMessage(),
        'message' => 'Database connection failed'
    ];
}

// 12. Check session configuration
$results['checks']['session_config'] = [
    'status' => 'INFO',
    'value' => [
        'session.save_path' => session_save_path(),
        'session.cookie_httponly' => ini_get('session.cookie_httponly'),
        'session.use_only_cookies' => ini_get('session.use_only_cookies'),
    ]
];

// 13. Test write permissions
$testFile = __DIR__ . '/test_write_permission.txt';
try {
    file_put_contents($testFile, 'test');
    $canWrite = file_exists($testFile);
    if ($canWrite) {
        unlink($testFile);
    }
    $results['checks']['write_permission'] = [
        'status' => $canWrite ? 'OK' : 'FAIL',
        'message' => $canWrite ? 'Directory is writable' : 'Directory is NOT writable'
    ];
} catch (Exception $e) {
    $results['checks']['write_permission'] = [
        'status' => 'FAIL',
        'error' => $e->getMessage()
    ];
}

// Summary
$failCount = 0;
$okCount = 0;
foreach ($results['checks'] as $check) {
    if (isset($check['status'])) {
        if ($check['status'] === 'FAIL') $failCount++;
        if ($check['status'] === 'OK') $okCount++;
    }
}

$results['summary'] = [
    'total_checks' => count($results['checks']),
    'passed' => $okCount,
    'failed' => $failCount,
    'overall_status' => $failCount > 0 ? 'ISSUES DETECTED' : 'ALL CHECKS PASSED'
];

// Output
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

