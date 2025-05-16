// src/customer/Payment.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Button, List, Typography, Descriptions, Result, Spin, message,
  Divider, Card, Radio, Space, Steps, Image, Row, Col, Tag, Avatar
} from 'antd';
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  WalletOutlined,
  AlipayCircleOutlined,
  WechatOutlined,
  CreditCardFilled
} from '@ant-design/icons';
import api from '../utils/api'; // 使用自定义的api实例

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderItems, total } = location.state || { orderItems: [], total: 0 }; // Get cart data from route state

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null); // Store placed order ID if available
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // 获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      try {
        const response = await api.get('/auth/me');
        setCurrentUser(response.data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 如果获取用户信息失败，模拟一个默认用户（仅用于开发测试）
        setCurrentUser({
          user_id: localStorage.getItem('userId') || '1001',
          name: '默认用户',
          phone: '138****8888'
        });
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Redirect if no order items are passed
  useEffect(() => {
    if (!orderItems || orderItems.length === 0) {
      message.error("购物车为空，请先点餐！");
      navigate('/customer/order');
    }
  }, [orderItems, navigate]);

  const handleConfirmPayment = async () => {
    setLoading(true);
    console.log("Placing order:", orderItems);
    console.log("Payment method:", paymentMethod);

    try {
      // 获取用户ID
      const userId = currentUser?.user_id || localStorage.getItem('userId') || '1001';

      // 注意：存储过程每次只接受一个菜品和数量，需要循环处理每个菜品

      // 第一步：先创建订单并获取订单ID
      const firstItem = orderItems[0];
      const initialOrderData = {
        user_id: userId,
        menu_id: firstItem.menu_id,
        quantity: firstItem.quantity,
        is_first_item: true,  // 标记这是第一个菜品，需要创建新订单
        payment_method: paymentMethod
      };

      console.log("创建初始订单:", initialOrderData);
      const initialResponse = await api.post('/orders/create-with-item', initialOrderData);

      // 获取创建的订单ID
      const newOrderId = initialResponse.data.order_id;
      console.log("获取到订单ID:", newOrderId);

      // 如果有多个菜品，继续添加剩余菜品到同一个订单
      if (orderItems.length > 1) {
        for (let i = 1; i < orderItems.length; i++) {
          const item = orderItems[i];
          const additionalItemData = {
            user_id: userId,
            order_id: newOrderId,   // 使用已创建的订单ID
            menu_id: item.menu_id,
            quantity: item.quantity,
            is_first_item: false    // 标记这不是第一个菜品，使用现有订单
          };

          console.log(`添加第${i + 1}个菜品到订单:`, additionalItemData);
          await api.post('/orders/add-item', additionalItemData);
        }
      }

      // 处理支付信息（这里假设支付都成功）
      const paymentData = {
        order_id: newOrderId,
        amount: total,
        method: paymentMethod
      };

      await api.post('/payments', paymentData);

      setOrderId(newOrderId);
      setOrderPlaced(true);
      message.success('订单支付成功!');

      // 延迟跳转到等待页面
      setTimeout(() => {
        navigate('/customer/waiting', {
          state: {
            orderId: newOrderId,
            orderItems,
            total,
            paymentMethod
          }
        });
      }, 2000);

    } catch (error) {
      console.error("下单失败:", error);
      message.error('订单提交失败: ' + (error.response?.data?.error || error.message || '请稍后重试'));
      setLoading(false);
    }
  };

  const handleBackToOrder = () => {
    navigate('/customer/order');
  };

  if (orderPlaced) {
    return (
      <Result
        status="success"
        title="订单支付成功!"
        subTitle={`您的订单号是: ${orderId || 'N/A'}. 正在跳转到等待页面...`}
        icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
      />
    );
  }

  if (loadingUser) {
    // 渲染加载状态
    return <Spin spinning={true} tip="加载用户信息..."><div style={{ minHeight: '200px' }}></div></Spin>;
  }

  if (!orderItems || orderItems.length === 0) {
    // 渲染最小内容或由useEffect处理的重定向
    return <Spin spinning={true} tip="加载订单信息..."><div style={{ minHeight: '200px' }}></div></Spin>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackToOrder}
          style={{ padding: 0, marginBottom: 16 }}
        >
          返回点餐
        </Button>
        <Title level={2}>确认订单并支付</Title>

        <Steps
          current={1}
          style={{ marginBottom: 32 }}
          size="small"
        >
          <Step title="点餐" icon={<ShoppingOutlined />} />
          <Step title="支付" icon={<CreditCardOutlined />} />
          <Step title="完成" icon={<CheckOutlined />} />
        </Steps>
      </div>

      <Spin spinning={loading} tip="正在处理支付...">
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ShoppingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>订单详情</span>
                </div>
              }
              bordered={true}
              style={{ marginBottom: 24 }}
            >
              <List
                itemLayout="horizontal"
                dataSource={orderItems}
                renderItem={item => (
                  <List.Item>
                    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
                      <div style={{ marginRight: 16, flex: '0 0 60px' }}>
                        <Image
                          src={item.img_url || 'https://placehold.co/100x100/e8e8e8/787878?text=图片'}
                          alt={item.name}
                          width={60}
                          height={60}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          preview={false}
                          fallback="https://placehold.co/60x60/e8e8e8/787878?text=暂无图片"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text strong>{item.name}</Text>
                          <Text strong>￥{(item.price * item.quantity).toFixed(2)}</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999' }}>
                          <Text type="secondary">￥{item.price.toFixed(2)} × {item.quantity}</Text>
                          {item.category && <Tag color="blue">{item.category}</Tag>}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ padding: '0 8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>商品金额</Text>
                  <Text>￥{total.toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>配送费</Text>
                  <Text>￥0.00</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>优惠</Text>
                  <Text type="success">-￥0.00</Text>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>应付总额</Text>
                  <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>￥{total.toFixed(2)}</Text>
                </div>
              </div>
            </Card>

            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>用餐人信息</span>
                </div>
              }
              bordered={true}
              style={{ marginBottom: 24 }}
            >
              <div style={{ padding: '8px 0' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>用餐人</Text>
                    <Text strong>{currentUser?.name || '默认用户'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>手机号</Text>
                    <Text strong>{currentUser?.phone || '138****8888'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>备注</Text>
                    <Text type="secondary">无需餐具，谢谢</Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <WalletOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <span>支付方式</span>
                </div>
              }
              bordered={true}
              style={{ marginBottom: 24 }}
            >
              <Radio.Group
                onChange={(e) => setPaymentMethod(e.target.value)}
                value={paymentMethod}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card.Grid style={{ width: '100%', padding: '12px', cursor: 'pointer' }} onClick={() => setPaymentMethod('wechat')}>
                    <Radio value="wechat">
                      <Space>
                        <WechatOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                        <span>微信支付</span>
                      </Space>
                    </Radio>
                  </Card.Grid>

                  <Card.Grid style={{ width: '100%', padding: '12px', cursor: 'pointer' }} onClick={() => setPaymentMethod('alipay')}>
                    <Radio value="alipay">
                      <Space>
                        <AlipayCircleOutlined style={{ color: '#1890ff', fontSize: 20 }} />
                        <span>支付宝</span>
                      </Space>
                    </Radio>
                  </Card.Grid>

                  <Card.Grid style={{ width: '100%', padding: '12px', cursor: 'pointer' }} onClick={() => setPaymentMethod('cash')}>
                    <Radio value="cash">
                      <Space>
                        <CreditCardFilled style={{ color: '#faad14', fontSize: 20 }} />
                        <span>到店现金支付</span>
                      </Space>
                    </Radio>
                  </Card.Grid>
                </Space>
              </Radio.Group>
            </Card>

            <Card bordered={true}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>商品金额：</Text>
                  <Text>￥{total.toFixed(2)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>应付总额：</Text>
                  <Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>￥{total.toFixed(2)}</Text>
                </div>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleConfirmPayment}
                loading={loading}
                disabled={orderItems.length === 0}
                style={{ height: '46px', fontSize: '16px' }}
              >
                立即支付
              </Button>

              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  点击按钮即表示您同意<a href="#!">《用户协议》</a>
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default Payment;