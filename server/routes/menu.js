import express from 'express';
import { getAllMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 获取所有菜品（公开）
router.get('/', getAllMenuItems);

// 获取单个菜品（公开）
router.get('/:id', getMenuItemById);

// 添加菜品（仅管理员）
router.post('/', authenticateJWT, isAdmin, createMenuItem);

// 更新菜品（仅管理员）
router.put('/:id', authenticateJWT, isAdmin, updateMenuItem);

// 删除菜品（仅管理员）
router.delete('/:id', authenticateJWT, isAdmin, deleteMenuItem);

export default router; 