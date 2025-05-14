// src/customer/CustomerLayout.jsx
import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Menu, Avatar, Dropdown, Space, Badge, Divider } from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  LogoutOutlined,
  SettingOutlined,
  BellOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

function CustomerLayout() {
  const navigate = useNavigate();
  // 假设的用户数据
  const [user, setUser] = useState({
    name: '张三',
    avatar: null,
    notifications: 2
  });

  // 用户菜单
  const userMenu = (
    <Menu
      items={[
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: '个人信息',
          onClick: () => console.log('个人信息')
        },
        {
          key: 'orders',
          icon: <HistoryOutlined />,
          label: '历史订单',
          onClick: () => console.log('历史订单')
        },
        {
          key: 'settings',
          icon: <SettingOutlined />,
          label: '账号设置',
          onClick: () => console.log('账号设置')
        },
        {
          type: 'divider'
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          danger: true,
          onClick: () => navigate('/')
        }
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff', flexGrow: 1 }}>
          欢迎光临 - 在线点餐
        </Title>

        <Space size={16}>
          <Link to="/">
            <Button icon={<HomeOutlined />}>返回首页</Button>
          </Link>

          <Badge count={user.notifications} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              style={{ fontSize: '16px' }}
              onClick={() => console.log('通知')}
            />
          </Badge>

          <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
            <Space className="ant-dropdown-link" style={{ cursor: 'pointer' }}>
              <Avatar
                style={{ backgroundColor: '#1890ff' }}
                icon={<UserOutlined />}
                src={user.avatar}
              />
              <Text>{user.name}</Text>
            </Space>
          </Dropdown>
        </Space>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{
          background: '#fff',
          padding: 24,
          minHeight: 'calc(100vh - 180px)',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          {/* Child route component (Ordering, Payment, Waiting) renders here */}
          <Outlet />
        </div>
      </Content>

      <Footer style={{
        textAlign: 'center',
        background: '#f0f2f5',
        padding: '12px 50px',
        borderTop: '1px solid #f0f0f0'
      }}>
        <Divider style={{ margin: '8px 0 16px' }} />
        <Space split={<Divider type="vertical" />}>
          <Text type="secondary">餐厅管理系统</Text>
          <Text type="secondary">联系我们: 400-123-4567</Text>
          <Text type="secondary">©{new Date().getFullYear()}</Text>
        </Space>
      </Footer>
    </Layout>
  );
}

export default CustomerLayout;