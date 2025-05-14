import * as paymentModel from '../models/payment.js';

// 获取所有支付记录
export const getAllPayments = async (req, res) => {
    try {
        const payments = await paymentModel.getAllPayments();
        return res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取单个支付记录
export const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await paymentModel.getPaymentById(id);

        if (!payment) {
            return res.status(404).json({ error: '支付记录不存在' });
        }

        return res.json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取订单的所有支付记录
export const getPaymentsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // 检查订单是否存在
        const orderExists = await paymentModel.orderExists(orderId);
        if (!orderExists) {
            return res.status(404).json({ error: '订单不存在' });
        }

        const payments = await paymentModel.getPaymentsByOrderId(orderId);
        return res.json(payments);
    } catch (error) {
        console.error('Error fetching order payments:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 创建支付记录
export const createPayment = async (req, res) => {
    try {
        const { order_id, amount, method } = req.body;

        // 验证必填字段
        if (!order_id || !amount || !method) {
            return res.status(400).json({ error: '订单ID、金额和支付方式不能为空' });
        }

        // 验证金额为正数
        if (amount <= 0) {
            return res.status(400).json({ error: '支付金额必须大于0' });
        }

        // 检查订单是否存在
        const orderExists = await paymentModel.orderExists(order_id);
        if (!orderExists) {
            return res.status(404).json({ error: '订单不存在' });
        }

        // 创建支付记录
        const payment = await paymentModel.createPayment({ order_id, amount, method });

        res.status(201).json({
            message: '支付记录创建成功',
            payment
        });
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: error.message });
    }
}; 