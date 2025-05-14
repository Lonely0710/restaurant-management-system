import express from 'express';
import * as menuController from '../controllers/menu.js';

const router = express.Router();

// 获取所有菜品
router.get('/', menuController.getAllMenuItems);

// 获取单个菜品
router.get('/:id', menuController.getMenuItemById);

// 创建菜品
router.post('/', menuController.createMenuItem);

// 更新菜品
router.put('/:id', menuController.updateMenuItem);

// 删除菜品
router.delete('/:id', menuController.deleteMenuItem);

export default router; 