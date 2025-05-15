import * as userModel from '../models/user.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/constants.js';

dotenv.config();

// 获取所有用户（管理端）
export const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
};

// 获取用户详情（管理端）
export const getUserById = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 不返回密码信息
        delete user.password_hash;

        res.json(user);
    } catch (error) {
        console.error(`Error fetching user ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
};

// 创建用户（管理端）
export const createUser = async (req, res) => {
    try {
        const { name, phone, password_hash, is_active, identity } = req.body;

        // 验证必填字段
        if (!name || !phone || !password_hash) {
            return res.status(400).json({ error: '姓名、手机号和密码不能为空' });
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: '手机号格式不正确' });
        }

        // 创建用户
        const user = await userModel.createUser({
            name,
            phone,
            password: password_hash,
            identity: identity || 2, // 默认为普通用户
        });

        // 不返回密码信息
        delete user.password_hash;

        res.status(201).json({
            message: '用户创建成功',
            user
        });
    } catch (error) {
        console.error('Error creating user:', error);

        if (error.message === '该手机号已被注册') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

// 更新用户信息（管理端）
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, phone, password_hash, is_active, identity } = req.body;

        // 验证用户是否存在
        const existingUser = await userModel.getUserById(userId);
        if (!existingUser) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 如果提供了新密码，则进行哈希处理
        let updatedUser;
        updatedUser = await userModel.updateUser(userId, {
            name,
            phone,
            password_hash,
            is_active,
            identity
        });

        // 不返回密码信息
        delete updatedUser.password_hash;

        res.json({
            message: '用户更新成功',
            user: updatedUser
        });
    } catch (error) {
        console.error(`Error updating user ${req.params.id}:`, error);
        res.status(500).json({ error: error.message });
    }
};

// 当前用户信息
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const user = await userModel.getUserById(userId);

        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 不返回密码信息
        delete user.password_hash;

        res.json({
            user_id: user.user_id,
            name: user.name,
            phone: user.phone,
            identity: user.identity,
            create_time: user.create_time,
            last_login_time: user.last_login_time
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: error.message });
    }
};

// 用户注册
export const register = async (req, res) => {
    try {
        const { name, phone, password, identity } = req.body;

        // 验证必填字段
        if (!name || !phone || !password) {
            return res.status(400).json({ error: '姓名、手机号和密码不能为空' });
        }

        // 验证手机号格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ error: '手机号格式不正确' });
        }

        // 验证密码长度
        if (password.length < 6) {
            return res.status(400).json({ error: '密码长度不能少于6位' });
        }

        // 创建用户（使用AddUser存储过程）
        const user = await userModel.createUser({
            name,
            phone,
            password,
            identity: identity || 2 // 默认为普通用户
        });

        res.status(201).json({
            message: '注册成功',
            user: {
                user_id: user.user_id,
                name: user.name,
                phone: user.phone,
                identity: user.identity,
                create_time: user.create_time
            }
        });
    } catch (error) {
        console.error('Error registering user:', error);

        if (error.message === '该手机号已被注册') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

// 用户登录
export const login = async (req, res) => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            return res.status(400).json({ error: '手机号和密码不能为空' });
        }

        const user = await userModel.validateUser(phone, password);

        if (!user) {
            return res.status(401).json({ error: '手机号或密码不正确' });
        }

        // 生成JWT令牌
        const token = jwt.sign(
            {
                user_id: user.user_id,
                name: user.name,
                identity: user.identity
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: '登录成功',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                phone: user.phone,
                identity: user.identity
            }
        });
    } catch (error) {
        console.error('Login error:', error);

        if (error.message === '账户已被禁用') {
            return res.status(403).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
}; 