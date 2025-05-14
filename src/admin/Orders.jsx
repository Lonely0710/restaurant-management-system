// src/admin/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Table, Space, Tag, Button, Modal, Spin, Typography, message, Descriptions, List, Card, Avatar, Badge, Divider } from 'antd';
import { EyeOutlined, CheckOutlined, CloseOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

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
      const response = await axios.get('/api/orders');
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
      const response = await axios.get(`/api/orders/${orderId}`);
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
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
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
        title="订单详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={700}
        style={{ top: 20 }}
        className="order-detail-modal"
      >
        <Spin spinning={detailsLoading}>
          {selectedOrder ? (
            <div>
              {/* 基本信息 */}
              <Descriptions title="订单信息" bordered column={2}>
                <Descriptions.Item label="订单ID">{selectedOrder.order_id}</Descriptions.Item>
                <Descriptions.Item label="订单状态">{getStatusTag(selectedOrder.status)}</Descriptions.Item>
                <Descriptions.Item label="用户">{selectedOrder.user_name || '顾客' + selectedOrder.user_id}</Descriptions.Item>
                <Descriptions.Item label="手机号">{selectedOrder.phone || '未提供'}</Descriptions.Item>
                <Descriptions.Item label="下单时间" span={2}>
                  {moment(selectedOrder.order_time).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="备注" span={2}>
                  {selectedOrder.remark || '无备注'}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* 订单项目 */}
              <Title level={4}>订单项目</Title>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <List
                  itemLayout="horizontal"
                  dataSource={selectedOrder.items}
                  renderItem={(item) => (
                    <List.Item>
                      <Card style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <Text strong>{item.dish_name}</Text>
                            {item.style && <Tag color="green" style={{ marginLeft: 8 }}>{item.style}</Tag>}
                          </div>
                          <div>
                            <Badge count={item.quantity} showZero style={{ backgroundColor: '#52c41a' }} />
                            <Text type="secondary" style={{ marginLeft: 16 }}>
                              单价：￥{Number(item.price).toFixed(2)}
                            </Text>
                            <Text strong style={{ marginLeft: 16 }}>
                              小计：￥{Number(item.price * item.quantity).toFixed(2)}
                            </Text>
                          </div>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              ) : (
                <Text type="secondary">无订单项目数据</Text>
              )}

              <Divider />

              {/* 支付信息 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>支付信息</Title>
                <Text strong style={{ fontSize: 18 }}>
                  总计：￥{Number(selectedOrder.total_amount).toFixed(2)}
                </Text>
              </div>
              {selectedOrder.payment ? (
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="支付方式">
                    {selectedOrder.payment.payment_method === 'cash' ? '现金' :
                      selectedOrder.payment.payment_method === 'wechat' ? '微信支付' :
                        selectedOrder.payment.payment_method === 'alipay' ? '支付宝' :
                          selectedOrder.payment.payment_method}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付状态">
                    {selectedOrder.payment.status === 1 ?
                      <Tag color="green">已支付</Tag> :
                      <Tag color="red">未支付</Tag>}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付时间">
                    {selectedOrder.payment.payment_time ?
                      moment(selectedOrder.payment.payment_time).format('YYYY-MM-DD HH:mm:ss') :
                      '未支付'}
                  </Descriptions.Item>
                  <Descriptions.Item label="交易号">
                    {selectedOrder.payment.transaction_id || '无交易号'}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <Text type="secondary">暂无支付信息</Text>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">加载订单详情...</Text>
            </div>
          )}
        </Spin>
      </Modal>

      {/* 添加全局CSS样式 */}
      <style jsx="true">{`
        .order-detail-modal .ant-modal-content {
          background-color: #f8f8ff;
        }
        .order-detail-modal .ant-modal-header {
          background-color: #f0f8ff;
        }
      `}</style>
    </div>
  );
}

export default Orders;