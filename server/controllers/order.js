import * as orderModel from '../models/order.js';
import * as userModel from '../models/user.js';
import { pool } from '../config/db.js';

// 获取所有订单
export const getAllOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();
        return res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取单个订单
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await orderModel.getOrderById(id);

        if (!order) {
            return res.status(404).json({ error: '订单不存在' });
        }

        return res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 创建订单
export const createOrder = async (req, res) => {
    try {
        const { user_id, items } = req.body;

        // 验证必填字段
        if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: '用户ID和订单项不能为空' });
        }

        // 验证订单项格式
        for (const item of items) {
            if (!item.menu_id || !item.quantity || item.quantity <= 0) {
                return res.status(400).json({ error: '订单项格式不正确' });
            }
        }

        // 检查用户是否存在
        const userExists = await userModel.userExists(user_id);
        if (!userExists) {
            return res.status(400).json({ error: '用户不存在' });
        }

        // 创建订单
        const orderId = await orderModel.createOrder({ user_id, items });

        // 获取创建的订单详情
        const order = await orderModel.getOrderById(orderId);

        res.status(201).json({
            message: '订单创建成功',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
};

// 获取用户的所有订单
export const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // 检查用户是否存在
        const userExists = await userModel.userExists(userId);
        if (!userExists) {
            return res.status(400).json({ error: '用户不存在' });
        }

        const orders = await orderModel.getOrdersByUserId(userId);
        return res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 使用AddOrder存储过程创建订单并添加第一个菜品
export const createOrderWithFirstItem = async (req, res) => {
    try {
        const { user_id, menu_id, quantity, payment_method } = req.body;

        // 验证必填字段
        if (!user_id || !menu_id || !quantity) {
            return res.status(400).json({ error: '用户ID、菜品ID和数量不能为空' });
        }

        // 验证数量必须是正数
        if (quantity <= 0) {
            return res.status(400).json({ error: '菜品数量必须大于0' });
        }

        // 检查用户是否存在
        const userExists = await userModel.userExists(user_id);
        if (!userExists) {
            return res.status(400).json({ error: '用户不存在' });
        }

        // 直接调用AddOrder存储过程
        const [result] = await pool.query('CALL AddOrder(?, ?, ?)', [
            user_id,
            menu_id,
            quantity
        ]);

        // 获取创建的订单ID (从结果中提取)
        const order_id = result[0][0].order_id;

        res.status(201).json({
            message: '订单创建成功',
            order_id: order_id
        });
    } catch (error) {
        console.error('创建订单异常:', error);
        res.status(500).json({ error: error.message || '创建订单失败' });
    }
};

// 向现有订单添加新菜品
export const addItemToOrder = async (req, res) => {
    try {
        const { user_id, order_id, menu_id, quantity } = req.body;

        // 验证必填字段
        if (!user_id || !order_id || !menu_id || !quantity) {
            return res.status(400).json({ error: '用户ID、订单ID、菜品ID和数量不能为空' });
        }

        // 验证数量必须是正数
        if (quantity <= 0) {
            return res.status(400).json({ error: '菜品数量必须大于0' });
        }

        // 检查订单是否存在
        const orderExists = await checkOrderExists(order_id);
        if (!orderExists) {
            return res.status(404).json({ error: '订单不存在' });
        }

        // 添加订单项
        await pool.query(
            'INSERT INTO OrderItem (order_id, menu_id, quantity) VALUES (?, ?, ?)',
            [order_id, menu_id, quantity]
        );

        res.status(200).json({
            message: '菜品添加成功',
            order_id: order_id
        });
    } catch (error) {
        console.error('添加菜品异常:', error);
        res.status(500).json({ error: error.message || '添加菜品失败' });
    }
};

// 辅助函数：检查订单是否存在
async function checkOrderExists(order_id) {
    const [rows] = await pool.query('SELECT 1 FROM Orders WHERE order_id = ?', [order_id]);
    return rows.length > 0;
}

// 获取员工订单趋势（近7天每日订单数）
export const getEmployeeOrderTrend = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DATE(order_date) AS date, COUNT(*) AS count
       FROM Orders
       WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(order_date)
       ORDER BY date ASC`
        );
        res.json(rows);
    } catch (error) {
        console.error('获取员工订单趋势失败:', error);
        res.status(500).json({ error: error.message });
    }
};

// 获取员工订单统计（总订单数、今日订单数）
export const getEmployeeOrderStats = async (req, res) => {
    try {
        // 总订单数
        const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM Orders');
        // 今日订单数
        const [todayRows] = await pool.query('SELECT COUNT(*) AS today FROM Orders WHERE DATE(order_date) = CURDATE()');
        res.json({
            total: totalRows[0].total,
            today: todayRows[0].today
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 获取员工汇总统计（总销售额、支付笔数、近7天销售额）
export const getEmployeeOrderSummary = async (req, res) => {
    try {
        // 总销售额
        const [totalRows] = await pool.query('SELECT IFNULL(SUM(amount),0) AS totalAmount FROM Payment');
        // 支付笔数
        const [countRows] = await pool.query('SELECT COUNT(*) AS paymentCount FROM Payment');
        // 近7天销售额
        const [salesRows] = await pool.query(`SELECT IFNULL(SUM(amount),0) AS salesAmount FROM Payment WHERE order_id IN (SELECT order_id FROM Orders WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY))`);
        res.json({
            totalAmount: parseFloat(totalRows[0].totalAmount),
            paymentCount: countRows[0].paymentCount,
            salesAmount: parseFloat(salesRows[0].salesAmount)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 获取近7天每日支付笔数趋势
export const getEmployeePaymentTrend = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT DATE(o.order_date) AS date, COUNT(p.payment_id) AS count
             FROM Payment p
             JOIN Orders o ON p.order_id = o.order_id
             WHERE o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
             GROUP BY DATE(o.order_date)
             ORDER BY date ASC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 