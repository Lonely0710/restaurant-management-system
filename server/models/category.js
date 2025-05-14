import { pool } from '../config/db.js';

// 获取所有分类
const getAllCategories = async () => {
    const [rows] = await pool.query('SELECT category_id, category_name FROM Category');
    return rows;
};

// 获取单个分类
const getCategoryById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM Category WHERE category_id = ?', [id]);
    return rows[0] || null;
};

// 创建新分类
const createCategory = async (categoryData) => {
    const { category_name } = categoryData;
    const [result] = await pool.query(
        'INSERT INTO Category (category_name) VALUES (?)',
        [category_name]
    );

    return getCategoryById(result.insertId);
};

// 更新分类
const updateCategory = async (id, categoryData) => {
    const { category_name } = categoryData;
    await pool.query(
        'UPDATE Category SET category_name = ? WHERE category_id = ?',
        [category_name, id]
    );

    return getCategoryById(id);
};

// 删除分类
const deleteCategory = async (id) => {
    const [result] = await pool.query('DELETE FROM Category WHERE category_id = ?', [id]);
    return result.affectedRows > 0;
};

// 检查分类是否被菜品使用
const checkCategoryUsage = async (id) => {
    const [rows] = await pool.query('SELECT * FROM Menu WHERE category_id = ?', [id]);
    return rows.length > 0;
};

export {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    checkCategoryUsage
}; 