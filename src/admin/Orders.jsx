// src/admin/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Typography, Spin, Button, message } from 'antd';
// import axios from 'axios'; // Uncomment when ready for API calls

const { Title } = Typography;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Placeholder data - replace with API call
  const fetchOrders = async () => {
    setLoading(true);
    console.log('Fetching orders...');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Replace with actual API call
      // const response = await axios.get('/api/orders');
      // setOrders(response.data);

      // Dummy Data:
      setOrders([
        {
          order_id: 101,
          order_date: new Date().toISOString(),
          customer_name: '张三',
          items: [
            { name: '宫保鸡丁', quantity: 1, price: 25.00 },
            { name: '米饭', quantity: 2, price: 2.00 }
          ],
          total_price: 29.00,
          status: 'Pending' // Example status
        },
        {
          order_id: 102,
          order_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          customer_name: '李四',
          items: [{ name: '水煮鱼', quantity: 1, price: 58.00 }],
          total_price: 58.00,
          status: 'Completed' // Example status
        },
      ]);

      message.success('订单加载成功!');
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      message.error('加载订单失败!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns = [
    { title: '订单ID', dataIndex: 'order_id', key: 'order_id' },
    { title: '顾客姓名', dataIndex: 'customer_name', key: 'customer_name' },
    {
      title: '下单时间',
      dataIndex: 'order_date',
      key: 'order_date',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '订单内容',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <ul style={{ margin: 0, paddingLeft: '15px' }}>
          {items.map((item, index) => (
            <li key={index}>{item.name} x {item.quantity}</li>
          ))}
        </ul>
      ),
    },
    {
      title: '总金额',
      dataIndex: 'total_price',
      key: 'total_price',
      render: (price) => `￥${Number(price).toFixed(2)}`,
    },
    {
      title: '状态', // Example column
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Completed' ? 'green' : 'orange'}>{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleViewDetails(record.order_id)}>详情</Button>
          {/* Add more actions like Mark Complete, Delete etc. */}
        </Space>
      ),
    },
  ];

  const handleViewDetails = (orderId) => {
    // Implement logic to show order details, maybe in a Modal
    message.info(`查看订单 ${orderId} 详情 (待实现)`);
    console.log("View details for order:", orderId);
  };

  return (
    <div>
      <Title level={2}>订单管理</Title>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_id"
          style={{ marginTop: 20 }}
        />
      </Spin>
    </div>
  );
}

export default Orders;