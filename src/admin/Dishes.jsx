// src/admin/Dishes.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Spin, Typography, Tag, Tooltip, notification, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import api from '../utils/api'; // 替换为自定义api实例

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null); // null for Add, dish object for Edit
  const [categoryForm] = Form.useForm(); // Form instance for category
  const [form] = Form.useForm(); // Form instance for dish

  // 使用全局消息提示API
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();

  // 使用API获取菜品数据
  const fetchDishes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/menu');
      const menuData = Array.isArray(response.data) ? response.data : [];
      setDishes(menuData);
    } catch (error) {
      console.error('获取菜品失败:', error);
      notificationApi.error({
        message: <Typography.Text strong>获取菜品失败</Typography.Text>,
        description: '无法从服务器获取菜品数据，请检查网络连接或稍后重试。',
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取分类数据
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('获取分类失败:', error);
      notificationApi.error({
        message: <Typography.Text strong>获取分类失败</Typography.Text>,
        description: '无法从服务器获取分类数据，请检查网络连接或稍后重试。',
        duration: 4,
      });
    }
  };

  useEffect(() => {
    fetchDishes();
    fetchCategories();
  }, []);

  // Dish Modal Open/Close
  const showAddModal = () => {
    setEditingDish(null);
    form.resetFields(); // Clear form for adding
    setIsModalOpen(true);
  };

  const showEditModal = (dish) => {
    setEditingDish(dish);
    form.setFieldsValue({ // Populate form for editing
      name: dish.name,
      price: Number(dish.price), // Ensure price is number for InputNumber
      category_id: dish.category_id,
      style: dish.style || ''
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingDish(null); // Reset editing state
  };

  // Category Modal functions
  const showCategoryModal = () => {
    categoryForm.resetFields();
    setIsCategoryModalOpen(true);
  };

  const handleCategoryCancel = () => {
    setIsCategoryModalOpen(false);
  };

  const handleCategorySubmit = async () => {
    try {
      const values = await categoryForm.validateFields();
      setLoading(true);

      await api.post('/categories', values);
      notificationApi.success({
        message: <Typography.Text strong>分类添加成功</Typography.Text>,
        description: `分类 "${values.category_name}" 已成功添加！`,
        duration: 3,
      });

      setIsCategoryModalOpen(false);
      fetchCategories(); // Refresh categories
    } catch (error) {
      console.error('添加分类失败:', error);
      if (error.response?.data?.error) {
        notificationApi.error({
          message: <Typography.Text strong>添加分类失败</Typography.Text>,
          description: error.response.data.error,
          duration: 4,
        });
      } else if (error.errorFields) {
        messageApi.error('请检查表单输入!');
      } else {
        notificationApi.error({
          message: <Typography.Text strong>添加分类失败</Typography.Text>,
          description: '添加分类时发生错误，请稍后重试。',
          duration: 4,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Form Submission (Add/Edit)
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingDish) {
        // --- Edit Logic ---
        await api.put(`/menu/${editingDish.menu_id}`, values);
        notificationApi.success({
          message: <Typography.Text strong>菜品更新成功</Typography.Text>,
          description: `菜品 "${values.name}" 已成功更新！`,
          icon: <EditOutlined style={{ color: '#108ee9' }} />,
          duration: 3,
        });
      } else {
        // --- Add Logic ---
        await api.post('/menu', values);
        notificationApi.success({
          message: <Typography.Text strong>菜品添加成功</Typography.Text>,
          description: `菜品 "${values.name}" 已成功添加！`,
          icon: <PlusOutlined style={{ color: '#52c41a' }} />,
          duration: 3,
        });
      }
      setIsModalOpen(false);
      fetchDishes(); // Refresh the list
    } catch (error) {
      console.error('Form validation/submission failed:', error);
      if (error.response) { // Example: Handle API error response
        notificationApi.error({
          message: < Typography.Text strong >操作失败</Typography.Text >,
          description: error.response.data?.error || '服务器错误，请稍后重试。',
          duration: 4,
        });
      } else if (error.errorFields) {
        messageApi.error('请检查表单输入!');
      } else {
        notificationApi.error({
          message: <Typography.Text strong>操作失败</Typography.Text>,
          description: '操作过程中发生错误，请稍后重试。',
          duration: 4,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete Dish
  const handleDelete = async (menu_id, name) => {
    setLoading(true);
    try {
      await api.delete(`/menu/${menu_id}`);
      notificationApi.success({
        message: <Typography.Text strong>菜品删除成功</Typography.Text>,
        description: `菜品 "${name}" 已成功删除！`,
        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
        duration: 3,
      });
      fetchDishes(); // Refresh list
    } catch (error) {
      console.error(`Failed to delete dish ${menu_id}:`, error);
      if (error.response && error.response.status === 400) {
        // 显示更友好的错误信息
        const errorMessage = error.response.data?.error || '无法删除';
        notificationApi.error({
          message: <Typography.Text strong>删除失败</Typography.Text>,
          description: errorMessage,
          duration: 4,
        });
      } else if (error.response && error.response.status === 404) {
        notificationApi.warning({
          message: <Typography.Text strong>菜品不存在</Typography.Text>,
          description: '要删除的菜品不存在或已被删除，系统将自动刷新菜品列表。',
          duration: 3,
        });
        fetchDishes(); // 刷新列表，因为该菜品可能已不存在
      } else {
        notificationApi.error({
          message: <Typography.Text strong>删除失败</Typography.Text>,
          description: '删除菜品时发生错误，请稍后重试。',
          duration: 4,
        });
      }
    } finally {
      setLoading(false); // 无论成功与否都要停止加载状态
    }
  };

  // 获取分类名称显示
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : '未分类';
  };

  // Table Columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'menu_id',
      key: 'menu_id',
      width: 80,
      sorter: (a, b) => a.menu_id - b.menu_id,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => `￥${Number(price).toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category',
      render: (categoryId) => (
        <Tag color="blue">{getCategoryName(categoryId)}</Tag>
      ),
      filters: categories.map(cat => ({ text: cat.category_name, value: cat.category_id })),
      onFilter: (value, record) => record.category_id === value,
    },
    {
      title: '风格',
      dataIndex: 'style',
      key: 'style',
      render: (style) => style ? <Tag color="green">{style}</Tag> : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="middle"
          >
            编辑
          </Button>
          <Popconfirm
            title={`确定删除 "${record.name}" 吗?`}
            description="删除后无法恢复，请谨慎操作"
            onConfirm={() => handleDelete(record.menu_id, record.name)}
            okText="确定"
            cancelText="取消"
            icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="middle"
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder} {/* 消息提示上下文 */}
      {notificationContextHolder} {/* 通知提示上下文 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>菜品管理</Title>
        <Space>
          <Tooltip title="关于ID自增问题">
            <Button
              type="link"
              icon={<InfoCircleOutlined />}
              onClick={() =>
                Modal.info({
                  title: '关于ID自增问题',
                  content: (
                    <div>
                      <p>您可能注意到删除菜品后，新增菜品的ID不会复用已删除的ID号。</p>
                      <p>这是数据库自增ID的标准行为，它确保每条记录都有唯一的ID，即使在删除后也不会重复使用。</p>
                      <p>这种设计有助于避免数据引用混乱和潜在的安全问题。</p>
                    </div>
                  ),
                  okText: '我知道了'
                })
              }
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
          >
            添加菜品
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={dishes}
          rowKey="menu_id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Spin>

      {/* Add/Edit Dish Modal */}
      <Modal
        title={editingDish ? '编辑菜品' : '添加菜品'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading} // Show loading state on OK button
        destroyOnClose // Reset form state when modal is closed
        style={{ top: 20 }}
        className="dish-modal"
        width={800} // 增加弹窗宽度
      >
        <Form form={form} layout="vertical" name="dish_form">
          <Form.Item
            name="name"
            label="菜品名称"
            rules={[{ required: true, message: '请输入菜品名称!' }]}
          >
            <Input placeholder="请输入菜品名称" />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格 (元)"
            rules={[
              { required: true, message: '请输入价格!' },
              { type: 'number', min: 0.01, message: '价格必须大于0!' }
            ]}
          >
            <InputNumber
              min={0.01}
              step={0.1}
              precision={2}
              style={{ width: '100%' }}
              placeholder="请输入价格"
            />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类!' }]}
          >
            <Select
              placeholder="选择分类"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Divider style={{ margin: '8px 0' }} />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={showCategoryModal}
                    style={{ width: '100%', textAlign: 'left' }}
                  >
                    添加新分类
                  </Button>
                </>
              )}
            >
              {categories.map(category => (
                <Option key={category.category_id} value={category.category_id}>
                  {category.category_name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="style"
            label="菜品风格"
          >
            <Input placeholder="请输入菜品风格，如：辣味、酸甜、清淡等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        title="添加新分类"
        open={isCategoryModalOpen}
        onOk={handleCategorySubmit}
        onCancel={handleCategoryCancel}
        confirmLoading={loading}
        style={{ top: 20 }}
        className="category-modal"
        width={600} // 增加弹窗宽度
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="category_name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称!' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Dishes;