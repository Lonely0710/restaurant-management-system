import { pool } from '../config/db.js';

// 获取所有订单
const getAllOrders = async () => {
    const [rows] = await pool.query(`
        SELECT o.order_id, o.order_date, u.name as user_name, u.phone as user_phone, 
        (SELECT SUM(oi.quantity * m.price) FROM OrderItem oi 
         JOIN Menu m ON oi.menu_id = m.menu_id 
         WHERE oi.order_id = o.order_id) as total_amount
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        ORDER BY o.order_date DESC
    `);

    return rows;
};

// 获取单个订单
const getOrderById = async (id) => {
    // 获取订单基本信息
    const [orderInfo] = await pool.query(`
        SELECT o.order_id, o.order_date, u.user_id, u.name as user_name, u.phone as user_phone
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
    `, [id]);

    if (orderInfo.length === 0) {
        return null;
    }

    // 获取订单项
    const [orderItems] = await pool.query(`
        SELECT oi.menu_id, m.name, oi.quantity, m.price, (oi.quantity * m.price) as item_total
        FROM OrderItem oi
        JOIN Menu m ON oi.menu_id = m.menu_id
        WHERE oi.order_id = ?
    `, [id]);

    // 获取支付信息
    const [payments] = await pool.query(`
        SELECT payment_id, amount, method
        FROM Payment
        WHERE order_id = ?
    `, [id]);

    // 计算总金额
    const totalAmount = orderItems.reduce((sum, item) => sum + parseFloat(item.item_total), 0);

    // 返回完整订单信息
    return {
        ...orderInfo[0],
        items: orderItems,
        payments: payments,
        total_amount: totalAmount
    };
};

// 创建订单
const createOrder = async (orderData, connection = null) => {
    const { user_id, items } = orderData;

    // 使用传入的连接或创建新连接
    const conn = connection || await pool.getConnection();
    let needToRelease = !connection;

    try {
        if (needToRelease) {
            await conn.beginTransaction();
        }

        // 创建订单
        const [orderResult] = await conn.query(
            'INSERT INTO Orders (user_id, order_date) VALUES (?, NOW())',
            [user_id]
        );

        const orderId = orderResult.insertId;

        // 添加订单项
        for (const item of items) {
            await conn.query(
                'INSERT INTO OrderItem (order_id, menu_id, quantity) VALUES (?, ?, ?)',
                [orderId, item.menu_id, item.quantity]
            );
        }

        if (needToRelease) {
            await conn.commit();
        }

        return orderId;
    } catch (error) {
        if (needToRelease) {
            await conn.rollback();
        }
        throw error;
    } finally {
        if (needToRelease) {
            conn.release();
        }
    }
};

// 获取用户的所有订单
const getOrdersByUserId = async (userId) => {
    const [rows] = await pool.query(`
        SELECT o.order_id, o.order_date,
        (SELECT SUM(oi.quantity * m.price) FROM OrderItem oi 
         JOIN Menu m ON oi.menu_id = m.menu_id 
         WHERE oi.order_id = o.order_id) as total_amount
        FROM Orders o
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
    `, [userId]);

    return rows;
};

export {
    getAllOrders,
    getOrderById,
    createOrder,
    getOrdersByUserId
}; 