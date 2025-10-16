/**
 * NeuralNova File Upload Server - HTTPS Version
 * Handles image/video uploads with optimization
 * Port: 3000 (HTTPS)
 */

const express = require('express');
const https = require('https');
const http = require('http');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
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
  credentials: true
}));

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, error: 'Too many requests, please try again later' }
});
app.use('/upload', limiter);

// ===== Storage Configuration =====
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [...config.allowedImageTypes, ...config.allowedVideoTypes];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(
      config.maxFileSize.avatar,
      config.maxFileSize.cover,
      config.maxFileSize.post
    )
  }
});

// ===== Helper Functions =====
async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function optimizeImage(buffer, options) {
  let pipeline = sharp(buffer);
  
  if (options.width && options.height) {
    pipeline = pipeline.resize(options.width, options.height, {
      fit: 'cover',
      position: 'center'
    });
  } else if (options.maxWidth || options.maxHeight) {
    pipeline = pipeline.resize(options.maxWidth, options.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }
  
  return pipeline
    .webp({ quality: options.quality || 85 })
    .toBuffer();
}

// ===== Routes =====

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    protocol: 'https',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Avatar upload
app.post('/upload/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (req.file.size > config.maxFileSize.avatar) {
      return res.status(413).json({
        success: false,
        error: `File too large. Max size: ${config.maxFileSize.avatar / 1024 / 1024}MB`
      });
    }

    const uploadsDir = path.join(__dirname, config.uploadPath, 'avatars');
    await ensureDir(uploadsDir);

    const filename = `avatar-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    const optimized = await optimizeImage(req.file.buffer, config.imageOptimization.avatar);
    await fs.writeFile(filepath, optimized);

    const fileUrl = `${config.publicUrl}/avatars/${filename}`;
    const stats = await fs.stat(filepath);

    res.json({
      success: true,
      file: {
        url: fileUrl,
        filename,
        size: stats.size,
        type: 'image/webp',
        dimensions: config.imageOptimization.avatar
      }
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cover upload
app.post('/upload/cover', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (req.file.size > config.maxFileSize.cover) {
      return res.status(413).json({
        success: false,
        error: `File too large. Max size: ${config.maxFileSize.cover / 1024 / 1024}MB`
      });
    }

    const uploadsDir = path.join(__dirname, config.uploadPath, 'covers');
    await ensureDir(uploadsDir);

    const filename = `cover-${Date.now()}.webp`;
    const filepath = path.join(uploadsDir, filename);

    const optimized = await optimizeImage(req.file.buffer, config.imageOptimization.cover);
    await fs.writeFile(filepath, optimized);

    const fileUrl = `${config.publicUrl}/covers/${filename}`;
    const stats = await fs.stat(filepath);

    res.json({
      success: true,
      file: {
        url: fileUrl,
        filename,
        size: stats.size,
        type: 'image/webp',
        dimensions: config.imageOptimization.cover
      }
    });
  } catch (error) {
    console.error('Cover upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Post media upload
app.post('/upload/post', upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    if (req.file.size > config.maxFileSize.post) {
      return res.status(413).json({
        success: false,
        error: `File too large. Max size: ${config.maxFileSize.post / 1024 / 1024}MB`
      });
    }

    const isVideo = config.allowedVideoTypes.includes(req.file.mimetype);
    const subfolder = isVideo ? 'videos' : 'images';
    const uploadsDir = path.join(__dirname, config.uploadPath, 'posts', subfolder);
    await ensureDir(uploadsDir);

    let filename, filepath, fileUrl;

    if (isVideo) {
      const ext = path.extname(req.file.originalname) || '.mp4';
      filename = `video-${Date.now()}${ext}`;
      filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, req.file.buffer);
      fileUrl = `${config.publicUrl}/posts/videos/${filename}`;
    } else {
      filename = `post-${Date.now()}.webp`;
      filepath = path.join(uploadsDir, filename);
      const optimized = await optimizeImage(req.file.buffer, config.imageOptimization.post);
      await fs.writeFile(filepath, optimized);
      fileUrl = `${config.publicUrl}/posts/images/${filename}`;
    }

    const stats = await fs.stat(filepath);

    res.json({
      success: true,
      file: {
        url: fileUrl,
        filename,
        size: stats.size,
        type: isVideo ? req.file.mimetype : 'image/webp'
      }
    });
  } catch (error) {
    console.error('Post media upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, config.uploadPath), {
  maxAge: '1y',
  setHeaders: (res) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// ===== HTTPS Server Setup =====

// SSL Certificate paths - CUSTOMIZE THESE!
const SSL_PATHS = {
  // Option 1: XAMPP default (if using XAMPP)
  xampp: {
    key: 'C:\\xampp\\apache\\conf\\ssl.key\\server.key',
    cert: 'C:\\xampp\\apache\\conf\\ssl.crt\\server.crt'
  },
  // Option 2: Let's Encrypt / Certbot
  letsencrypt: {
    key: 'C:\\Certbot\\live\\neuralnova.space\\privkey.pem',
    cert: 'C:\\Certbot\\live\\neuralnova.space\\fullchain.pem'
  },
  // Option 3: Custom location
  custom: {
    key: process.env.SSL_KEY_PATH || 'C:\\ssl\\neuralnova.key',
    cert: process.env.SSL_CERT_PATH || 'C:\\ssl\\neuralnova.crt'
  }
};

function tryLoadSSL() {
  // Try each SSL path option
  for (const [name, paths] of Object.entries(SSL_PATHS)) {
    try {
      if (fsSync.existsSync(paths.key) && fsSync.existsSync(paths.cert)) {
        console.log(`✅ Found SSL certificates: ${name}`);
        console.log(`   Key:  ${paths.key}`);
        console.log(`   Cert: ${paths.cert}`);
        return {
          key: fsSync.readFileSync(paths.key),
          cert: fsSync.readFileSync(paths.cert)
        };
      }
    } catch (err) {
      console.log(`❌ Cannot load SSL from ${name}:`, err.message);
    }
  }
  return null;
}

// Start server
const PORT = process.env.PORT || 3000;

const sslOptions = tryLoadSSL();

if (sslOptions) {
  // HTTPS server
  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log('━'.repeat(60));
    console.log('🔒 NeuralNova File Server - HTTPS Mode');
    console.log('━'.repeat(60));
    console.log(`✅ Server running on: https://neuralnova.space:${PORT}`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, config.uploadPath)}`);
    console.log(`🔗 Public URL: ${config.publicUrl}`);
    console.log(`📊 Max file sizes:`);
    console.log(`   - Avatar: ${config.maxFileSize.avatar / 1024 / 1024}MB`);
    console.log(`   - Cover: ${config.maxFileSize.cover / 1024 / 1024}MB`);
    console.log(`   - Post: ${config.maxFileSize.post / 1024 / 1024}MB`);
    console.log('━'.repeat(60));
    console.log(`🧪 Test: https://neuralnova.space:${PORT}/health`);
    console.log('━'.repeat(60));
  });
} else {
  // Fallback to HTTP with warning
  console.warn('⚠️  SSL certificates not found! Starting HTTP server...');
  console.warn('⚠️  This will cause Mixed Content errors on HTTPS pages!');
  console.warn('');
  console.warn('To fix:');
  console.warn('1. Edit SSL_PATHS in server-https.js with your SSL certificate locations');
  console.warn('2. Restart the server');
  console.warn('');
  
  http.createServer(app).listen(PORT, () => {
    console.log('━'.repeat(60));
    console.log('🔓 NeuralNova File Server - HTTP Mode (FALLBACK)');
    console.log('━'.repeat(60));
    console.log(`⚠️  Server running on: http://neuralnova.space:${PORT}`);
    console.log(`📁 Uploads directory: ${path.join(__dirname, config.uploadPath)}`);
    console.log('━'.repeat(60));
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

