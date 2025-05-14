import * as userModel from '../models/user.js';

// 获取所有用户
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        return res.json(users);
    } catch (error) {
        console.error('查询Users表出错:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 获取单个用户
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel.getUserById(id);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        return res.json(user);
    } catch (error) {
        console.error('查询用户出错:', error);
        return res.status(500).json({ error: error.message });
    }
};

// 创建用户
export const createUser = async (req, res) => {
    try {
        const { name, phone, password_hash, identity } = req.body;

        // 验证必填字段
        if (!name || !phone || !password_hash) {
            return res.status(400).json({ error: '用户名、手机号和密码不能为空' });
        }

        // 检查手机号是否已存在
        const existingUser = await userModel.getUserByPhone(phone);
        if (existingUser) {
            return res.status(400).json({ error: '该手机号已被注册' });
        }

        const newUser = await userModel.createUser({
            name,
            phone,
            password_hash,
            identity
        });

        res.status(201).json({
            message: '用户添加成功',
            user: newUser
        });
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ error: error.message });
    }
};

// 更新用户
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, password_hash, is_active, identity } = req.body;

        // 验证用户是否存在
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 如果更新手机号，检查是否已被使用
        if (phone && phone !== user.phone) {
            const existingUser = await userModel.getUserByPhone(phone);
            if (existingUser) {
                return res.status(400).json({ error: '该手机号已被注册' });
            }
        }

        // 如果没有提供任何更新字段
        if (!name && !phone && !password_hash && is_active === undefined && identity === undefined) {
            return res.status(400).json({ error: '没有提供要更新的字段' });
        }

        const updatedUser = await userModel.updateUser(id, {
            name,
            phone,
            password_hash,
            is_active,
            identity
        });

        res.json({
            message: '用户更新成功',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};

// 更新用户登录时间
export const updateLastLoginTime = async (req, res) => {
    try {
        const { id } = req.params;

        // 验证用户是否存在
        const user = await userModel.getUserById(id);
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        const updatedUser = await userModel.updateLastLoginTime(id);

        res.json({
            message: '用户登录时间更新成功',
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user login time:', error);
        res.status(500).json({ error: error.message });
    }
}; 