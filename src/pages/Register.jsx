import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Row, Col, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        if (values.password !== values.confirmPassword) {
            message.error('两次输入的密码不一致！');
            return;
        }

        setLoading(true);
        try {
            // 调用后端注册接口，后端会使用AddUser存储过程
            const response = await axios.post('/api/auth/register', {
                name: values.name,
                phone: values.phone,
                password: values.password,
                // 普通用户身份类型为2
                identity: 2
            });

            message.success('注册成功！请登录');
            navigate('/login');
        } catch (error) {
            message.error('注册失败：' + (error.response?.data?.error || '未知错误'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Row justify="center" align="middle" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Col xs={22} sm={16} md={12} lg={8} xl={6}>
                <Card bordered={false} style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <Title level={2}>用户注册</Title>
                        <Text type="secondary">食物志点餐系统</Text>
                    </div>

                    <Form
                        form={form}
                        name="register"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                    >
                        <Form.Item
                            name="name"
                            rules={[{ required: true, message: '请输入您的姓名!' }]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="姓名"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            rules={[
                                { required: true, message: '请输入手机号!' },
                                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
                            ]}
                        >
                            <Input
                                prefix={<PhoneOutlined />}
                                placeholder="手机号"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[
                                { required: true, message: '请输入密码!' },
                                { min: 6, message: '密码长度不能少于6位!' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="密码"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            rules={[
                                { required: true, message: '请确认密码!' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('两次输入的密码不一致!'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="确认密码"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large">
                                注册
                            </Button>
                        </Form.Item>

                        <Form.Item style={{ textAlign: 'center', marginBottom: 0 }}>
                            <Text>已有账号？</Text>
                            <Link to="/login">去登录</Link>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default Register; 