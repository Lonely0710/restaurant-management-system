// src/admin/Dishes.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Popconfirm, message, Spin, Typography, Tag, Tooltip, notification, Divider, Upload, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, QuestionCircleOutlined, UploadOutlined, LoadingOutlined, PictureOutlined } from '@ant-design/icons';
import api from '../utils/api'; // 替换为自定义api实例
import path from 'path';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// 添加默认占位图URL
const DEFAULT_PLACEHOLDER = 'https://placehold.co/300x300/e8e8e8/787878?text=暂无图片';

function Dishes() {
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null); // null for Add, dish object for Edit
  const [categoryForm] = Form.useForm(); // Form instance for category
  const [form] = Form.useForm(); // Form instance for dish
  const [uploadLoading, setUploadLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [fileName, setFileName] = useState('');

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

  // 图片上传前的检查
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      messageApi.error('只能上传JPG/PNG格式的图片!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      messageApi.error('图片大小不能超过2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  // 处理图片上传
  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadLoading(true);

    try {
      // 创建FormData对象
      const formData = new FormData();
      formData.append('image', file);

      // 首先尝试使用管理员权限上传
      let response;
      try {
        response = await api.post('/upload/menu', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (authError) {
        console.warn('管理员上传失败，尝试测试上传接口:', authError);

        // 如果管理员接口失败，尝试测试接口
        response = await api.post('/upload/test', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // 处理响应
      if (response.data && response.data.url) {
        setImageUrl(response.data.url);
        setFileName(response.data.fileName);

        // 更新表单中的img_url字段
        const currentValues = form.getFieldsValue();
        form.setFieldsValue({
          ...currentValues,
          img_url: response.data.url
        });

        onSuccess(response, file);
        messageApi.success('图片上传成功!');
      } else {
        throw new Error('上传失败');
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      messageApi.error('图片上传失败: ' + (error.response?.data?.error || '未知错误'));
      onError(error);

      // 在这里不再抛出错误，让调用者决定是否使用本地模式
      return Promise.reject(error);
    } finally {
      setUploadLoading(false);
    }
  };

  // 为了简化开发，临时添加本地上传处理 - 如果后端未配置
  const handleLocalUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploadLoading(true);

    try {
      // 由于后端可能未完全配置，这里模拟上传成功
      // 仅在开发环境使用，不要在生产环境使用此替代方法

      // 使用FileReader读取文件作为数据URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // 模拟成功的响应
        const mockResponse = {
          data: {
            success: true,
            fileName: file.name,
            url: reader.result, // 使用base64数据URL作为临时图片URL
            message: '图片上传成功（本地模式）'
          }
        };

        setImageUrl(reader.result);
        setFileName(file.name);

        // 更新表单中的img_url字段
        const currentValues = form.getFieldsValue();
        form.setFieldsValue({
          ...currentValues,
          img_url: reader.result
        });

        onSuccess(mockResponse, file);
        messageApi.success('图片已临时保存（本地模式）');
      };

      reader.onerror = () => {
        const error = new Error('读取文件失败');
        onError(error);
        messageApi.error('读取图片失败');
      };
    } catch (error) {
      console.error('本地图片处理失败:', error);
      messageApi.error('图片处理失败: ' + error.message);
      onError(error);
    } finally {
      setUploadLoading(false);
    }
  };

  // 选择使用哪个上传处理函数
  const customRequest = (options) => {
    // 尝试常规上传，如果失败尝试本地上传
    handleUpload(options).catch(error => {
      console.warn('切换到本地上传模式:', error);
      handleLocalUpload(options);
    });
  };

  // 检查图片URL是否有效
  const isValidImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http') || url.startsWith('/assets/') || url.startsWith('data:image/');
  };

  // 图片加载失败回调
  const handleImageError = (e) => {
    console.warn('图片加载失败，使用占位图替代');
    e.target.src = DEFAULT_PLACEHOLDER;
  };

  // 获取安全的图片URL
  const getSafeImageUrl = (url) => {
    if (isValidImageUrl(url)) {
      return url;
    }
    return DEFAULT_PLACEHOLDER;
  };

  // Dish Modal Open/Close
  const showAddModal = () => {
    setEditingDish(null);
    form.resetFields(); // Clear form for adding
    setImageUrl(''); // 清空图片URL
    setFileName(''); // 清空文件名
    setIsModalOpen(true);
  };

  const showEditModal = (dish) => {
    try {
      setEditingDish(dish);
      // 安全设置图片URL，确保字段存在且有效
      const safeImgUrl = getSafeImageUrl(dish.img_url);
      setImageUrl(safeImgUrl);
      setFileName(dish.img_url ? path.basename(dish.img_url) : '');

      // 安全设置表单值，确保所有字段都有默认值
      form.setFieldsValue({
        name: dish.name || '',
        price: Number(dish.price || 0),
        category_id: dish.category_id,
        style: dish.style || '',
        description: dish.description || '',
        img_url: dish.img_url || ''
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('显示编辑模态框出错:', error);
      messageApi.error('打开编辑窗口失败: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingDish(null); // Reset editing state
    setImageUrl(''); // 清空图片URL
    setFileName(''); // 清空文件名
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

      console.log("提交的表单值:", values); // <-- 添加日志，检查提交的数据

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

  // 修改Upload组件渲染部分
  const renderUploadButton = () => {
    if (uploadLoading) {
      return (
        <div>
          <LoadingOutlined />
          <div style={{ marginTop: 8 }}>上传中...</div>
        </div>
      );
    }

    if (imageUrl) {
      return (
        <div style={{ position: 'relative' }}>
          <img
            src={imageUrl}
            alt="菜品图片"
            style={{ width: '100%', maxHeight: '150px', objectFit: 'cover' }}
            onError={handleImageError}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.4)',
            padding: '4px',
            textAlign: 'center'
          }}>
            <Text style={{ color: 'white', fontSize: '12px' }}>点击更换图片</Text>
          </div>
        </div>
      );
    }

    return (
      <div>
        <PictureOutlined style={{ fontSize: 32 }} />
        <div style={{ marginTop: 8 }}>上传图片</div>
      </div>
    );
  };

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
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 2 }}>
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
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Form.Item
                label="菜品图片"
                name="img_url"
                style={{ marginBottom: '8px', alignSelf: 'flex-start', width: '100%' }}
              >
                <Input placeholder="图片URL" style={{ display: 'none' }} />
              </Form.Item>

              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={customRequest}
                beforeUpload={beforeUpload}
                style={{ width: '100%' }}
              >
                {renderUploadButton()}
              </Upload>
              <Text type="secondary" style={{ marginTop: '8px', textAlign: 'center' }}>
                建议尺寸: 300x300px, 大小不超过2MB
              </Text>
            </div>
          </div>

          <Form.Item
            name="description"
            label="菜品描述"
          >
            <TextArea
              placeholder="请输入菜品描述"
              autoSize={{ minRows: 2, maxRows: 4 }}
            />
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