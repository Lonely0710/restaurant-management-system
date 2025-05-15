import express from 'express';
import * as userController from '../controllers/user.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有用户（仅管理员）
router.get('/', authenticateJWT, isAdmin, userController.getAllUsers);

// 获取单个用户（仅管理员）
router.get('/:id', authenticateJWT, isAdmin, userController.getUserById);

// 创建用户（仅管理员）
router.post('/', authenticateJWT, isAdmin, userController.createUser);

// 更新用户（仅管理员）
router.put('/:id', authenticateJWT, isAdmin, userController.updateUser);

// 注意：在当前控制器中没有updateLastLoginTime路由处理程序，已移除此路由

export default router; 