/**
 * NeuralNova File Upload Server
 * Handles image/video uploads with optimization
 * Port: 3000
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const config = require('./config');

const app = express();

// ===== Middleware =====
app.use(helmet());
app.use(compression());

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || config.allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, error: 'Too many requests, please try again later' }
});

app.use('/upload', limiter);

// Static files
app.use('/uploads', express.static('uploads'));

// ===== Upload Storage =====
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const type = req.baseUrl.includes('avatar') ? 'avatars' :
                 req.baseUrl.includes('cover') ? 'covers' : 'posts';
    const dir = path.join(config.uploadPath, type);
    
    try {
      await fs.mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize.post // Max for all types
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [...config.allowedImageTypes, ...config.allowedVideoTypes];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos allowed.'));
    }
  }
});

// ===== Routes =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Upload Avatar
app.post('/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const optimizedFilename = `avatar-${Date.now()}.webp`;
    const optimizedPath = path.join(config.uploadPath, 'avatars', optimizedFilename);

    // Optimize image with Sharp
    await sharp(file.path)
      .resize(config.imageOptimization.avatar.width, config.imageOptimization.avatar.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: config.imageOptimization.avatar.quality })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(file.path);

    // Return URL
    const fileUrl = `${config.publicUrl}/avatars/${optimizedFilename}`;

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      file: {
        url: fileUrl,
        filename: optimizedFilename,
        size: (await fs.stat(optimizedPath)).size,
        type: 'image/webp',
        dimensions: {
          width: config.imageOptimization.avatar.width,
          height: config.imageOptimization.avatar.height
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload Cover
app.post('/upload/cover', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const optimizedFilename = `cover-${Date.now()}.webp`;
    const optimizedPath = path.join(config.uploadPath, 'covers', optimizedFilename);

    // Optimize image with Sharp
    await sharp(file.path)
      .resize(config.imageOptimization.cover.width, config.imageOptimization.cover.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: config.imageOptimization.cover.quality })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(file.path);

    // Return URL
    const fileUrl = `${config.publicUrl}/covers/${optimizedFilename}`;

    res.json({
      success: true,
      message: 'Cover photo uploaded successfully',
      file: {
        url: fileUrl,
        filename: optimizedFilename,
        size: (await fs.stat(optimizedPath)).size,
        type: 'image/webp',
        dimensions: {
          width: config.imageOptimization.cover.width,
          height: config.imageOptimization.cover.height
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload Post Media (Image/Video)
app.post('/upload/post', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith('video/');
    
    if (isVideo) {
      // For videos, just move to uploads (no processing)
      const filename = `post-video-${Date.now()}${path.extname(file.originalname)}`;
      const finalPath = path.join(config.uploadPath, 'posts', filename);
      
      await fs.rename(file.path, finalPath);
      
      const fileUrl = `${config.publicUrl}/posts/${filename}`;
      
      res.json({
        success: true,
        message: 'Video uploaded successfully',
        file: {
          url: fileUrl,
          filename: filename,
          size: file.size,
          type: file.mimetype
        },
        timestamp: new Date().toISOString()
      });
    } else {
      // For images, optimize
      const optimizedFilename = `post-${Date.now()}.webp`;
      const optimizedPath = path.join(config.uploadPath, 'posts', optimizedFilename);

      // Get original dimensions
      const metadata = await sharp(file.path).metadata();
      
      // Resize if too large
      let sharpInstance = sharp(file.path);
      
      if (metadata.width > config.imageOptimization.post.maxWidth || 
          metadata.height > config.imageOptimization.post.maxHeight) {
        sharpInstance = sharpInstance.resize(
          config.imageOptimization.post.maxWidth,
          config.imageOptimization.post.maxHeight,
          { fit: 'inside', withoutEnlargement: true }
        );
      }

      await sharpInstance
        .webp({ quality: config.imageOptimization.post.quality })
        .toFile(optimizedPath);

      // Delete original
      await fs.unlink(file.path);

      const fileUrl = `${config.publicUrl}/posts/${optimizedFilename}`;

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        file: {
          url: fileUrl,
          filename: optimizedFilename,
          size: (await fs.stat(optimizedPath)).size,
          type: 'image/webp',
          original_dimensions: {
            width: metadata.width,
            height: metadata.height
          }
        },
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Post media upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Delete file
app.delete('/delete/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const allowedTypes = ['avatars', 'covers', 'posts'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid type'
      });
    }

    const filePath = path.join(config.uploadPath, type, filename);
    
    try {
      await fs.unlink(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Delete failed'
    });
  }
});

// Get file info
app.get('/info/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;
    const filePath = path.join(config.uploadPath, type, filename);
    
    const stats = await fs.stat(filePath);
    
    res.json({
      success: true,
      file: {
        filename: filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      }
    });

  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large',
        maxSize: error.field === 'avatar' ? '5MB' : error.field === 'cover' ? '10MB' : '50MB'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: 'Server error',
    message: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ===== Start Server =====
const PORT = config.port;

app.listen(PORT, () => {
  console.log('━'.repeat(50));
  console.log(`🚀 NeuralNova File Server`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📁 Upload path: ${config.uploadPath}`);
  console.log(`🔗 Public URL: ${config.publicUrl}`);
  console.log('━'.repeat(50));
  console.log('');
  console.log('Endpoints:');
  console.log('  POST /upload/avatar   - Upload avatar (max 5MB)');
  console.log('  POST /upload/cover    - Upload cover (max 10MB)');
  console.log('  POST /upload/post     - Upload post media (max 50MB)');
  console.log('  DELETE /delete/:type/:filename');
  console.log('  GET /info/:type/:filename');
  console.log('  GET /health');
  console.log('');
  console.log('✅ Server ready!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

