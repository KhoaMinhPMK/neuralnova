// Configuration for NeuralNova File Server
module.exports = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // CORS
  allowedOrigins: [
    'https://neuralnova.space',
    'http://neuralnova.space',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://localhost:3000'
  ],

  // Upload Limits (bytes)
  maxFileSize: {
    avatar: 5 * 1024 * 1024,      // 5MB
    cover: 10 * 1024 * 1024,      // 10MB
    post: 50 * 1024 * 1024        // 50MB
  },

  // Image Processing
  imageOptimization: {
    avatar: {
      width: 500,
      height: 500,
      quality: 90
    },
    cover: {
      width: 1200,
      height: 400,
      quality: 85
    },
    post: {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85
    }
  },

  // Storage
  uploadPath: './uploads',
  publicUrl: process.env.PUBLIC_URL || 'https://neuralnova.space:3000/uploads',

  // Security
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // max requests per window
  },

  // Allowed file types
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/quicktime']
};

