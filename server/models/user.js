import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';

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
    const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [id]);
    return rows.length ? rows[0] : null;
};

// 通过手机号获取用户
const getUserByPhone = async (phone) => {
    const [rows] = await pool.query('SELECT * FROM Users WHERE phone = ?', [phone]);
    return rows.length ? rows[0] : null;
};

// 检查用户是否存在
const userExists = async (userId) => {
    const [rows] = await pool.query('SELECT 1 FROM Users WHERE user_id = ?', [userId]);
    return rows.length > 0;
};

// 使用AddUser存储过程创建用户
const createUser = async (userData) => {
    const { name, phone, password, identity = 2 } = userData;

    // 检查手机号是否已存在
    const existingUser = await getUserByPhone(phone);
    if (existingUser) {
        throw new Error('该手机号已被注册');
    }

    // 密码哈希
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 调用AddUser存储过程创建用户
    const [result] = await pool.query(
        'CALL AddUser(?, ?, ?, ?)',
        [passwordHash, name, phone, identity]
    );

    // 获取存储过程返回的用户ID
    const userId = result[0][0].user_id;

    // 返回创建的用户信息
    return {
        user_id: userId,
        name,
        phone,
        identity,
        create_time: new Date(),
        is_active: 1
    };
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
const updateLastLoginTime = async (userId) => {
    await pool.query(
        'UPDATE Users SET last_login_time = NOW() WHERE user_id = ?',
        [userId]
    );
};

// 验证用户登录
const validateUser = async (phone, password) => {
    const user = await getUserByPhone(phone);

    if (!user) {
        return null;
    }

    if (!user.is_active) {
        throw new Error('账户已被禁用');
    }

    let isAuthenticated = false;

    // 检测是否为测试账户（dummy_hash开头的密码）
    if (user.password_hash && user.password_hash.startsWith('dummy_hash')) {
        // 对于测试账户，如果密码是"123456"，则认为验证通过
        isAuthenticated = password === "123456";
        console.log('测试账户登录', isAuthenticated ? '成功' : '失败');
    } else {
        // 正常账户使用bcrypt验证
        isAuthenticated = await bcrypt.compare(password, user.password_hash);
    }

    if (!isAuthenticated) {
        return null;
    }

    // 更新最后登录时间
    await updateLastLoginTime(user.user_id);

    return {
        user_id: user.user_id,
        name: user.name,
        phone: user.phone,
        identity: user.identity,
        create_time: user.create_time,
        last_login_time: new Date()
    };
};

export {
    getAllUsers,
    getUserById,
    getUserByPhone,
    userExists,
    createUser,
    updateUser,
    validateUser,
    updateLastLoginTime
}; 