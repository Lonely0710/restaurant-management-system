import dotenv from 'dotenv';

dotenv.config();

// JWT 配置
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// 用户角色类型
export const USER_ROLES = {
    ADMIN: 0,      // 管理员
    STAFF: 1,       // 员工
    CUSTOMER: 2   // 顾客
};

// 订单状态
export const ORDER_STATUS = {
    PENDING: 0,    // 待确认
    PROCESSING: 1, // 进行中
    COMPLETED: 2,  // 已完成
    CANCELLED: 3   // 已取消
};

// 支付方式
export const PAYMENT_METHODS = {
    CASH: 'cash',
    WECHAT: 'wechat',
    ALIPAY: 'alipay'
}; 