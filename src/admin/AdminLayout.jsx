// src/admin/AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Breadcrumb, Typography } from 'antd';
import {
  ShoppingCartOutlined,
  AppstoreOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  const menuItems = [
    { key: 'dishes', label: <Link to="/admin/dishes">菜品管理</Link>, icon: <AppstoreOutlined /> },
    { key: 'orders', label: <Link to="/admin/orders">订单管理</Link>, icon: <ShoppingCartOutlined /> },
    { key: 'users', label: <Link to="/admin/users">用户管理</Link>, icon: <UserOutlined /> },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
  ];

  // Determine breadcrumb items based on path
  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/">首页</Link>
    </Breadcrumb.Item>,
    <Breadcrumb.Item key="admin">管理员</Breadcrumb.Item>
  ];
  if (currentPath === '/admin/orders') {
    breadcrumbItems.push(<Breadcrumb.Item key="orders">订单管理</Breadcrumb.Item>);
  } else if (currentPath === '/admin/dishes') {
    breadcrumbItems.push(<Breadcrumb.Item key="dishes">菜品管理</Breadcrumb.Item>);
  }


  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          Admin CMS
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }} // Adjust height to fit back button
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff' }}>
          {/* Can add Header content like user profile dropdown */}
          <Title level={4} style={{ margin: '16px 0', color: '#1890ff' }}>餐厅管理系统 - 管理员</Title>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbItems}
          </Breadcrumb>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            {/* Child route component (Orders or Dishes) renders here */}
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;