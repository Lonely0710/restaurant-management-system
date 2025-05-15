import express from 'express';
import { login, register, getCurrentUser } from '../controllers/user.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// 用户注册
router.post('/register', register);

// 用户登录
router.post('/login', login);

// 获取当前用户信息（需要认证）
router.get('/me', authenticateJWT, getCurrentUser);

export default router; 