<?php
/**
 * Database Test Script
 * Kiểm tra kết nối database và tables
 */

// Database config
$host = 'localhost';
$dbname = 'neuralnova';
$user = 'root';
$pass = '123456';

echo "🔍 TESTING DATABASE CONNECTION...\n";
echo "================================\n\n";

try {
    // 1. Test connection
    echo "1️⃣ Testing MySQL connection...\n";
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "   ✅ Connected to MySQL successfully!\n\n";
    
    // 2. Check if database exists
    echo "2️⃣ Checking if database '$dbname' exists...\n";
    $stmt = $pdo->query("SHOW DATABASES LIKE '$dbname'");
    $dbExists = $stmt->fetch();
    
    if (!$dbExists) {
        echo "   ❌ Database '$dbname' NOT FOUND!\n";
        echo "   👉 Solution: Run COMPLETE_DATABASE_SETUP.sql in phpMyAdmin\n\n";
        exit;
    }
    echo "   ✅ Database '$dbname' exists!\n\n";
    
    // 3. Connect to database
    echo "3️⃣ Connecting to database '$dbname'...\n";
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "   ✅ Connected to database successfully!\n\n";
    
    // 4. Check tables
    echo "4️⃣ Checking tables...\n";
    $requiredTables = ['users', 'posts', 'reactions', 'comments', 'activities'];
    $stmt = $pdo->query("SHOW TABLES");
    $existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "   Found tables:\n";
    foreach ($existingTables as $table) {
        echo "   - $table\n";
    }
    echo "\n";
    
    $missingTables = array_diff($requiredTables, $existingTables);
    if (!empty($missingTables)) {
        echo "   ⚠️ Missing tables: " . implode(', ', $missingTables) . "\n";
        echo "   👉 Solution: Run COMPLETE_DATABASE_SETUP.sql in phpMyAdmin\n\n";
    } else {
        echo "   ✅ All required tables exist!\n\n";
    }
    
    // 5. Check users table structure
    echo "5️⃣ Checking users table structure...\n";
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $requiredColumns = ['id', 'full_name', 'email', 'password', 'created_at'];
    $missingColumns = array_diff($requiredColumns, $columns);
    
    if (!empty($missingColumns)) {
        echo "   ⚠️ Missing columns in users table: " . implode(', ', $missingColumns) . "\n\n";
    } else {
        echo "   ✅ Users table structure is correct!\n\n";
    }
    
    // 6. Check test user
    echo "6️⃣ Checking test user...\n";
    $stmt = $pdo->query("SELECT id, full_name, email FROM users WHERE email = 'test@neuralnova.space'");
    $testUser = $stmt->fetch();
    
    if ($testUser) {
        echo "   ✅ Test user exists:\n";
        echo "      - ID: {$testUser['id']}\n";
        echo "      - Name: {$testUser['full_name']}\n";
        echo "      - Email: {$testUser['email']}\n";
        echo "      - Password: Test@123\n\n";
    } else {
        echo "   ⚠️ Test user NOT found!\n";
        echo "   👉 Solution: Run COMPLETE_DATABASE_SETUP.sql in phpMyAdmin\n\n";
    }
    
    // 7. Count records
    echo "7️⃣ Counting records...\n";
    foreach ($requiredTables as $table) {
        if (in_array($table, $existingTables)) {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "   - $table: $count records\n";
        }
    }
    echo "\n";
    
    echo "================================\n";
    echo "✅ DATABASE CHECK COMPLETE!\n";
    echo "================================\n\n";
    
    if (empty($missingTables) && empty($missingColumns) && $testUser) {
        echo "🎉 Everything looks good! You can proceed with registration.\n";
    } else {
        echo "⚠️ Please fix the issues above before continuing.\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n\n";
    
    if (strpos($e->getMessage(), 'Access denied') !== false) {
        echo "👉 Solution: Check database username and password in config/database.php\n";
        echo "   Current: user='$user', pass='$pass'\n";
    } else if (strpos($e->getMessage(), 'Unknown database') !== false) {
        echo "👉 Solution: Run COMPLETE_DATABASE_SETUP.sql in phpMyAdmin to create database\n";
    }
}
