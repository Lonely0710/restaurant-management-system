import express from 'express';
import * as categoryController from '../controllers/category.js';

const router = express.Router();

// 获取所有分类
router.get('/', categoryController.getAllCategories);

// 获取单个分类
router.get('/:id', categoryController.getCategoryById);

// 创建分类
router.post('/', categoryController.createCategory);

// 更新分类
router.put('/:id', categoryController.updateCategory);

// 删除分类
router.delete('/:id', categoryController.deleteCategory);

export default router;