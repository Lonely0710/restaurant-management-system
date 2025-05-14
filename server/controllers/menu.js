import * as menuModel from '../models/menu.js';

// 获取所有菜品
export const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await menuModel.getAllMenuItems();
        return res.json(menuItems);
    } catch (error) {
        console.error('查询Menu表出错:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取单个菜品
export const getMenuItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await menuModel.getMenuItemById(id);

        if (!menuItem) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        return res.json(menuItem);
    } catch (error) {
        console.error('查询菜品出错:', error);
        return res.status(500).json({ error: error.message });
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
        const { id } = req.params;
        const { name, price, category_id, style } = req.body;

        // 验证菜品是否存在
        const menuItem = await menuModel.getMenuItemById(id);
        if (!menuItem) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        // 验证必填字段
        if (!name || price === undefined) {
            return res.status(400).json({ error: '菜品名称和价格不能为空' });
        }

        // 验证价格为正数
        if (price <= 0) {
            return res.status(400).json({ error: '价格必须大于0' });
        }

        const updatedMenuItem = await menuModel.updateMenuItem(id, {
            name,
            price,
            category_id: category_id || null,
            style: style !== undefined ? style : menuItem.style
        });

        res.json({
            message: '菜品更新成功',
            dish: updatedMenuItem
        });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: error.message });
    }
};

// 删除菜品
export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        // 验证菜品是否存在
        const menuItem = await menuModel.getMenuItemById(id);
        if (!menuItem) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        // 检查菜品是否存在于订单中
        const isUsed = await menuModel.checkMenuItemUsage(id);
        if (isUsed) {
            return res.status(400).json({ error: '无法删除：该菜品已存在于订单中' });
        }

        await menuModel.deleteMenuItem(id);

        res.json({ message: '菜品删除成功' });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: error.message });
    }
}; 