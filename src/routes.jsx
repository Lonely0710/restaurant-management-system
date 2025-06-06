import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import AdminLayout from './admin/AdminLayout';
import Orders from './admin/Orders';
import Dishes from './admin/Dishes';
import Users from './admin/Users';
import CustomerLayout from './customer/CustomerLayout';
import Ordering from './customer/Ordering';
import Payment from './customer/Payment';
import Waiting from './customer/Waiting';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ConcurrencyTestPage from './pages/test/ConcurrencyTestPage';
import { Navigate } from 'react-router-dom';
import EmployeeDashboard, { EmployeeLayout } from './employee/EmployeeDashboard';
import LayoutWithRole from './admin/AdminLayout';

// 错误边界组件
const ErrorBoundary = () => {
  return (
    <div style={{
      padding: '48px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px' }}>页面未找到</h1>
      <p style={{ marginBottom: '32px', color: '#666' }}>抱歉，您访问的页面不存在</p>
      <button
        onClick={() => window.location.href = '/'}
        style={{
          padding: '10px 20px',
          background: '#1890ff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        返回首页
      </button>
    </div>
  );
};

// 身份识别高阶组件
function EmployeeRouteGuard({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  // 1 代表员工
  if (user.identity === 1) {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'test/concurrency',
        element: <ConcurrencyTestPage />
      },
      {
        path: 'admin',
        element: <LayoutWithRole role="admin" />,
        children: [
          {
            index: true,
            element: <Orders />
          },
          {
            path: 'dashboard',
            element: <Orders />
          },
          {
            path: 'orders',
            element: <Orders />
          },
          {
            path: 'dishes',
            element: <Dishes />
          },
          {
            path: 'users',
            element: <Users />
          }
        ]
      },
      {
        path: 'customer',
        element: <CustomerLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/customer/ordering" replace />
          },
          {
            path: 'menu',
            element: <Ordering />
          },
          {
            path: 'ordering',
            element: <Ordering />
          },
          {
            path: 'payment',
            element: <Payment />
          },
          {
            path: 'waiting',
            element: <Waiting />
          }
        ]
      },
      {
        path: 'employee',
        element: (
          <EmployeeRouteGuard>
            <EmployeeLayout />
          </EmployeeRouteGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/employee/dashboard" replace />
          },
          {
            path: 'dashboard',
            element: <EmployeeDashboard />
          },
          {
            path: 'orders',
            element: <Orders />
          },
          {
            path: 'dishes',
            element: <Dishes />
          }
        ]
      },
      {
        path: '*',
        element: <Navigate to="/" replace />
      }
    ]
  }
]);

export default router;
