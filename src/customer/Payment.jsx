// src/customer/Payment.jsx
import React, { useState,useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, List, Typography, Descriptions, Result, Spin, message, Divider } from 'antd';
// import axios from 'axios'; // Uncomment for API calls

const { Title, Text } = Typography;

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderItems, total } = location.state || { orderItems: [], total: 0 }; // Get cart data from route state

  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null); // Store placed order ID if available

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
    // Simulate API call to place the order
    await new Promise(resolve => setTimeout(resolve, 1500));
    try {
      // --- Replace with actual API POST call ---
      // Example data structure to send (adapt based on your backend)
      /*
      const orderData = {
        // customerId: 1, // If you have customer login
        items: orderItems.map(item => ({ menu_id: item.menu_id, quantity: item.quantity })),
        total_amount: total
      };
      const response = await axios.post('/api/orders', orderData); // Adjust endpoint if needed
      setOrderId(response.data.order_id); // Assuming backend returns the new order ID
      */
      // --- End of Replace ---

      // Dummy success state:
      setOrderId(Math.floor(Math.random() * 1000) + 100); // Simulate getting an order ID
      setOrderPlaced(true);
      message.success('订单提交成功!');

      // Optionally navigate automatically after a delay
      setTimeout(() => {
        navigate('/customer/waiting', { state: { orderId: orderId } }); // Pass order ID
      }, 2000);

    } catch (error) {
      console.error("Failed to place order:", error);
      message.error('订单提交失败，请稍后重试!');
      setLoading(false); // Stop loading only on error if not navigating away
    }
    // setLoading(false); // Loading stops implicitly if navigating away or orderPlaced=true hides button
  };

  if (orderPlaced) {
    return (
      <Result
        status="success"
        title="订单提交成功!"
        subTitle={`您的订单号是: ${orderId || 'N/A'}. 正在跳转到等待页面...`}
      // extra={[
      //   <Button type="primary" key="console" onClick={() => navigate('/customer/order')}>
      //     再下一单
      //   </Button>,
      // ]}
      />
    );
  }

  if (!orderItems || orderItems.length === 0) {
    // Render minimal content or redirect handled by useEffect
    return <Spin spinning={true} tip="加载订单信息..."><div style={{ minHeight: '200px' }}></div></Spin>;
  }

  return (
    <div>
      <Title level={2}>确认订单并支付</Title>
      <Spin spinning={loading} tip="正在提交订单...">
        <List
          header={<Title level={4}>订单详情</Title>}
          bordered
          dataSource={orderItems}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={item.name}
                description={`单价: ￥${item.price.toFixed(2)}`}
              />
              <div>数量: {item.quantity}</div>
              <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>小计: ￥{(item.price * item.quantity).toFixed(2)}</div>
            </List.Item>
          )}
          style={{ marginBottom: '24px' }}
        />

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="商品总价">
            <Text strong>￥{total.toFixed(2)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="优惠">
            <Text>￥0.00</Text>
          </Descriptions.Item>
          {/* Add more items like tax, delivery fee if applicable */}
          <Descriptions.Item label="应付总额">
            <Title level={4} style={{ color: '#ff4d4f', margin: 0 }}>￥{total.toFixed(2)}</Title>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Placeholder for actual payment methods */}
        <Title level={4}>支付方式</Title>
        <Text>模拟支付：点击下方按钮即可完成下单。</Text>
        {/* In a real app, you'd integrate Stripe, WeChat Pay, Alipay etc. here */}

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirmPayment}
            loading={loading}
            disabled={orderItems.length === 0}
          >
            确认支付并下单
          </Button>
        </div>
      </Spin>
    </div>
  );
}

export default Payment;