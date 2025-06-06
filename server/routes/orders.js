import express from 'express';
import * as orderController from '../controllers/order.js';

const router = express.Router();

// 获取所有订单
router.get('/', orderController.getAllOrders);

// 获取单个订单
router.get('/:id', orderController.getOrderById);

// 创建订单
router.post('/', orderController.createOrder);

// 使用AddOrder存储过程创建订单并添加第一个菜品
router.post('/create-with-item', orderController.createOrderWithFirstItem);

// 向现有订单添加新菜品
router.post('/add-item', orderController.addItemToOrder);

// 获取用户的所有订单
router.get('/user/:userId', orderController.getOrdersByUserId);

// 获取员工订单趋势
router.get('/trend/employee', orderController.getEmployeeOrderTrend);

// 获取员工订单统计
router.get('/stats/employee', orderController.getEmployeeOrderStats);

// 获取员工汇总统计
router.get('/summary/employee', orderController.getEmployeeOrderSummary);

// 获取近7天每日支付笔数趋势
router.get('/payment-trend/employee', orderController.getEmployeePaymentTrend);

export default router;