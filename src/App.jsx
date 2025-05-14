// src/App.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

function App() {
  // This component mainly acts as a wrapper for nested routes.
  // You could add a global header/footer here if it applies to ALL roles.
  // Using Ant Design's <App> component in main.jsx handles message/notification contexts.
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Minimal wrapper, specific layouts handle navigation */}
      <Content style={{ padding: '0', margin: '0' }}>
        {/* Outlet renders the matched child route component */}
        <Outlet />
      </Content>
    </Layout>
  );
}

export default App;