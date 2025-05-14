import { pool } from '../config/db.js';

// 获取所有菜品
const getAllMenuItems = async () => {
    const [rows] = await pool.query(`
        SELECT m.menu_id, m.name, m.price, m.category_id, m.style, c.category_name 
        FROM Menu m
        LEFT JOIN Category c ON m.category_id = c.category_id
    `);

    return rows.map(item => ({
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

// 创建菜品
const createMenuItem = async (menuData) => {
    const { name, price, category_id, style } = menuData;
    const [result] = await pool.query(
        'INSERT INTO Menu (name, price, category_id, style) VALUES (?, ?, ?, ?)',
        [name, price, category_id, style]
    );

    return getMenuItemById(result.insertId);
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