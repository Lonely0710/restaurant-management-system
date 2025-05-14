import express from 'express';
import * as userController from '../controllers/user.js';

const router = express.Router();

// 获取所有用户
router.get('/', userController.getAllUsers);

// 获取单个用户
router.get('/:id', userController.getUserById);

// 创建用户
router.post('/', userController.createUser);

// 更新用户
router.put('/:id', userController.updateUser);

// 更新用户登录时间
router.put('/:id/login', userController.updateLastLoginTime);

export default router; 