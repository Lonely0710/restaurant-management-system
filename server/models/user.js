import { pool } from '../config/db.js';

// 获取所有用户
const getAllUsers = async () => {
    const [rows] = await pool.query(`
        SELECT user_id, name, phone, create_time, last_login_time, is_active, identity
        FROM Users
    `);
    return rows;
};

// 获取单个用户
const getUserById = async (id) => {
    const [rows] = await pool.query(`
        SELECT user_id, name, phone, create_time, last_login_time, is_active, identity
        FROM Users WHERE user_id = ?
    `, [id]);

    return rows[0] || null;
};

// 通过手机号获取用户
const getUserByPhone = async (phone) => {
    const [rows] = await pool.query(`
        SELECT user_id, name, phone, password_hash, create_time, last_login_time, is_active, identity
        FROM Users WHERE phone = ?
    `, [phone]);

    return rows[0] || null;
};

// 创建用户
const createUser = async (userData) => {
    const { name, phone, password_hash, identity = 2 } = userData;
    const [result] = await pool.query(
        'INSERT INTO Users (name, phone, password_hash, identity, create_time) VALUES (?, ?, ?, ?, NOW())',
        [name, phone, password_hash, identity]
    );

    return getUserById(result.insertId);
};

// 更新用户
const updateUser = async (id, userData) => {
    // 构建动态更新查询
    const { name, phone, password_hash, is_active, identity } = userData;

    let updateFields = [];
    let queryParams = [];

    if (name) {
        updateFields.push('name = ?');
        queryParams.push(name);
    }

    if (phone) {
        updateFields.push('phone = ?');
        queryParams.push(phone);
    }

    if (password_hash) {
        updateFields.push('password_hash = ?');
        queryParams.push(password_hash);
    }

    if (is_active !== undefined) {
        updateFields.push('is_active = ?');
        queryParams.push(is_active);
    }

    if (identity !== undefined) {
        updateFields.push('identity = ?');
        queryParams.push(identity);
    }

    // 如果没有要更新的字段，返回当前用户
    if (updateFields.length === 0) {
        return getUserById(id);
    }

    queryParams.push(id);

    await pool.query(
        `UPDATE Users SET ${updateFields.join(', ')} WHERE user_id = ?`,
        queryParams
    );

    return getUserById(id);
};

// 更新用户最后登录时间
const updateLastLoginTime = async (id) => {
    await pool.query('UPDATE Users SET last_login_time = NOW() WHERE user_id = ?', [id]);
    return getUserById(id);
};

// 检查用户是否存在
const userExists = async (id) => {
    const [rows] = await pool.query('SELECT user_id FROM Users WHERE user_id = ?', [id]);
    return rows.length > 0;
};

export {
    getAllUsers,
    getUserById,
    getUserByPhone,
    createUser,
    updateUser,
    updateLastLoginTime,
    userExists
}; 