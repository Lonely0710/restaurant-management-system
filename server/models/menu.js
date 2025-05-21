import { pool } from '../config/db.js';

// 获取所有菜品
const getAllMenuItems = async () => {
    // 使用存储过程
    const [result] = await pool.query('CALL GetAllMenusWithCategory()');

    return result[0].map(item => ({
        menu_id: item.menu_id,
        name: item.name,
        price: parseFloat(item.price),
        category_id: item.category_id,
        style: item.style,
        category_name: item.category_name,
        imgurl: item.imgurl,
        status: item.status
    }));
};

// 获取单个菜品
const getMenuItemById = async (id) => {
    const [rows] = await pool.query(`
        SELECT m.*, c.category_name 
        FROM Menu m
        LEFT JOIN Category c ON m.category_id = c.category_id
        WHERE m.menu_id = ?
    `, [id]);

    if (rows.length === 0) {
        return null;
    }

    const item = rows[0];
    return {
        ...item,
        price: parseFloat(item.price)
    };
};

// 使用AddMenu存储过程创建菜品
const createMenuItem = async (menuData) => {
    const { name, price, category_id, style, imgurl, description } = menuData;

    // 调用AddMenu存储过程，传递6个参数
    const defaultImgUrl = 'https://placehold.co/300x300/e8e8e8/787878?text=img'; // 默认占位图URL
    const finalImgUrl = imgurl || defaultImgUrl;

    try {
        const [result] = await pool.query(
            'CALL AddMenu(?, ?, ?, ?, ?, ?)', // 传递6个参数
            [name, price, category_id, style, finalImgUrl, description] // 移除 ingredients
        );

        // 获取存储过程返回的菜品ID
        // 假设存储过程AddMenu返回了菜品ID，并且格式是 result[0][0].menu_id
        if (result && result[0] && result[0][0] && result[0][0].menu_id !== undefined) {
            const menuId = result[0][0].menu_id;
            // 假设你的存储过程只负责插入并返回ID，其他字段需要查询获取
            return getMenuItemById(menuId);
        } else {
            // 如果存储过程没有返回预期的ID，可以返回一个成功状态或简单的对象
            console.warn('AddMenu stored procedure did not return menu_id in expected format:', result);
            // 临时返回成功状态或部分信息，需要根据实际业务决定
            // 或者抛出错误让controller处理
            throw new Error('创建菜品失败，未能获取菜品ID');
        }
    } catch (error) {
        console.error('Model Error calling AddMenu stored procedure:', error);
        throw error; // 抛出错误让controller处理
    }
};

// 更新菜品
const updateMenuItem = async (id, menuData) => {
    const { name, price, category_id, style, imgurl, description } = menuData;
    // 调用存储过程更新Menu表，包括imgurl, description
    await pool.query(
        'CALL UpdateMenu(?, ?, ?, ?, ?, ?, ?)', // 传递7个参数
        [id, name, price, category_id, style, imgurl, description]
    );

    // 返回更新后的菜品信息
    return getMenuItemById(id);
};

// 删除菜品
const deleteMenuItem = async (id) => {
    try {
        // 调用存储过程
        const [result] = await pool.query('CALL DeleteMenu(?)', [id]);

        console.log(`Attempted to delete menu item ID ${id} via stored procedure.`);

        return true;
    } catch (error) {
        console.error('Model Error calling DeleteOrDeactivateMenu stored procedure:', error);
        throw error; // 抛出错误让controller处理
    }
};


export {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};