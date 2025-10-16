<?php
// Debug avatar upload with actual file simulation
define('API_ACCESS', true);
require_once '../config/database.php';
require_once '../includes/session.php';
require_once '../includes/file_upload.php';

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Avatar Upload Debug</h1>";

// Start session
session_start();
$_SESSION['user_id'] = 5;
$_SESSION['user_email'] = 'khoaminh@gmail.com';
$_SESSION['last_activity'] = time();

echo "<p>User ID: " . $_SESSION['user_id'] . "</p>";

// Check upload directory
echo "<h2>Upload Directory Check:</h2>";
echo "<p>UPLOAD_AVATARS: " . UPLOAD_AVATARS . "</p>";
echo "<p>Directory exists: " . (is_dir(UPLOAD_AVATARS) ? '✅ YES' : '❌ NO') . "</p>";
echo "<p>Writable: " . (is_writable(UPLOAD_AVATARS) ? '✅ YES' : '❌ NO') . "</p>";

// Check validation rules
echo "<h2>Validation Rules:</h2>";
echo "<ul>";
echo "<li>Min width: 100px</li>";
echo "<li>Max width: 2000px</li>";
echo "<li>Min height: 100px</li>";
echo "<li>Max height: 2000px</li>";
echo "<li>Max size: 5MB</li>";
echo "<li>Types: JPEG, PNG, GIF, WebP</li>";
echo "</ul>";

echo "<h2>Upload Form (Test with actual file):</h2>";
echo '<form method="POST" enctype="multipart/form-data" style="border:2px solid #ccc;padding:20px;background:#f5f5f5">';
echo '<input type="file" name="avatar" accept="image/*" style="margin:10px 0">';
echo '<button type="submit" name="test_upload" style="padding:10px 20px;background:#4CAF50;color:white;border:none;cursor:pointer">Test Upload</button>';
echo '</form>';

// Process upload if submitted
if (isset($_POST['test_upload']) && isset($_FILES['avatar'])) {
    echo "<h2>Upload Result:</h2>";
    
    $file = $_FILES['avatar'];
    
    echo "<h3>File Info:</h3>";
    echo "<pre>";
    echo "Name: " . $file['name'] . "\n";
    echo "Type: " . $file['type'] . "\n";
    echo "Size: " . $file['size'] . " bytes (" . round($file['size'] / 1024 / 1024, 2) . " MB)\n";
    echo "Tmp: " . $file['tmp_name'] . "\n";
    echo "Error: " . $file['error'] . "\n";
    echo "</pre>";
    
    // Get image dimensions
    $imageInfo = getimagesize($file['tmp_name']);
    if ($imageInfo) {
        echo "<h3>Image Dimensions:</h3>";
        echo "<pre>";
        echo "Width: " . $imageInfo[0] . "px\n";
        echo "Height: " . $imageInfo[1] . "px\n";
        echo "Type: " . $imageInfo['mime'] . "\n";
        echo "</pre>";
        
        // Check validation
        echo "<h3>Validation Check:</h3>";
        $validation = validateImageDimensions($file['tmp_name'], 100, 100, 2000, 2000);
        echo "<pre>";
        print_r($validation);
        echo "</pre>";
        
        if (!$validation['valid']) {
            echo "<p style='color:red;font-weight:bold'>❌ VALIDATION FAILED: " . $validation['error'] . "</p>";
            echo "<p>Your image: " . $validation['width'] . "x" . $validation['height'] . "px</p>";
            echo "<p>Required: 100x100 to 2000x2000 pixels</p>";
        } else {
            echo "<p style='color:green;font-weight:bold'>✅ VALIDATION PASSED</p>";
            
            // Try actual upload
            echo "<h3>Upload Test:</h3>";
            $result = uploadFile($file, 'avatar', $_SESSION['user_id']);
            echo "<pre>";
            print_r($result);
            echo "</pre>";
        }
    } else {
        echo "<p style='color:red'>❌ Not a valid image</p>";
    }
}

echo "<hr>";
echo "<p><strong>Instructions:</strong></p>";
echo "<ol>";
echo "<li>Choose an image file (JPEG, PNG, GIF, WebP)</li>";
echo "<li>Image should be 100x100 to 2000x2000 pixels</li>";
echo "<li>File size < 5MB</li>";
echo "<li>Click 'Test Upload'</li>";
echo "<li>See detailed validation results</li>";
echo "</ol>";
?>

