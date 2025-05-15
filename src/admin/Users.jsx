import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, Select, Space, Popconfirm, message, Spin, Typography, Tag, Tooltip, Badge, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import api from '../utils/api'; // 替换为自定义api实例
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { Password } = Input;

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null); // null for Add, user object for Edit
    const [form] = Form.useForm(); // Form instance
    const [messageApi, contextHolder] = message.useMessage();

    // 使用API获取用户数据
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            const userData = Array.isArray(response.data) ? response.data : [];
            setUsers(userData);
        } catch (error) {
            console.error('获取用户失败:', error);
            messageApi.error('获取用户数据失败，请稍后重试!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Modal Open/Close
    const showAddModal = () => {
        setEditingUser(null);
        form.resetFields(); // Clear form for adding
        form.setFieldsValue({ is_active: true, identity: 2 }); // Set defaults
        setIsModalOpen(true);
    };

    const showEditModal = (user) => {
        setEditingUser(user);
        form.setFieldsValue({
            name: user.name,
            phone: user.phone,
            is_active: user.is_active === 1,
            identity: user.identity,
            // 编辑时不会填充密码字段
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingUser(null); // Reset editing state
    };

    // Form Submission (Add/Edit)
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // 转换布尔值为数字
            if (typeof values.is_active === 'boolean') {
                values.is_active = values.is_active ? 1 : 0;
            }

            if (editingUser) {
                // --- Edit Logic ---
                // 如果没有提供密码，从请求数据中移除密码字段
                if (!values.password_hash || values.password_hash.trim() === '') {
                    delete values.password_hash;
                }

                await api.put(`/users/${editingUser.user_id}`, values);
                messageApi.success({
                    content: `用户 "${values.name}" 更新成功!`,
                    icon: <EditOutlined style={{ color: '#108ee9' }} />,
                });
            } else {
                // --- Add Logic ---
                // 添加新用户时，密码是必需的
                if (!values.password_hash) {
                    messageApi.error('请提供密码!');
                    setLoading(false);
                    return;
                }

                await api.post('/users', values);
                messageApi.success({
                    content: `用户 "${values.name}" 添加成功!`,
                    icon: <PlusOutlined style={{ color: '#52c41a' }} />,
                });
            }
            setIsModalOpen(false);
            fetchUsers(); // 刷新用户列表
        } catch (error) {
            console.error('Form validation or submission failed:', error);
            if (error.response?.data?.error) {
                messageApi.error(error.response.data.error);
            } else if (error.errorFields) {
                messageApi.error('请检查表单输入!');
            } else {
                messageApi.error('操作失败，请稍后重试!');
            }
        } finally {
            setLoading(false);
        }
    };

    // 更新用户状态
    const handleToggleStatus = async (userId, currentStatus, userName) => {
        setLoading(true);
        try {
            const newStatus = currentStatus === 1 ? 0 : 1;
            await api.put(`/users/${userId}`, {
                is_active: newStatus
            });
            messageApi.success(`用户 "${userName}" 状态已更新!`);
            fetchUsers(); // Refresh the list
        } catch (error) {
            console.error(`Failed to update user status ${userId}:`, error);
            messageApi.error('状态更新失败，请稍后重试!');
        } finally {
            setLoading(false);
        }
    };

    // 根据用户身份获取角色名称
    const getRoleName = (identity) => {
        switch (identity) {
            case 0:
                return { text: '超级管理员', color: 'red' };
            case 1:
                return { text: '管理员', color: 'orange' };
            case 2:
                return { text: '普通用户', color: 'green' };
            default:
                return { text: '未知角色', color: 'default' };
        }
    };

    // Table Columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'user_id',
            key: 'user_id',
            width: 80,
            sorter: (a, b) => a.user_id - b.user_id,
        },
        {
            title: '用户名',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <Space>
                    <UserOutlined />
                    <span>{text}</span>
                    {!record.is_active && <Badge status="error" text="已禁用" />}
                </Space>
            ),
        },
        {
            title: '电话',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '角色',
            dataIndex: 'identity',
            key: 'identity',
            render: (identity) => {
                const role = getRoleName(identity);
                return <Tag color={role.color}>{role.text}</Tag>;
            },
            filters: [
                { text: '超级管理员', value: 0 },
                { text: '管理员', value: 1 },
                { text: '普通用户', value: 2 },
            ],
            onFilter: (value, record) => record.identity === value,
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
            sorter: (a, b) => new Date(a.create_time) - new Date(b.create_time),
        },
        {
            title: '最后登录',
            dataIndex: 'last_login_time',
            key: 'last_login_time',
            render: (text) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '从未登录',
            sorter: (a, b) => {
                if (!a.last_login_time) return 1;
                if (!b.last_login_time) return -1;
                return new Date(a.last_login_time) - new Date(b.last_login_time);
            },
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            key: 'is_active',
            width: 100,
            render: (status) => (
                status === 1 ?
                    <Badge status="success" text="正常" /> :
                    <Badge status="error" text="禁用" />
            ),
            filters: [
                { text: '正常', value: 1 },
                { text: '禁用', value: 0 },
            ],
            onFilter: (value, record) => record.is_active === value,
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => showEditModal(record)}
                        size="small"
                    >
                        编辑
                    </Button>
                    <Button
                        type={record.is_active === 1 ? "danger" : "primary"}
                        icon={record.is_active === 1 ? <LockOutlined /> : <UnlockOutlined />}
                        onClick={() => handleToggleStatus(record.user_id, record.is_active, record.name)}
                        size="small"
                    >
                        {record.is_active === 1 ? '禁用' : '启用'}
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={2}>用户管理</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={showAddModal}
                >
                    添加用户
                </Button>
            </div>

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="user_id"
                    pagination={{
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `共 ${total} 条记录`
                    }}
                />
            </Spin>

            {/* Add/Edit Modal */}
            <Modal
                title={editingUser ? '编辑用户' : '添加用户'}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={loading}
                destroyOnClose
                style={{ top: 20 }}
                className="user-modal"
            >
                <Form form={form} layout="vertical" name="user_form">
                    <Form.Item
                        name="name"
                        label="用户名"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="手机号码"
                        rules={[
                            { required: true, message: '请输入手机号码!' },
                            { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }
                        ]}
                    >
                        <Input placeholder="请输入手机号码" />
                    </Form.Item>

                    <Form.Item
                        name="password_hash"
                        label={editingUser ? "新密码 (留空表示不修改)" : "密码"}
                        rules={[
                            { required: !editingUser, message: '请输入密码!' },
                            { min: 6, message: '密码长度至少为6位!' }
                        ]}
                    >
                        <Password prefix={<LockOutlined />} placeholder={editingUser ? "留空表示不修改密码" : "请输入密码"} />
                    </Form.Item>

                    <Form.Item
                        name="identity"
                        label="用户角色"
                        rules={[{ required: true, message: '请选择用户角色!' }]}
                    >
                        <Select placeholder="选择用户角色">
                            <Option value={0}>超级管理员</Option>
                            <Option value={1}>管理员</Option>
                            <Option value={2}>普通用户</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="账号状态"
                        valuePropName="checked"
                    >
                        <Switch
                            checkedChildren="启用"
                            unCheckedChildren="禁用"
                            defaultChecked
                        />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 添加全局CSS样式 */}
            <style jsx="true">{`
                .user-modal .ant-modal-content {
                    background-color: #f8f8ff;
                }
                .user-modal .ant-modal-header {
                    background-color: #f0f8ff;
                }
            `}</style>
        </div>
    );
}

export default Users; 