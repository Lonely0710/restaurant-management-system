import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        res.json({
            message: '数据库连接正常',
            result: rows[0].result
        });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            message: '数据库连接失败',
            error: error.message
        });
    }
});

// API routes - 菜品管理
app.get('/api/dishes', async (req, res) => {
    try {
        // 假设我们有一个dishes表
        const [rows] = await pool.query('SELECT * FROM dishes');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching dishes:', error);
        res.status(500).json({ error: error.message });
    }
});

// API routes - 订单管理
app.get('/api/orders', async (req, res) => {
    try {
        // 假设我们有一个orders表
        const [rows] = await pool.query('SELECT * FROM orders');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});

// 创建订单
app.post('/api/orders', async (req, res) => {
    try {
        const { customer_name, items } = req.body;
        // 这里简化了订单创建流程
        const [result] = await pool.query(
            'INSERT INTO orders (customer_name, status) VALUES (?, ?)',
            [customer_name, 'pending']
        );
        res.status(201).json({
            message: '订单创建成功',
            orderId: result.insertId
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 