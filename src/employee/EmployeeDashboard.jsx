import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, message, Layout, Menu } from 'antd';
import { OrderedListOutlined, RiseOutlined, AppstoreOutlined, LogoutOutlined, HomeOutlined, DollarOutlined, PayCircleOutlined, InfoCircleOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Line, Bar } from '@ant-design/charts';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import moment from 'moment';

const { Title, Text } = Typography;
const { Sider, Content, Header } = Layout;

function EmployeeLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [currentPath, setCurrentPath] = useState(location.pathname);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location]);

    const menuItems = [
        { key: '/employee/dashboard', label: <Link to="/employee/dashboard">工作台</Link>, icon: <HomeOutlined /> },
        { key: '/employee/dishes', label: <Link to="/employee/dishes">菜品管理</Link>, icon: <AppstoreOutlined /> },
        { key: '/employee/orders', label: <Link to="/employee/orders">订单管理</Link>, icon: <OrderedListOutlined /> },
        {
            key: 'logout',
            label: '退出登录',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider breakpoint="lg" collapsedWidth="0">
                <div style={{ height: '32px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    Employee CMS
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentPath]}
                    items={menuItems}
                    style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 64px)' }}
                />
            </Sider>
            <Layout>
                <Header style={{ padding: '0 16px', background: '#fff' }}>
                    <Title level={4} style={{ margin: '16px 0', color: '#1890ff' }}>餐厅管理系统 - 员工</Title>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default function EmployeeDashboard() {
    const [orderStats, setOrderStats] = useState({ total: 0, today: 0 });
    const [trendData, setTrendData] = useState([]);
    const [summary, setSummary] = useState({ totalAmount: 0, paymentCount: 0, salesAmount: 0 });
    const [paymentTrend, setPaymentTrend] = useState([]);

    useEffect(() => {
        async function fetchStats() {
            try {
                // 假设有API /api/orders/stats/employee
                const { data } = await axios.get('/api/orders/stats/employee');
                setOrderStats(data);
            } catch (e) {
                message.error('获取统计信息失败');
            }
        }
        async function fetchTrend() {
            try {
                // 假设有API /api/orders/trend/employee
                const { data } = await axios.get('/api/orders/trend/employee');
                // 自动补全近7天日期，缺失的补0
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
                }
                const trendMap = {};
                data.forEach(item => {
                    trendMap[moment(item.date).format('YYYY-MM-DD')] = item.count;
                });
                const filledTrend = days.map(date => ({ date, count: trendMap[date] || 0 }));
                setTrendData(filledTrend);
            } catch (e) {
                // 可选：不提示
            }
        }
        async function fetchSummary() {
            try {
                // 新增汇总接口
                const { data } = await axios.get('/api/orders/summary/employee');
                setSummary(data);
            } catch (e) {
                // 可选：不提示
            }
        }
        async function fetchPaymentTrend() {
            try {
                const { data } = await axios.get('/api/orders/payment-trend/employee');
                // 自动补全近7天日期，缺失的补0
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    days.push(moment().subtract(i, 'days').format('YYYY-MM-DD'));
                }
                const trendMap = {};
                data.forEach(item => {
                    trendMap[moment(item.date).format('YYYY-MM-DD')] = item.count;
                });
                const filledTrend = days.map(date => ({ date, count: trendMap[date] || 0 }));
                setPaymentTrend(filledTrend);
            } catch (e) { }
        }
        fetchStats();
        fetchTrend();
        fetchSummary();
        fetchPaymentTrend();
    }, []);

    // 计算转化率（支付笔数/总订单数，百分比）
    const conversion = orderStats.total > 0 ? Math.round((summary.paymentCount / orderStats.total) * 100) : 0;
    // 支付笔数小柱状图数据（用近7天每日支付笔数）
    const paymentBarData = paymentTrend.map((d, i) => ({ x: i + 1, y: d.count }));
    // 同比/环比用真实订单数趋势动态计算
    const today = moment().format('YYYY-MM-DD');
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    const lastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const todayCount = trendData.find(d => d.date === today)?.count || 0;
    const yesterdayCount = trendData.find(d => d.date === yesterday)?.count || 0;
    const lastWeekCount = trendData.find(d => d.date === lastWeek)?.count || 0;
    console.log('trendData:', trendData);
    console.log('todayCount:', todayCount, 'yesterdayCount:', yesterdayCount, 'lastWeekCount:', lastWeekCount);
    const dayRate = yesterdayCount > 0 ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100) : 0;
    const weekRate = lastWeekCount > 0 ? Math.round(((todayCount - lastWeekCount) / lastWeekCount) * 100) : 0;

    const barConfig = {
        data: trendData,
        height: 260,
        xField: 'date',
        yField: 'count',
        color: '#1890ff',
        columnWidthRatio: 0.6,
        xAxis: {
            title: { text: '日期' },
            tickCount: 7,
            label: { style: { fill: '#888', fontSize: 14 } }
        },
        yAxis: {
            title: { text: '订单数' },
            min: 0,
            tickInterval: 1,
            label: { style: { fill: '#888', fontSize: 14 } }
        },
        tooltip: {
            showMarkers: true
        },
        meta: {
            date: { alias: '日期' },
            count: { alias: '订单数' }
        },
        style: { borderRadius: 6 },
    };

    // 假数据：环比、同比、转化率、日销售额（实际可从后端接口扩展获取）
    const dailySales = 12423; // 日销售额

    return (
        <div style={{ padding: 24 }}>
            <Title level={2} style={{ marginBottom: 8 }}>员工工作台</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>欢迎回来，祝您工作愉快！</Text>
            <Row gutter={20} style={{ marginTop: 16, marginBottom: 8 }}>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px #f0f1f2', background: '#f6ffed', minHeight: 120, padding: '12px 12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#52c41a', fontWeight: 700, fontSize: 16 }}>总销售额 <InfoCircleOutlined style={{ fontSize: 14, color: '#b7eb8f' }} /></span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px 0', color: '#222' }}>
                            ￥{summary.totalAmount.toLocaleString()}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, marginBottom: 2 }}>
                            <span>周同比 <span style={{ color: '#f5222d', margin: '0 4px' }}>{weekRate}% <ArrowUpOutlined /></span></span>
                            <span style={{ marginLeft: 12 }}>日同比 <span style={{ color: '#52c41a', margin: '0 4px' }}>{dayRate}% <ArrowDownOutlined /></span></span>
                        </div>
                        <div style={{ borderTop: '1px solid #f0f0f0', margin: '6px 0' }} />
                        <div style={{ fontSize: 13, color: '#888' }}>近7天销售额 ￥{summary.salesAmount.toLocaleString()}</div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px #f0f1f2', background: '#e6f7ff', minHeight: 120, padding: '12px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#1890ff', fontWeight: 700, fontSize: 16 }}>支付笔数 <InfoCircleOutlined style={{ fontSize: 14, color: '#91d5ff' }} /></span>
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px 0', color: '#222' }}>{summary.paymentCount.toLocaleString()}</div>
                        <div style={{ fontSize: 13, color: '#888', display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                            <span>转化率 <span style={{ color: '#1890ff', fontWeight: 700 }}>{conversion}%</span></span>
                            <span>总订单数 <span style={{ color: '#888', fontWeight: 700 }}>{orderStats.total}</span></span>
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false} style={{ borderRadius: 10, boxShadow: '0 2px 8px #f0f1f2', background: '#fff', minHeight: 120, padding: '12px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Statistic
                            title={<span style={{ color: '#888', fontWeight: 700, fontSize: 16 }}>今日订单数</span>}
                            value={orderStats.today}
                            prefix={<OrderedListOutlined style={{ color: '#888' }} />}
                            valueStyle={{ fontSize: 28 }}
                        />
                    </Card>
                </Col>
            </Row>
            <Card
                title={<span style={{ fontWeight: 500, fontSize: 18 }}>近7天订单趋势</span>}
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px #f0f1f2', marginTop: 24 }}
            >
                <Bar {...barConfig} />
            </Card>
        </div>
    );
}

export { EmployeeLayout }; 