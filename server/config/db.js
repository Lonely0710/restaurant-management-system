import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

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

// 测试数据库连接的函数
const testConnection = async () => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('数据库连接正常');
        return rows[0].result;
    } catch (error) {
        console.error('数据库连接失败:', error);
        throw error;
    }
};

export { pool, testConnection }; 