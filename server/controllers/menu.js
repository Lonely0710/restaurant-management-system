import * as menuModel from '../models/menu.js';

// 获取所有菜品
export const getAllMenuItems = async (req, res) => {
    try {
        const dishes = await menuModel.getAllMenuItems();
        res.json(dishes);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: '获取菜品失败' });
    }
};

// 获取单个菜品
export const getMenuItemById = async (req, res) => {
    try {
        const dish = await menuModel.getMenuItemById(req.params.id);

        if (!dish) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        res.json(dish);
    } catch (error) {
        console.error(`Error fetching menu item ${req.params.id}:`, error);
        res.status(500).json({ error: '获取菜品失败' });
    }
};

// 创建菜品
export const createMenuItem = async (req, res) => {
    try {
        const { name, price, category_id, style } = req.body;

        // 验证必填字段
        if (!name || price === undefined) {
            return res.status(400).json({ error: '菜品名称和价格不能为空' });
        }

        // 验证价格为正数
        if (price <= 0) {
            return res.status(400).json({ error: '价格必须大于0' });
        }

        const newMenuItem = await menuModel.createMenuItem({
            name,
            price,
            category_id: category_id || null,
            style: style || null
        });

        res.status(201).json({
            message: '菜品添加成功',
            dish: newMenuItem
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: error.message });
    }
};

// 更新菜品
export const updateMenuItem = async (req, res) => {
    try {
        const { name, price, category_id, style } = req.body;
        const menuId = req.params.id;

        // 验证必填字段
        if (!name || price === undefined) {
            return res.status(400).json({ error: '菜品名称和价格不能为空' });
        }

        // 验证价格为正数
        if (price <= 0) {
            return res.status(400).json({ error: '价格必须大于0' });
        }

        // 检查菜品是否存在
        const existingDish = await menuModel.getMenuItemById(menuId);
        if (!existingDish) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        const updatedDish = await menuModel.updateMenuItem(menuId, {
            name,
            price,
            category_id: category_id || null,
            style: style || null
        });

        res.json({
            message: '菜品更新成功',
            dish: updatedDish
        });
    } catch (error) {
        console.error(`Error updating menu item ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
};

// 删除菜品
export const deleteMenuItem = async (req, res) => {
    try {
        const menuId = req.params.id;

        // 检查菜品是否存在
        const existingDish = await menuModel.getMenuItemById(menuId);
        if (!existingDish) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        // 检查菜品是否在订单中使用
        const isUsed = await menuModel.checkMenuItemUsage(menuId);
        if (isUsed) {
            return res.status(400).json({ error: '无法删除，该菜品已存在于订单中' });
        }

        await menuModel.deleteMenuItem(menuId);

        res.json({
            message: '菜品删除成功'
        });
    } catch (error) {
        console.error(`Error deleting menu item ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
}; 