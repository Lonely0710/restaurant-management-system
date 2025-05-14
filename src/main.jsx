import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd'; // Import AntApp
import 'antd/dist/reset.css'; 
import router from './routes'; 
// import './index.css'; // Or your global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ConfigProvider allows theme customization */}
    <ConfigProvider
      theme={{
        // Example: Customize primary color
        // token: { colorPrimary: '#00b96b' },
      }}
    >
      {/* AntApp provides context for message, notification, modal static methods */}
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);