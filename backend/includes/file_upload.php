<?php
/**
 * =============================================
 * NeuralNova File Upload Helper
 * Secure file upload for avatars, covers, posts
 * Created: October 15, 2025
 * Phase: 2 - File Upload System
 * =============================================
 */

// Define upload directories (relative to backend root)
define('UPLOAD_BASE', dirname(__DIR__) . '/uploads/');
define('UPLOAD_AVATARS', UPLOAD_BASE . 'avatars/');
define('UPLOAD_COVERS', UPLOAD_BASE . 'covers/');
define('UPLOAD_POSTS', UPLOAD_BASE . 'posts/');

// Maximum file sizes (in bytes)
define('MAX_AVATAR_SIZE', 5 * 1024 * 1024);    // 5 MB
define('MAX_COVER_SIZE', 10 * 1024 * 1024);    // 10 MB
define('MAX_POST_SIZE', 20 * 1024 * 1024);     // 20 MB

// Allowed MIME types
define('ALLOWED_IMAGE_TYPES', [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
]);

define('ALLOWED_VIDEO_TYPES', [
    'video/mp4',
    'video/webm',
    'video/quicktime'
]);

/**
 * Initialize upload directories
 * Create directories if they don't exist
 */
function initUploadDirectories() {
    $dirs = [
        UPLOAD_BASE,
        UPLOAD_AVATARS,
        UPLOAD_COVERS,
        UPLOAD_POSTS
    ];
    
    foreach ($dirs as $dir) {
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }
        
        // Create .htaccess to prevent PHP execution in upload dirs
        $htaccess = $dir . '.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "php_flag engine off\n");
        }
    }
}

/**
 * Upload file with validation
 * 
 * @param array $file - $_FILES array element
 * @param string $type - 'avatar', 'cover', 'post'
 * @param int $userId - User ID for filename generation
 * @return array - ['success' => bool, 'path' => string or 'error' => string]
 */
function uploadFile($file, $type, $userId) {
    // Initialize directories
    initUploadDirectories();
    
    // Validate file upload
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        return [
            'success' => false,
            'error' => 'File upload failed or no file provided'
        ];
    }
    
    // Get file info
    $fileName = $file['name'];
    $fileTmpPath = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileType = mime_content_type($fileTmpPath);
    
    // Determine upload directory and size limit
    switch ($type) {
        case 'avatar':
            $uploadDir = UPLOAD_AVATARS;
            $maxSize = MAX_AVATAR_SIZE;
            $allowedTypes = ALLOWED_IMAGE_TYPES;
            break;
            
        case 'cover':
            $uploadDir = UPLOAD_COVERS;
            $maxSize = MAX_COVER_SIZE;
            $allowedTypes = ALLOWED_IMAGE_TYPES;
            break;
            
        case 'post':
            $uploadDir = UPLOAD_POSTS;
            $maxSize = MAX_POST_SIZE;
            $allowedTypes = array_merge(ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES);
            break;
            
        default:
            return [
                'success' => false,
                'error' => 'Invalid upload type'
            ];
    }
    
    // Validate file type
    if (!in_array($fileType, $allowedTypes)) {
        return [
            'success' => false,
            'error' => 'Invalid file type. Allowed: ' . implode(', ', $allowedTypes)
        ];
    }
    
    // Validate file size
    if ($fileSize > $maxSize) {
        $maxSizeMB = $maxSize / (1024 * 1024);
        return [
            'success' => false,
            'error' => "File too large. Maximum size: {$maxSizeMB} MB"
        ];
    }
    
    // Generate unique filename
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    $timestamp = time();
    $randomString = bin2hex(random_bytes(8));
    $newFileName = "{$type}_{$userId}_{$timestamp}_{$randomString}.{$fileExtension}";
    
    // Full destination path
    $destPath = $uploadDir . $newFileName;
    
    // Move uploaded file
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        // Return relative path (from backend/uploads/)
        $relativePath = str_replace(UPLOAD_BASE, '', $destPath);
        
        return [
            'success' => true,
            'path' => $relativePath,
            'filename' => $newFileName,
            'size' => $fileSize,
            'type' => $fileType
        ];
    } else {
        return [
            'success' => false,
            'error' => 'Failed to move uploaded file'
        ];
    }
}

/**
 * Delete uploaded file
 * 
 * @param string $relativePath - Path relative to uploads directory
 * @return bool - True if deleted, false otherwise
 */
function deleteUploadedFile($relativePath) {
    if (empty($relativePath)) {
        return false;
    }
    
    $fullPath = UPLOAD_BASE . $relativePath;
    
    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }
    
    return false;
}

/**
 * Get file URL for frontend
 * 
 * @param string $relativePath - Path relative to uploads directory
 * @param string $baseUrl - Base URL (e.g., https://neuralnova.space)
 * @return string - Full URL to file
 */
function getFileUrl($relativePath, $baseUrl = null) {
    if (empty($relativePath)) {
        return null;
    }
    
    // Auto-detect base URL if not provided
    if ($baseUrl === null) {
        $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'];
        $baseUrl = "{$protocol}://{$host}";
    }
    
    return $baseUrl . '/backend/uploads/' . $relativePath;
}

/**
 * Validate image dimensions (optional)
 * 
 * @param string $filePath - Full path to image file
 * @param int $minWidth - Minimum width (optional)
 * @param int $minHeight - Minimum height (optional)
 * @param int $maxWidth - Maximum width (optional)
 * @param int $maxHeight - Maximum height (optional)
 * @return array - ['valid' => bool, 'width' => int, 'height' => int, 'error' => string]
 */
function validateImageDimensions($filePath, $minWidth = null, $minHeight = null, $maxWidth = null, $maxHeight = null) {
    $imageInfo = getimagesize($filePath);
    
    if ($imageInfo === false) {
        return [
            'valid' => false,
            'error' => 'Not a valid image'
        ];
    }
    
    $width = $imageInfo[0];
    $height = $imageInfo[1];
    
    // Check minimum dimensions
    if ($minWidth && $width < $minWidth) {
        return [
            'valid' => false,
            'width' => $width,
            'height' => $height,
            'error' => "Image width too small. Minimum: {$minWidth}px"
        ];
    }
    
    if ($minHeight && $height < $minHeight) {
        return [
            'valid' => false,
            'width' => $width,
            'height' => $height,
            'error' => "Image height too small. Minimum: {$minHeight}px"
        ];
    }
    
    // Check maximum dimensions
    if ($maxWidth && $width > $maxWidth) {
        return [
            'valid' => false,
            'width' => $width,
            'height' => $height,
            'error' => "Image width too large. Maximum: {$maxWidth}px"
        ];
    }
    
    if ($maxHeight && $height > $maxHeight) {
        return [
            'valid' => false,
            'width' => $width,
            'height' => $height,
            'error' => "Image height too large. Maximum: {$maxHeight}px"
        ];
    }
    
    return [
        'valid' => true,
        'width' => $width,
        'height' => $height
    ];
}

/**
 * Get file metadata
 * 
 * @param string $relativePath - Path relative to uploads directory
 * @return array|null - File metadata or null if not found
 */
function getFileMetadata($relativePath) {
    if (empty($relativePath)) {
        return null;
    }
    
    $fullPath = UPLOAD_BASE . $relativePath;
    
    if (!file_exists($fullPath)) {
        return null;
    }
    
    $fileInfo = [
        'path' => $relativePath,
        'size' => filesize($fullPath),
        'modified' => filemtime($fullPath),
        'type' => mime_content_type($fullPath)
    ];
    
    // Add image dimensions if it's an image
    if (strpos($fileInfo['type'], 'image/') === 0) {
        $imageInfo = getimagesize($fullPath);
        if ($imageInfo) {
            $fileInfo['width'] = $imageInfo[0];
            $fileInfo['height'] = $imageInfo[1];
        }
    }
    
    return $fileInfo;
}

/**
 * Clean up old files (for cron job or maintenance)
 * 
 * @param int $daysOld - Delete files older than X days
 * @param string $directory - Directory to clean (null = all upload dirs)
 * @return int - Number of files deleted
 */
function cleanupOldFiles($daysOld = 30, $directory = null) {
    $dirs = $directory ? [$directory] : [
        UPLOAD_AVATARS,
        UPLOAD_COVERS,
        UPLOAD_POSTS
    ];
    
    $deletedCount = 0;
    $cutoffTime = time() - ($daysOld * 24 * 60 * 60);
    
    foreach ($dirs as $dir) {
        $files = glob($dir . '*');
        
        foreach ($files as $file) {
            if (is_file($file) && filemtime($file) < $cutoffTime) {
                if (unlink($file)) {
                    $deletedCount++;
                }
            }
        }
    }
    
    return $deletedCount;
}

