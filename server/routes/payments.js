import express from 'express';
import * as paymentController from '../controllers/payment.js';

const router = express.Router();

// 获取所有支付记录
router.get('/', paymentController.getAllPayments);

// 获取单个支付记录
router.get('/:id', paymentController.getPaymentById);

// 获取订单的所有支付记录
router.get('/order/:orderId', paymentController.getPaymentsByOrderId);

// 创建支付记录
router.post('/', paymentController.createPayment);

export default router; 