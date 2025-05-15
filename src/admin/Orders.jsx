// src/admin/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Table, Space, Tag, Button, Modal, Spin, Typography, message, Descriptions, List, Card, Avatar, Badge, Divider, Empty } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ShoppingCartOutlined, UserOutlined, PhoneOutlined, ClockCircleOutlined, ShoppingOutlined, CreditCardOutlined } from '@ant-design/icons';
import api from '../utils/api';
import moment from 'moment';
import '../styles/OrderDetail.css';

const { Title, Text } = Typography;

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const ordersData = Array.isArray(response.data) ? response.data : [];
      setOrders(ordersData);
    } catch (error) {
      console.error('获取订单失败:', error);
      messageApi.error('获取订单数据失败，请稍后重试！');
    } finally {
      setLoading(false);
    }
  };

  // 手动刷新订单数据
  const handleRefresh = async () => {
    try {
      await fetchOrders();
      messageApi.success('订单数据加载成功！');
    } catch (error) {
      // fetchOrders 已经处理了错误
    }
  };

  // 获取订单详情
  const fetchOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error(`获取订单详情失败 ID=${orderId}:`, error);
      messageApi.error('获取订单详情失败，请稍后重试！');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 查看订单详情
  const handleViewDetails = (order) => {
    setSelectedOrder(null); // 清除之前的数据
    setIsModalVisible(true);
    fetchOrderDetails(order.order_id);
  };

  // 获取订单状态标签
  const getStatusTag = (status) => {
    switch (status) {
      case 0:
        return <Tag color="gold">待确认</Tag>;
      case 1:
        return <Tag color="blue">进行中</Tag>;
      case 2:
        return <Tag color="green">已完成</Tag>;
      case 3:
        return <Tag color="red">已取消</Tag>;
      default:
        return <Tag color="default">未知状态</Tag>;
    }
  };

  // 表格列定义
  const columns = [
    {
      title: '订单ID',
      dataIndex: 'order_id',
      key: 'order_id',
      sorter: (a, b) => a.order_id - b.order_id,
      width: 120,
    },
    {
      title: '用户',
      dataIndex: 'user_name',
      key: 'user_name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#87d068' }} icon={<ShoppingCartOutlined />} />
          {text || '顾客' + record.user_id}
        </Space>
      ),
    },
    {
      title: '手机号',
      dataIndex: 'user_phone',
      key: 'user_phone',
      render: (phone) => phone || '-',
    },
    {
      title: '订单时间',
      dataIndex: 'order_time',
      key: 'order_time',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) => new Date(a.order_time) - new Date(b.order_time),
      width: 180,
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `￥${Number(amount).toFixed(2)}`,
      sorter: (a, b) => a.total_amount - b.total_amount,
      width: 120,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: '待确认', value: 0 },
        { text: '进行中', value: 1 },
        { text: '已完成', value: 2 },
        { text: '已取消', value: 3 },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="middle"
          >
            查看
          </Button>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>订单管理</Title>
        <Button
          type="primary"
          onClick={handleRefresh}
        >
          刷新
        </Button>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="order_id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Spin>

      {/* 订单详情弹窗 */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
        centered
        className="order-detail-modal"
        closeIcon={null}
      >
        <Spin spinning={detailsLoading}>
          <div className="order-header">
            <div className="order-header-left">
              <h2>订单 #{selectedOrder?.order_id}</h2>
              <div className="order-time">
                <ClockCircleOutlined /> {moment(selectedOrder?.order_time).format('YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            <div className="order-header-right">
              <Badge
                status={selectedOrder?.status === 2 ? "success" : "warning"}
                text={selectedOrder?.status === 2 ? "已支付" : "未支付"}
              />
            </div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsModalVisible(false)}
              className="close-button"
            />
          </div>

          <Divider style={{ margin: '0 0 16px 0' }} />

          {/* 客户信息部分 */}
          <div className="info-section">
            <h3>
              <UserOutlined /> 客户信息
            </h3>
            <div className="customer-info">
              <div className="info-item">
                <span className="label">姓名：</span>
                <span className="value">{selectedOrder?.user_name || (selectedOrder?.user_id ? '顾客' + selectedOrder?.user_id : '-')}</span>
              </div>
              <div className="info-item">
                <span className="label">电话：</span>
                <span className="value">{selectedOrder?.user_phone || '未提供'}</span>
              </div>
              {selectedOrder?.remark && (
                <div className="info-item">
                  <span className="label">备注：</span>
                  <span className="value">{selectedOrder.remark}</span>
                </div>
              )}
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* 订单项目部分 */}
          <div className="info-section">
            <h3>
              <ShoppingOutlined /> 订单项目
            </h3>
            <div className="order-items">
              {selectedOrder?.items && selectedOrder?.items.length > 0 ? (
                <>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <span className="item-name">{item.name}</span>
                        <span className="item-price">¥{Number(item.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="item-quantity">
                        <span>×{item.quantity || 0}</span>
                        <span className="item-subtotal">¥{Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="order-total">
                    <span>总计:</span>
                    <span className="total-amount">¥{Number(selectedOrder?.total_amount || 0).toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <Empty description="暂无订单项目" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* 支付信息部分 */}
          <div className="info-section">
            <h3>
              <CreditCardOutlined /> 支付信息
            </h3>
            {selectedOrder?.payments && selectedOrder.payments.length > 0 ? (
              <div className="payment-info">
                <div className="info-item">
                  <span className="label">支付方式：</span>
                  <span className="value">{selectedOrder.payments[0].payment_method === 'cash' ? '现金' :
                    selectedOrder.payments[0].payment_method === 'wechat' ? '微信支付' :
                      selectedOrder.payments[0].payment_method === 'alipay' ? '支付宝' :
                        selectedOrder.payments[0].payment_method}</span>
                </div>
                <div className="info-item">
                  <span className="label">支付金额：</span>
                  <span className="value highlight">¥{Number(selectedOrder.payments[0].amount || 0).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无支付记录"
                style={{ margin: '16px 0' }}
              />
            )}
          </div>

          <div className="modal-footer">
            <Button type="primary" onClick={() => setIsModalVisible(false)}>
              关闭
            </Button>
          </div>
        </Spin>
      </Modal>
    </div>
  );
}

export default Orders;