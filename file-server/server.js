const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Tạo thư mục uploads nếu chưa có
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
}

// CORS - cho phép mọi nguồn truy cập
app.use(cors());
app.use(express.json());

// Serve static files (để xem ảnh)
app.use('/uploads', express.static('uploads'));

// Cấu hình upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, timestamp + '-' + Math.random().toString(36).substring(7) + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Max 10MB
});

// ============ API ============

// Health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Server đang chạy!',
        time: new Date().toISOString()
    });
});

// Upload file
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        console.log('📥 Nhận request upload từ:', req.ip);

        if (!req.file) {
            console.log('❌ Không có file trong request');
            return res.status(400).json({
                success: false,
                message: 'Không có file!'
            });
        }

        console.log('✅ Upload thành công:', req.file.filename);

        // Use production domain (IIS reverse proxy)
        const baseUrl = process.env.FILE_SERVER_URL || 'https://files.neuralnova.space';
        const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Upload thành công!',
            file: {
                name: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                url: fileUrl
            }
        });
    } catch (error) {
        console.error('❌ Lỗi khi upload:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server: ' + error.message
        });
    }
});

// Upload nhiều files
app.post('/upload-multiple', upload.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Không có file!'
        });
    }

    const baseUrl = process.env.FILE_SERVER_URL || 'https://files.neuralnova.space';
    const files = req.files.map(file => {
        const fileUrl = `${baseUrl}/uploads/${file.filename}`;
        return {
            name: file.filename,
            originalName: file.originalname,
            size: file.size,
            url: fileUrl
        };
    });

    res.json({
        success: true,
        message: `Upload ${files.length} file thành công!`,
        files: files
    });
});

// Liệt kê files
app.get('/list', (req, res) => {
    const baseUrl = process.env.FILE_SERVER_URL || 'https://files.neuralnova.space';
    const files = fs.readdirSync('uploads').map(filename => {
        const fileUrl = `${baseUrl}/uploads/${filename}`;
        return {
            name: filename,
            url: fileUrl
        };
    });

    res.json({
        success: true,
        count: files.length,
        files: files
    });
});

// Xóa file
app.delete('/delete/:filename', (req, res) => {
    const filePath = path.join('uploads', req.params.filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Đã xóa file!'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'File không tồn tại!'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + err.message
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('===========================================');
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log('===========================================');
    console.log('📡 API Endpoints:');
    console.log(`   POST   /upload              - Upload 1 file`);
    console.log(`   POST   /upload-multiple     - Upload nhiều files`);
    console.log(`   GET    /uploads/:filename   - Xem file`);
    console.log(`   GET    /list                - Liệt kê files`);
    console.log(`   DELETE /delete/:filename    - Xóa file`);
    console.log('===========================================');
});

