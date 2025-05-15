console.log('Node.js server process started.');

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 导入路由
import categoryRoutes from './routes/categories.js';
import menuRoutes from './routes/menu.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import authRoutes from './routes/auth.js';

// 导入数据库连接测试函数
import { testConnection } from './config/db.js';

dotenv.config();

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

// 处理404路由
app.use((req, res) => {
    res.status(404).json({ error: '请求的资源不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
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