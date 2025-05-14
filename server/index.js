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

// 导入数据库连接测试函数
import { testConnection } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// 处理404路由
app.use((req, res) => {
    res.status(404).json({ error: '请求的资源不存在' });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 