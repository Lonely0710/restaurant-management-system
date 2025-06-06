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

function LayoutWithRole({ role }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // 动态菜单：员工不显示用户管理
  const menuItems = [
    { key: 'dishes', label: <Link to={`/${role}/dishes`}>菜品管理</Link>, icon: <AppstoreOutlined /> },
    { key: 'orders', label: <Link to={`/${role}/orders`}>订单管理</Link>, icon: <ShoppingCartOutlined /> },
    ...(role === 'admin' ? [{ key: 'users', label: <Link to="/admin/users">用户管理</Link>, icon: <UserOutlined /> }] : []),
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  ];

  // 面包屑
  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <Link to="/">首页</Link>
    </Breadcrumb.Item>,
    <Breadcrumb.Item key={role}>{role === 'admin' ? '管理员' : '员工'}</Breadcrumb.Item>
  ];
  if (currentPath === `/${role}/orders`) {
    breadcrumbItems.push(<Breadcrumb.Item key="orders">订单管理</Breadcrumb.Item>);
  } else if (currentPath === `/${role}/dishes`) {
    breadcrumbItems.push(<Breadcrumb.Item key="dishes">菜品管理</Breadcrumb.Item>);
  } else if (role === 'admin' && currentPath === '/admin/users') {
    breadcrumbItems.push(<Breadcrumb.Item key="users">用户管理</Breadcrumb.Item>);
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {role === 'admin' ? 'Admin CMS' : 'Employee CMS'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentPath]}
          items={menuItems}
          style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff' }}>
          <Title level={4} style={{ margin: '16px 0', color: '#1890ff' }}>
            餐厅管理系统 - {role === 'admin' ? '管理员' : '员工'}
          </Title>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {breadcrumbItems}
          </Breadcrumb>
          <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default LayoutWithRole;