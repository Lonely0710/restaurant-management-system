import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

// 处理菜品图片上传
export const uploadMenuImage = async (req, res) => {
    try {
        if (!req.file) {
            console.error('未找到上传的文件');
            return res.status(400).json({ error: '未找到上传的文件' });
        }

        // 确保目录存在
        const menuUploadDir = path.join(rootDir, 'src/assets/menu');
        if (!fs.existsSync(menuUploadDir)) {
            fs.mkdirSync(menuUploadDir, { recursive: true });
            console.log('创建菜单图片目录:', menuUploadDir);
        }

        console.log('上传文件信息:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            encoding: req.file.encoding,
            mimetype: req.file.mimetype,
            destination: req.file.destination,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size
        });

        // 构建相对路径 - 这是前端能访问到的路径
        const relativePath = `/assets/menu/${req.file.filename}`;

        // 返回文件信息
        res.status(200).json({
            success: true,
            fileName: req.file.filename,
            url: relativePath,
            message: '图片上传成功'
        });
    } catch (error) {
        console.error('图片上传异常:', error);
        res.status(500).json({
            error: error.message || '图片上传失败',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 