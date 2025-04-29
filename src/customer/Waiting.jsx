// src/customer/Waiting.jsx
import React from 'react';
import { Result, Button, Spin } from 'antd';
import { Link, useLocation } from 'react-router-dom';

function Waiting() {
  const location = useLocation();
  const orderId = location.state?.orderId; // Get orderId passed from Payment

  return (
    <Result
      icon={<Spin size="large" />}
      title="订单已收到，正在准备中..."
      subTitle={`您的订单 ${orderId ? `(编号: ${orderId})` : ''} 正在快马加鞭制作，请稍候片刻。`}
      extra={[
        <Link to="/customer/order" key="order">
          <Button type="default">查看菜单</Button>
        </Link>,
        <Link to="/" key="home">
          <Button type="primary">返回首页</Button>
        </Link>,
      ]}
    />
  );
}

export default Waiting;