import express from 'express';
import * as orderController from '../controllers/order.js';

const router = express.Router();

// 获取所有订单
router.get('/', orderController.getAllOrders);

// 获取单个订单
router.get('/:id', orderController.getOrderById);

// 创建订单
router.post('/', orderController.createOrder);

// 获取用户的所有订单
router.get('/user/:userId', orderController.getOrdersByUserId);

export default router;