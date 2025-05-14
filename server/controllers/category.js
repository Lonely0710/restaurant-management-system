import * as categoryModel from '../models/category.js';

// 获取所有分类
export const getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.getAllCategories();
        return res.json(categories);
    } catch (error) {
        console.error('查询Category表出错:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取单个分类
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await categoryModel.getCategoryById(id);

        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        return res.json(category);
    } catch (error) {
        console.error('查询分类出错:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 创建分类
export const createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: '分类名称不能为空' });
        }

        const newCategory = await categoryModel.createCategory({ category_name });

        res.status(201).json({
            message: '分类添加成功',
            category: newCategory
        });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: error.message });
    }
};

// 更新分类
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: '分类名称不能为空' });
        }

        const category = await categoryModel.getCategoryById(id);
        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        const updatedCategory = await categoryModel.updateCategory(id, { category_name });

        res.json({
            message: '分类更新成功',
            category: updatedCategory
        });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: error.message });
    }
};

// 删除分类
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 检查分类是否存在
        const category = await categoryModel.getCategoryById(id);
        if (!category) {
            return res.status(404).json({ error: '分类不存在' });
        }

        // 检查分类是否被菜品使用
        const isUsed = await categoryModel.checkCategoryUsage(id);
        if (isUsed) {
            return res.status(400).json({ error: '无法删除：该分类已被菜品使用' });
        }

        await categoryModel.deleteCategory(id);

        res.json({ message: '分类删除成功' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: error.message });
    }
}; 