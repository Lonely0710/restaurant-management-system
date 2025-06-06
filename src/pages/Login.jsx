import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Login.css';
import logo from '../assets/AppIcon_FoodJournal.png';

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isFromCustomer = location.pathname === '/login';

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // 调用登录API
            const response = await api.post('/auth/login', {
                phone: values.phone,
                password: values.password
            });

            // 保存令牌到本地存储
            localStorage.setItem('token', response.data.token);

            // 可选：保存用户信息
            localStorage.setItem('user', JSON.stringify(response.data.user));

            message.success('登录成功！');

            // 根据用户身份跳转到不同页面
            if (response.data.user.identity === 0) {
                // 管理员跳转到管理后台
                navigate('/admin/dishes');
            } else if (response.data.user.identity === 1) {
                // 员工跳转到员工界面
                navigate('/employee');
            } else {
                // 普通用户跳转到点餐页面
                navigate('/customer/ordering');
            }
        } catch (error) {
            console.error('登录失败:', error);
            message.error('登录失败：' + (error.response?.data?.error || '用户名或密码错误'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-bg">
            <div className="login-flex-center">
                <Card bordered={false} className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-bg">
                            <img src={logo} alt="logo" style={{ width: 48, marginBottom: 0 }} />
                        </div>
                        <Title level={2} style={{ marginBottom: 0, marginTop: 16 }}>食物志点餐系统</Title>
                        <Text type="secondary">员工/管理员/顾客统一登录</Text>
                    </div>
                    <Form
                        name="login"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="phone"
                            rules={[
                                { required: true, message: '请输入手机号!' },
                                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="手机号"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="密码"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item name="remember" valuePropName="checked">
                            <Checkbox>记住我</Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                登录
                            </Button>
                        </Form.Item>

                        {isFromCustomer && (
                            <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                                <Text>第一次登录？</Text>
                                <Link to="/register">去注册</Link>
                            </Form.Item>
                        )}
                    </Form>
                    <div className="login-footer">©2024 食物志 · Ant Design Pro 风格</div>
                </Card>
            </div>
        </div>
    );
};

export default Login; 