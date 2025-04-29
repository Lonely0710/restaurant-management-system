// src/customer/CustomerLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function CustomerLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff', flexGrow: 1 }}>
          欢迎光临 - 在线点餐
        </Title>
        <Link to="/">
          <Button icon={<HomeOutlined />}>返回首页</Button>
        </Link>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 'calc(100vh - 180px)', borderRadius: '8px' }}>
          {/* Child route component (Ordering, Payment, Waiting) renders here */}
          <Outlet />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '12px 50px' }}>
        餐厅管理系统 ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default CustomerLayout;