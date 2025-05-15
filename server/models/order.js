import { pool } from '../config/db.js';

// 获取所有订单
const getAllOrders = async () => {
    // 使用新的GetAllOrders存储过程
    const [result] = await pool.query('CALL GetAllOrders()');

    // 由于GetAllOrders返回结果是一个结果集，直接返回第一个结果集
    return result[0].map(order => ({
        ...order,
        total_amount: parseFloat(order.total_amount || 0)
    }));
};

// 获取单个订单
const getOrderById = async (id) => {
    // 获取订单基本信息
    const [orderInfo] = await pool.query(`
        SELECT o.order_id, o.order_date, u.user_id, u.name as user_name, 
               u.phone as user_phone
        FROM Orders o
        JOIN Users u ON o.user_id = u.user_id
        WHERE o.order_id = ?
    `, [id]);

    if (orderInfo.length === 0) {
        return null;
    }

    // 使用GetOrderDetails存储过程获取订单项
    const [orderItems] = await pool.query('CALL GetOrderDetails(?)', [id]);

    // 获取支付信息
    const [payments] = await pool.query(`
        SELECT payment_id, amount, method as payment_method
        FROM Payment
        WHERE order_id = ?
    `, [id]);

    // 计算总金额
    const totalAmount = orderItems[0].reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    // 确定订单状态
    const state = payments.length > 0 ? 2 : 0; // 已支付:2, 未支付:0

    // 返回完整订单信息
    return {
        ...orderInfo[0],
        items: orderItems[0],
        payments: payments,
        total_amount: totalAmount,
        status: state // 添加状态字段：2表示已支付，0表示未支付
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
    // 使用存储过程
    const [result] = await pool.query('CALL GetUserOrders(?)', [userId]);
    return result[0];
};

export {
    getAllOrders,
    getOrderById,
    createOrder,
    getOrdersByUserId
}; 