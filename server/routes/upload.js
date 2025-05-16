import express from 'express';
import { uploadMenuImage } from '../controllers/upload.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 确保上传目录存在
const menuUploadDir = path.join(rootDir, 'src/assets/menu');
if (!fs.existsSync(menuUploadDir)) {
    fs.mkdirSync(menuUploadDir, { recursive: true });
    console.log('Upload route: 创建菜单图片目录:', menuUploadDir);
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 确保目录存在
        if (!fs.existsSync(menuUploadDir)) {
            fs.mkdirSync(menuUploadDir, { recursive: true });
        }
        cb(null, menuUploadDir);
    },
    filename: function (req, file, cb) {
        // 清理原始文件名，移除特殊字符
        const cleanName = path.basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_'); // 保留字母、数字、下划线和中文

        // 生成文件名: 时间戳 + 随机字符串 + 清理后的名称 + 原始扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'menu-' + uniqueSuffix + '-' + cleanName + ext);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 只接受jpeg和png
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('只允许上传 JPEG 或 PNG 格式的图片!'), false);
    }
};

// 创建上传中间件
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 限制为2MB
    }
});

// 处理上传错误的中间件
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // 处理Multer错误
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件大小不能超过2MB' });
        }
        return res.status(400).json({ error: `上传错误: ${err.message}` });
    } else if (err) {
        // 处理其他错误
        return res.status(500).json({ error: err.message });
    }
    // 无错误，继续
    next();
};

// 测试上传端点 - 不需要认证，方便前端开发调试
router.post('/test', upload.single('image'), handleUploadErrors, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: '未找到上传的文件' });
        }

        // 构建相对路径
        const relativePath = `/assets/menu/${req.file.filename}`;

        res.status(200).json({
            success: true,
            fileName: req.file.filename,
            url: relativePath,
            message: '测试上传成功（开发模式）'
        });
    } catch (error) {
        console.error('测试上传异常:', error);
        res.status(500).json({ error: error.message || '测试上传失败' });
    }
});

// 菜品图片上传路由 (仅管理员)
router.post('/menu', authenticateJWT, isAdmin, upload.single('image'), handleUploadErrors, uploadMenuImage);

export default router; 