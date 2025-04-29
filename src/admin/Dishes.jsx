// src/admin/Dishes.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Spin, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// import axios from 'axios'; // Uncomment for API calls

const { Title } = Typography;
const { Option } = Select;

function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null); // null for Add, dish object for Edit
  const [form] = Form.useForm(); // Form instance

  // Placeholder data/API call
  const fetchDishes = async () => {
    setLoading(true);
    console.log("Fetching dishes...");
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Replace with actual API call:
      // const response = await axios.get('/api/menu');
      // setDishes(response.data);

      // Dummy Data:
      setDishes([
        { menu_id: 1, name: '宫保鸡丁', price: 25.00, category: '主菜' },
        { menu_id: 2, name: '水煮鱼', price: 58.00, category: '主菜' },
        { menu_id: 3, name: '米饭', price: 2.00, category: '主食' },
        { menu_id: 4, name: '可乐', price: 5.00, category: '饮料' },
      ]);
      // message.success('菜品加载成功!'); // Optional: Can be chatty
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
      message.error('加载菜品失败!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // Modal Open/Close
  const showAddModal = () => {
    setEditingDish(null);
    form.resetFields(); // Clear form for adding
    setIsModalOpen(true);
  };

  const showEditModal = (dish) => {
    setEditingDish(dish);
    form.setFieldsValue({ // Populate form for editing
      ...dish,
      price: Number(dish.price) // Ensure price is number for InputNumber
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingDish(null); // Reset editing state
  };

  // Form Submission (Add/Edit)
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      console.log('Form Values:', values);

      if (editingDish) {
        // --- Edit Logic ---
        console.log(`Updating dish ${editingDish.menu_id}...`);
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Replace with actual API PUT call:
        // await axios.put(`/api/menu/${editingDish.menu_id}`, values);
        message.success(`菜品 "${values.name}" 更新成功!`);
      } else {
        // --- Add Logic ---
        console.log('Adding new dish...');
        // Simulate API Call
        await new Promise(resolve => setTimeout(resolve, 500));
        // Replace with actual API POST call:
        // const response = await axios.post('/api/menu', values);
        // const newDish = response.data; // Assuming API returns the new dish
        message.success(`菜品 "${values.name}" 添加成功!`);
      }
      setIsModalOpen(false);
      fetchDishes(); // Refresh the list
    } catch (error) {
      console.error('Form validation/submission failed:', error);
      if (error.response) { // Example: Handle API error response
        message.error(`操作失败: ${error.response.data?.error || '服务器错误'}`);
      } else if (error.errorFields) {
        message.error('请检查表单输入!');
      } else {
        message.error('操作失败!');
      }
    } finally {
      // Ensure loading is turned off even if fetchDishes hasn't finished yet in simulation
      // In real scenario, fetchDishes would handle its own loading state
      setLoading(false);
    }
  };


  // Delete Dish
  const handleDelete = async (dishId, dishName) => {
    setLoading(true);
    console.log(`Deleting dish ${dishId}...`);
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      // Replace with actual API DELETE call:
      // await axios.delete(`/api/menu/${dishId}`);
      message.success(`菜品 "${dishName}" 删除成功!`);
      fetchDishes(); // Refresh list
    } catch (error) {
      console.error(`Failed to delete dish ${dishId}:`, error);
      if (error.response && error.response.status === 400) { // Handle specific errors like "referenced"
        message.error(`删除失败: ${error.response.data?.error || '无法删除'}`);
      } else {
        message.error('删除失败!');
      }
      setLoading(false); // Stop loading on error
    }
    // setLoading(false); // setLoading handled by fetchDishes in success case
  };

  // Table Columns
  const columns = [
    { title: 'ID', dataIndex: 'menu_id', key: 'menu_id', sorter: (a, b) => a.menu_id - b.menu_id, },
    { title: '名称', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `￥${Number(price).toFixed(2)}`,
      sorter: (a, b) => a.price - b.price,
    },
    { title: '分类', dataIndex: 'category', key: 'category', sorter: (a, b) => a.category.localeCompare(b.category) },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>编辑</Button>
          <Popconfirm
            title={`确定删除 "${record.name}" 吗?`}
            onConfirm={() => handleDelete(record.menu_id, record.name)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>菜品管理</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={showAddModal}
        style={{ marginBottom: 16 }}
      >
        添加菜品
      </Button>

      <Spin spinning={loading}>
        <Table columns={columns} dataSource={dishes} rowKey="menu_id" />
      </Spin>

      {/* Add/Edit Modal */}
      <Modal
        title={editingDish ? '编辑菜品' : '添加菜品'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading} // Show loading state on OK button
        destroyOnClose // Reset form state when modal is closed
      >
        <Form form={form} layout="vertical" name="dish_form" initialValues={{ price: 0.01, category: '主菜' }}>
          <Form.Item
            name="name"
            label="菜品名称"
            rules={[{ required: true, message: '请输入菜品名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格 (元)"
            rules={[
              { required: true, message: '请输入价格!' },
              { type: 'number', min: 0.01, message: '价格必须大于0!' }
            ]}
          >
            <InputNumber min={0.01} step={0.1} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类!' }]}
          >
            {/* Ideally fetch categories from API or define constants */}
            <Select placeholder="选择分类">
              <Option value="主菜">主菜</Option>
              <Option value="凉菜">凉菜</Option>
              <Option value="汤类">汤类</Option>
              <Option value="主食">主食</Option>
              <Option value="饮料">饮料</Option>
              <Option value="小吃">小吃</Option>
              <Option value="Uncategorized">未分类</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Dishes;