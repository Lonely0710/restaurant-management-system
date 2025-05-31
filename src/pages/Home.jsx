import React from 'react';
import { Button, Typography, Space, Row, Col, Card, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShopOutlined, UserOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
    const navigate = useNavigate();

    const handleCustomerClick = () => {
        navigate('/login', { state: { from: 'customer' } });
    };

    const handleAdminClick = () => {
        navigate('/login');
    };

    const handleTestClick = () => {
        navigate('/test/concurrency');
    };

    // 轮播图样式
    const contentStyle = {
        height: '300px',
        color: '#fff',
        lineHeight: '300px',
        textAlign: 'center',
        background: '#364d79',
        borderRadius: '8px',
        overflow: 'hidden',
    };

    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            position: 'relative'
        }}>
            {/* 右上角测试按钮 */}
            <Button
                type="primary"
                icon={<ExperimentOutlined />}
                onClick={handleTestClick}
                style={{
                    position: 'absolute',
                    top: 32,
                    right: 32,
                    zIndex: 10,
                    borderRadius: 20,
                    fontWeight: 600,
                    fontSize: 16,
                    height: 44,
                    padding: '0 24px',
                    background: '#722ed1',
                    borderColor: '#722ed1',
                    boxShadow: '0 2px 8px rgba(114,46,209,0.15)'
                }}
            >
                并发测试
            </Button>
            <Card
                style={{
                    maxWidth: '800px',
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                }}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ padding: '20px' }}>
                            <Title level={1} style={{ fontSize: '2.5rem', marginBottom: '20px' }}>
                                食物志
                            </Title>
                            <Paragraph style={{
                                fontSize: '1.3rem',
                                fontWeight: 700,
                                color: '#1890ff',
                                marginBottom: 10,
                                letterSpacing: 2
                            }}>
                                以志载食，以食会友。
                            </Paragraph>
                            <Paragraph style={{
                                fontSize: '15px',
                                color: '#666',
                                marginBottom: '30px',
                                lineHeight: 1.8
                            }}>
                                我们用心记录每一道佳肴背后的故事，探寻食材的源头与匠心。<br />
                                无论是寻常家宴还是精致盛宴，食物志致力于为您提供味蕾与心灵的双重满足。
                            </Paragraph>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Button
                                    type="primary"
                                    size="large"
                                    block
                                    icon={<ShopOutlined />}
                                    onClick={handleCustomerClick}
                                    style={{
                                        height: '50px',
                                        fontSize: '16px',
                                        background: '#1890ff'
                                    }}
                                >
                                    开始点餐
                                </Button>
                                <Button
                                    type="default"
                                    size="large"
                                    block
                                    icon={<UserOutlined />}
                                    onClick={handleAdminClick}
                                    style={{
                                        height: '50px',
                                        fontSize: '16px',
                                        borderColor: '#1890ff',
                                        color: '#1890ff'
                                    }}
                                >
                                    员工登录
                                </Button>
                            </Space>
                        </div>
                    </Col>
                    <Col xs={24} md={12} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Carousel autoplay style={{ width: '100%' }}>
                            <div>
                                <div style={contentStyle}>
                                    <img
                                        src="https://via.placeholder.com/600x300?text=精致料理"
                                        alt="精致料理"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div style={contentStyle}>
                                    <img
                                        src="https://via.placeholder.com/600x300?text=舒适环境"
                                        alt="舒适环境"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div style={contentStyle}>
                                    <img
                                        src="https://via.placeholder.com/600x300?text=特色佳肴"
                                        alt="特色佳肴"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </Carousel>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Home;
