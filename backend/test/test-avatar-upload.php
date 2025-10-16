<?php
// Test avatar upload validation
define('API_ACCESS', true);
require_once '../config/database.php';
require_once '../includes/session.php';
require_once '../includes/file_upload.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Testing Avatar Upload Validation</h1>";

// Check if validateImageDimensions function exists
if (function_exists('validateImageDimensions')) {
    echo "<p>✅ validateImageDimensions function exists</p>";
} else {
    echo "<p>❌ validateImageDimensions function NOT found</p>";
}

// Check if deleteUploadedFile function exists
if (function_exists('deleteUploadedFile')) {
    echo "<p>✅ deleteUploadedFile function exists</p>";
} else {
    echo "<p>❌ deleteUploadedFile function NOT found</p>";
}

// Check if getFileUrl function exists
if (function_exists('getFileUrl')) {
    echo "<p>✅ getFileUrl function exists</p>";
} else {
    echo "<p>❌ getFileUrl function NOT found</p>";
}

// List all functions in file_upload.php
echo "<h2>Available functions from file_upload.php:</h2>";
echo "<pre>";
$functions = get_defined_functions()['user'];
foreach ($functions as $func) {
    if (strpos($func, 'upload') !== false || strpos($func, 'file') !== false || strpos($func, 'image') !== false) {
        echo "- " . $func . "\n";
    }
}
echo "</pre>";

// Check upload directories
echo "<h2>Upload Directories:</h2>";
$dirs = [
    'UPLOAD_BASE' => defined('UPLOAD_BASE') ? UPLOAD_BASE : 'NOT DEFINED',
    'UPLOAD_AVATARS' => defined('UPLOAD_AVATARS') ? UPLOAD_AVATARS : 'NOT DEFINED',
    'UPLOAD_COVERS' => defined('UPLOAD_COVERS') ? UPLOAD_COVERS : 'NOT DEFINED',
];

echo "<pre>";
print_r($dirs);
echo "</pre>";

echo "<h2>Test Complete</h2>";
?>

