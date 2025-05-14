// @ts-nocheck
// src/pages/HomePage.jsx
import React, { useState } from 'react';
// 导入 FloatButton
import { Card, Button, Typography, Flex, message, FloatButton } from 'antd';
import { UserOutlined, CrownOutlined, DatabaseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

function HomePage() {
  const navigate = useNavigate();
  const [checkingDb, setCheckingDb] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const goToAdmin = () => {
    navigate('/admin/orders');
  };

  const goToCustomer = () => {
    navigate('/customer/order');
  };

  const handleCheckDbConnection = async () => {
    setCheckingDb(true);

    try {
      const response = await fetch('http://localhost:3001/api/test'); // 确保端口和路径正确
      const data = await response.json();

      if (response.ok) {
        messageApi.success(data.message || '数据库连接正常');
      } else {
        const errorMessage = data.message || data.error || '未知连接失败';
        messageApi.error(`数据库连接失败: ${errorMessage}`);
      }

    } catch (error) {
      console.error('数据库连接测试请求失败:', error);
      messageApi.error('无法连接到后端服务进行数据库测试，请检查服务器是否运行或网络问题。');
    } finally {
      setCheckingDb(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Flex justify="center" align="center" style={{ minHeight: '80vh', padding: '20px', flexDirection: 'column', gap: '20px' }}>
        <Flex gap="large" wrap="wrap" justify="center">
          {/* Admin Card */}
          <Card
            hoverable
            style={{ width: 300, textAlign: 'center' }}
            cover={<CrownOutlined style={{ fontSize: '72px', color: '#1890ff', paddingTop: '30px' }} />}
            actions={[
              <Button type="primary" key="admin" onClick={goToAdmin}>
                进入管理后台
              </Button>,
            ]}
          >
            <Card.Meta title={<Title level={3}>管理员</Title>} description="管理订单和菜品" />
          </Card>

          {/* Customer Card */}
          <Card
            hoverable
            style={{ width: 300, textAlign: 'center' }}
            cover={<UserOutlined style={{ fontSize: '72px', color: '#52c41a', paddingTop: '30px' }} />}
            actions={[
              <Button type="primary" key="customer" onClick={goToCustomer} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                开始点餐
              </Button>,
            ]}
          >
            <Card.Meta title={<Title level={3}>顾客</Title>} description="浏览菜单并下单" />
          </Card>
        </Flex>

      </Flex>

      {/* 添加 FloatButton */}
      <FloatButton
        icon={<DatabaseOutlined />}
        tooltip={<div>测试数据库连接</div>} // 鼠标悬停时的提示文本
        onClick={handleCheckDbConnection}
        loading={checkingDb ? true : undefined}
        // 可以通过 style 或 position 属性调整位置
        style={{ right: 50, bottom: 100 }}
      />
    </>
  );
}

export default HomePage;