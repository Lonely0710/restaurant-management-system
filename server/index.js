console.log('Node.js server process started.');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 导入路由
import categoryRoutes from './routes/categories.js';
import menuRoutes from './routes/menu.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import testRoutes from './routes/testRoutes.js';

// 导入数据库连接测试函数
import { testConnection } from './config/db.js';

dotenv.config();

// 获取项目根目录的绝对路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 确保assets目录存在
const assetsDir = path.join(rootDir, 'src/assets');
const menuAssetsDir = path.join(assetsDir, 'menu');

try {
    if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
        console.log('创建assets目录:', assetsDir);
    }

    if (!fs.existsSync(menuAssetsDir)) {
        fs.mkdirSync(menuAssetsDir, { recursive: true });
        console.log('创建菜单图片目录:', menuAssetsDir);
    }
} catch (error) {
    console.error('创建目录失败:', error);
}

const app = express();
// 忽略全局PORT变量，明确使用3001端口
const BACKEND_PORT = process.env.BACKEND_PORT || 3001;

console.log(`后端API服务器将启动在端口 ${BACKEND_PORT}...`);

// Middleware
app.use(cors({
    origin: '*', // 允许所有来源访问
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 设置静态文件目录，使客户端可以访问上传的图片
app.use('/assets', express.static(path.join(rootDir, 'src/assets')));

// 测试静态文件服务
app.get('/api/check-assets', (req, res) => {
    try {
        const assetsExists = fs.existsSync(assetsDir);
        const menuDirExists = fs.existsSync(menuAssetsDir);

        res.json({
            message: '静态文件服务检查',
            assetsDirectory: {
                path: assetsDir,
                exists: assetsExists
            },
            menuDirectory: {
                path: menuAssetsDir,
                exists: menuDirExists
            }
        });
    } catch (error) {
        res.status(500).json({
            error: '检查静态文件服务失败',
            details: error.message
        });
    }
});

// 测试数据库连接
app.get('/api/test', async (req, res) => {
    try {
        const result = await testConnection();
        res.json({
            message: '数据库连接正常',
            result
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            message: '数据库连接失败',
            error: error.message
        });
    }
});

// 注册路由
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/test/concurrency', testRoutes);

// 处理404路由
app.use((req, res) => {
    res.status(404).json({ error: '请求的资源不存在', path: req.path });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误', message: err.message });
});

// 验证API可访问性
app.get('/api', (req, res) => {
    res.json({ message: 'API服务器运行正常', timestamp: new Date().toISOString() });
});

// Start server - 使用0.0.0.0绑定到所有网络接口
try {
    const server = app.listen(BACKEND_PORT, '0.0.0.0', () => {
        console.log(`后端API服务器成功启动在 http://localhost:${BACKEND_PORT}`);
        console.log(`可通过 http://localhost:${BACKEND_PORT}/api 访问测试`);
        console.log(`静态文件服务已配置，可通过 http://localhost:${BACKEND_PORT}/assets 访问`);
    });

    // 添加错误处理
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`错误：端口 ${BACKEND_PORT} 已被占用，请修改端口或终止占用进程`);
        } else {
            console.error('服务器启动错误:', error);
        }
        process.exit(1);
    });
} catch (error) {
    console.error('启动服务器时发生严重错误:', error);
    process.exit(1);
}

// 测试数据库连接
testConnection()
    .then(() => console.log('数据库连接测试成功'))
    .catch(err => console.error('数据库连接测试失败:', err)); 