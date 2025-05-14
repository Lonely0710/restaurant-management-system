import { pool } from '../config/db.js';

// 获取所有支付记录
const getAllPayments = async () => {
    const [rows] = await pool.query(`
        SELECT p.payment_id, p.order_id, p.amount, p.method, o.order_date
        FROM Payment p
        JOIN Orders o ON p.order_id = o.order_id
        ORDER BY o.order_date DESC
    `);

    return rows.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount)
    }));
};

// 获取单个支付记录
const getPaymentById = async (id) => {
    const [rows] = await pool.query(`
        SELECT p.payment_id, p.order_id, p.amount, p.method, o.order_date
        FROM Payment p
        JOIN Orders o ON p.order_id = o.order_id
        WHERE p.payment_id = ?
    `, [id]);

    if (rows.length === 0) {
        return null;
    }

    return {
        ...rows[0],
        amount: parseFloat(rows[0].amount)
    };
};

// 获取订单的所有支付记录
const getPaymentsByOrderId = async (orderId) => {
    const [rows] = await pool.query(
        'SELECT payment_id, order_id, amount, method FROM Payment WHERE order_id = ?',
        [orderId]
    );

    return rows.map(payment => ({
        ...payment,
        amount: parseFloat(payment.amount)
    }));
};

// 创建支付记录
const createPayment = async (paymentData) => {
    const { order_id, amount, method } = paymentData;

    const [result] = await pool.query(
        'INSERT INTO Payment (order_id, amount, method) VALUES (?, ?, ?)',
        [order_id, amount, method]
    );

    return getPaymentById(result.insertId);
};

// 检查订单是否存在
const orderExists = async (orderId) => {
    const [rows] = await pool.query('SELECT order_id FROM Orders WHERE order_id = ?', [orderId]);
    return rows.length > 0;
};

export {
    getAllPayments,
    getPaymentById,
    getPaymentsByOrderId,
    createPayment,
    orderExists
}; 