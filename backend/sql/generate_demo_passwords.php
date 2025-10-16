<?php
/**
 * Generate Password Hashes for Demo Accounts
 * Run: php generate_demo_passwords.php
 */

$demoPassword = "Demo123!";

echo "===========================================\n";
echo "Demo Password Hash Generator\n";
echo "===========================================\n\n";

echo "Password: $demoPassword\n\n";

// Generate 10 different hashes (each will be unique due to salt)
echo "Copy one of these hashes into your SQL file:\n\n";

for ($i = 1; $i <= 5; $i++) {
    $hash = password_hash($demoPassword, PASSWORD_BCRYPT);
    echo "$i. '$hash'\n\n";
}

echo "===========================================\n";
echo "Update SQL file:\n";
echo "Find: \$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi\n";
echo "Replace with one of the hashes above\n";
echo "===========================================\n\n";

// Test verification
$testHash = password_hash($demoPassword, PASSWORD_BCRYPT);
$verify = password_verify($demoPassword, $testHash);

echo "Verification test: " . ($verify ? "✅ PASS" : "❌ FAIL") . "\n\n";

echo "All demo accounts will use this password: $demoPassword\n";
?>

