import jwt from 'jsonwebtoken';
import { JWT_SECRET, USER_ROLES } from '../config/constants.js';

// JWT认证中间件
export const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: '未提供认证令牌' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '无效的认证令牌格式' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token验证失败:', error);
        return res.status(401).json({ error: '认证令牌无效或已过期' });
    }
};

// 管理员权限中间件 - 原名称
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.identity !== USER_ROLES.ADMIN) {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};

// 管理员权限中间件 - 兼容新名称
export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.identity !== USER_ROLES.ADMIN) {
        return res.status(403).json({ error: '需要管理员权限' });
    }
    next();
};

// 员工或管理员权限中间件
export const requireStaff = (req, res, next) => {
    if (!req.user || (req.user.identity !== USER_ROLES.ADMIN && req.user.identity !== USER_ROLES.STAFF)) {
        return res.status(403).json({ error: '需要员工或管理员权限' });
    }
    next();
}; 