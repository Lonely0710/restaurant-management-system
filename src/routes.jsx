import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import AdminLayout from './admin/AdminLayout';
import Orders from './admin/Orders';
import Dishes from './admin/Dishes';
import CustomerLayout from './customer/CustomerLayout';
import Ordering from './customer/Ordering';
import Payment from './customer/Payment';
import Waiting from './customer/Waiting';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
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
        path: 'customer',
        element: <CustomerLayout />,
        children: [
          {
            path: 'order',
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
      }
    ]
  }
]);

export default router;
