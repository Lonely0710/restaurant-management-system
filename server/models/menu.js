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
        category_name: item.category_name
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
    const { name, price, category_id, style } = menuData;

    // 调用AddMenu存储过程
    const [result] = await pool.query(
        'CALL AddMenu(?, ?, ?, ?)',
        [name, price, category_id, style]
    );

    // 获取存储过程返回的菜品ID
    const menuId = result[0][0].menu_id;

    return getMenuItemById(menuId);
};

// 更新菜品
const updateMenuItem = async (id, menuData) => {
    const { name, price, category_id, style } = menuData;
    await pool.query(
        'UPDATE Menu SET name = ?, price = ?, category_id = ?, style = ? WHERE menu_id = ?',
        [name, price, category_id, style, id]
    );

    return getMenuItemById(id);
};

// 删除菜品
const deleteMenuItem = async (id) => {
    const [result] = await pool.query('DELETE FROM Menu WHERE menu_id = ?', [id]);
    return result.affectedRows > 0;
};

// 检查菜品是否存在于订单中
const checkMenuItemUsage = async (id) => {
    const [rows] = await pool.query('SELECT * FROM OrderItem WHERE menu_id = ?', [id]);
    return rows.length > 0;
};

export {
    getAllMenuItems,
    getMenuItemById,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    checkMenuItemUsage
};