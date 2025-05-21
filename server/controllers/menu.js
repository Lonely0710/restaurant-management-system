import * as menuModel from '../models/menu.js';
import { pool } from '../config/db.js';

// 获取所有菜品
export const getAllMenuItems = async (req, res) => {
    try {
        // 调用Model层获取所有菜品（已在Model层过滤status=1）
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

        // 检查菜品状态，如果已下架，普通用户可能不应该看到
        // 如果是管理员，可以忽略此检查，具体取决于前端如何区分管理员和普通用户
        // 这里简单处理：如果status=0，返回404 (普通用户视角)
        if (dish.status === 0) {
            return res.status(404).json({ error: '菜品已下架或不存在' });
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
        const { name, price, category_id, style, imgurl, description } = req.body;

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
            style: style || null,
            imgurl: imgurl || null, // 保存imgurl
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
        // 从请求体中解构所有可能的更新字段
        const { name, price, category_id, style, imgurl, description } = req.body;
        const menuId = req.params.id;

        // 验证必填字段
        if (!name || price === undefined) {
            return res.status(400).json({ error: '菜品名称和价格不能为空' });
        }

        // 验证价格为正数
        if (price <= 0) {
            return res.status(400).json({ error: '价格必须大于0!' });
        }

        // 检查菜品是否存在并获取现有数据
        const existingDish = await menuModel.getMenuItemById(menuId);
        if (!existingDish) {
            return res.status(404).json({ error: '菜品不存在' });
        }

        // 构建更新数据对象，优先使用请求体中的值，如果请求体中imgurl是空字符串则保留原有imgurl
        const updateData = {
            name: name !== undefined ? name : existingDish.name,
            price: price !== undefined ? price : existingDish.price,
            category_id: category_id !== undefined ? category_id : existingDish.category_id,
            style: style !== undefined ? style : existingDish.style,
            description: description !== undefined ? description : existingDish.description, // 确保description被包含
            // imgurl处理：如果前端明确提供了非空字符串或非null的值，则使用；否则保留原有值
            imgurl: (imgurl !== undefined && imgurl !== "" && imgurl !== null) ? imgurl : existingDish.imgurl
        };

        // 如果请求体中的imgurl明确传递了null，表示清空图片，这里需要单独处理
        if (imgurl === null) {
            updateData.imgurl = null;
        }

        console.log("Controller 传递给 Model 的更新数据:", updateData);

        const updatedDish = await menuModel.updateMenuItem(menuId, updateData); // 传递构建好的更新数据

        res.json({
            message: '菜品更新成功',
            dish: updatedDish
        });
    } catch (error) {
        console.error(`Error updating menu item ${req.params.id}:`, error);
        res.status(500).json({ error: error.message || '更新菜品失败' });
    }
};

// 删除菜品
export const deleteMenuItem = async (req, res) => {
    const menu_id = req.params.id;
    try {
        // 调用Model层的方法执行物理删除
        await menuModel.deleteMenuItem(menu_id);

        // 返回物理删除成功的响应
        res.json({ message: '菜品已物理删除', deleted: true });

    } catch (error) {
        console.error('Error deleting menu item in controller:', error);
        // 统一返回删除失败的错误信息
        res.status(500).json({ error: error.message || '删除菜品失败' });
    }
};