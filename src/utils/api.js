import axios from 'axios';

// 创建axios实例
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器 - 自动添加认证令牌
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // 处理401未授权错误
            if (error.response.status === 401) {
                // 可以在这里添加重定向到登录页的逻辑
                console.error('认证失败：', error.response.data.error);
            }
            // 处理403权限不足错误
            else if (error.response.status === 403) {
                console.error('权限不足：', error.response.data.error);
            }
        }
        return Promise.reject(error);
    }
);

export default api; 