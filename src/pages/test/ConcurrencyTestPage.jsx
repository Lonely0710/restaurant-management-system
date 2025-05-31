// src/pages/test/ConcurrencyTestPage.jsx
import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Typography, Space, message, Divider, Layout, Table, Tag, Alert, Progress, Statistic, Row, Col } from 'antd';
import axios from 'axios';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Content } = Layout;

const scenarioOptions = [
    { label: <Tag color="purple">脏读 (Dirty Read)</Tag>, value: 'Dirty Read', tag: <Tag color="purple">脏读</Tag> },
    { label: <Tag color="gold">不可重复读 (Non-repeatable Read)</Tag>, value: 'Non-repeatable Read', tag: <Tag color="gold">不可重复读</Tag> },
    { label: <Tag color="magenta">丢失修改 (Lost Update)</Tag>, value: 'Lost Update', tag: <Tag color="magenta">丢失修改</Tag> },
];

const isolationOptions = [
    { label: <><Tag color="blue">1</Tag> Read Uncommitted (RU)</>, value: 'READ UNCOMMITTED', tag: <Tag color="blue">1-RU</Tag> },
    { label: <><Tag color="green">2</Tag> Read Committed (RC)</>, value: 'READ COMMITTED', tag: <Tag color="green">2-RC</Tag> },
    { label: <><Tag color="orange">3</Tag> Repeatable Read (RR)</>, value: 'REPEATABLE READ', tag: <Tag color="orange">3-RR</Tag> },
    { label: <><Tag color="red">4</Tag> Serializable</>, value: 'SERIALIZABLE', tag: <Tag color="red">4-Serializable</Tag> },
];

const getResultTag = (result) => {
    if (result.success === true) return <Tag color="green">成功</Tag>;
    if (result.success === false) return <Tag color="red">失败</Tag>;
    return <Tag>未知</Tag>;
};

const getErrorType = (result) => {
    if (!result) return '';
    // 特别识别MySQL锁等待超时
    if (result.error && (result.error.includes('ER_LOCK_WAIT_TIMEOUT') || result.error.includes('Lock wait timeout exceeded'))) {
        return '锁等待超时（Serializable）';
    }
    // 优先根据后端results字段判断
    if (result.results) {
        if (result.results.dirtyReadOccurred) return '脏读';
        if (result.results.nonRepeatableReadOccurred) return '不可重复读';
        if (result.results.lostUpdateOccurred) return '丢失修改';
    }
    // 兼容旧逻辑
    if (result.error) return '其他异常';
    return '';
};

const ConcurrencyTestPage = () => {
    const [menuId, setMenuId] = useState('1');
    const [isolationLevel, setIsolationLevel] = useState('READ UNCOMMITTED');
    const [concurrency, setConcurrency] = useState(5);
    const [scenarios, setScenarios] = useState(['Dirty Read']); // 多选
    const [results, setResults] = useState({}); // { 场景: [结果数组] }
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({}); // { 场景: 统计对象 }
    const [activeScene, setActiveScene] = useState('Dirty Read');

    const apiBaseUrl = '/api/test/concurrency';

    const runTest = async () => {
        setLoading(true);
        setResults({});
        setStats({});
        let allResults = {};
        let allStats = {};
        for (const scenario of scenarios) {
            const requests = [];
            for (let i = 0; i < concurrency; i++) {
                requests.push(
                    Promise.all([
                        axios.get(`${apiBaseUrl}/${scenario.replace(/ /g, '-').toLowerCase()}`, {
                            params: { menuId, isolationLevel }
                        }).catch(error => {
                            console.log('------ AXIOS CATCH START ------');
                            console.log('Scenario:', scenario, 'Isolation:', isolationLevel);
                            console.log('Raw Axios Error Object:', error);
                            console.log('error.isAxiosError:', error.isAxiosError);
                            console.log('Checking error.response:');
                            if (error.response) {
                                console.log('  error.response EXISTS');
                                console.log('  error.response.status:', error.response.status);
                                console.log('  error.response.data:', error.response.data);
                                console.log('  typeof error.response.data:', typeof error.response.data);
                            } else {
                                console.log('  error.response IS UNDEFINED or NULL');
                            }
                            console.log('Checking error.request:');
                            if (error.request) {
                                console.log('  error.request EXISTS');
                            } else {
                                console.log('  error.request IS UNDEFINED or NULL');
                            }
                            console.log('error.message (from Axios error object):', error.message);
                            console.log('error.config (Axios request config):', error.config);
                            console.log('------ AXIOS CATCH END ------');
                            let responseData = {
                                success: false,
                                message: '事务 1 处理失败 (未知原因)',
                                error: '未知错误',
                                results: { dirtyReadOccurred: false, nonRepeatableReadOccurred: false, lostUpdateOccurred: false }
                            };
                            if (error.response && error.response.data) {
                                responseData.message = error.response.data.message || `事务 1 失败 (状态码: ${error.response.status})`;
                                responseData.error = error.response.data.error || '后端返回错误但无详细信息';
                                if (error.response.data.errorDetails) {
                                    responseData.errorDetails = error.response.data.errorDetails;
                                }
                            } else if (error.request) {
                                responseData.message = `事务 1 失败: 未收到服务器响应`;
                                responseData.error = error.message || '服务器无响应';
                            } else {
                                responseData.message = `事务 1 失败: 请求设置错误`;
                                responseData.error = error.message || '请求配置错误';
                            }
                            return { data: responseData };
                        }),
                        axios.get(`${apiBaseUrl}/${scenario.replace(/ /g, '-').toLowerCase()}`, {
                            params: { menuId, isolationLevel }
                        }).catch(error => {
                            console.log('------ AXIOS CATCH START ------');
                            console.log('Scenario:', scenario, 'Isolation:', isolationLevel);
                            console.log('Raw Axios Error Object:', error);
                            console.log('error.isAxiosError:', error.isAxiosError);
                            console.log('Checking error.response:');
                            if (error.response) {
                                console.log('  error.response EXISTS');
                                console.log('  error.response.status:', error.response.status);
                                console.log('  error.response.data:', error.response.data);
                                console.log('  typeof error.response.data:', typeof error.response.data);
                            } else {
                                console.log('  error.response IS UNDEFINED or NULL');
                            }
                            console.log('Checking error.request:');
                            if (error.request) {
                                console.log('  error.request EXISTS');
                            } else {
                                console.log('  error.request IS UNDEFINED or NULL');
                            }
                            console.log('error.message (from Axios error object):', error.message);
                            console.log('error.config (Axios request config):', error.config);
                            console.log('------ AXIOS CATCH END ------');
                            let responseData = {
                                success: false,
                                message: '事务 2 处理失败 (未知原因)',
                                error: '未知错误',
                                results: { dirtyReadOccurred: false, nonRepeatableReadOccurred: false, lostUpdateOccurred: false }
                            };
                            if (error.response && error.response.data) {
                                responseData.message = error.response.data.message || `事务 2 失败 (状态码: ${error.response.status})`;
                                responseData.error = error.response.data.error || '后端返回错误但无详细信息';
                                if (error.response.data.errorDetails) {
                                    responseData.errorDetails = error.response.data.errorDetails;
                                }
                            } else if (error.request) {
                                responseData.message = `事务 2 失败: 未收到服务器响应`;
                                responseData.error = error.message || '服务器无响应';
                            } else {
                                responseData.message = `事务 2 失败: 请求设置错误`;
                                responseData.error = error.message || '请求配置错误';
                            }
                            return { data: responseData };
                        })
                    ])
                );
            }
            try {
                const sceneResults = await Promise.all(requests);
                const formatted = sceneResults.map((pair, idx) => ({
                    key: idx + 1,
                    group: idx + 1,
                    t1: pair[0].data,
                    t2: pair[1].data,
                    t1Success: pair[0].data.success,
                    t2Success: pair[1].data.success,
                    t1Error: getErrorType(pair[0].data),
                    t2Error: getErrorType(pair[1].data),
                }));
                allResults[scenario] = formatted;
                // 统计
                let total = formatted.length * 2;
                let success = formatted.filter(r => r.t1Success && r.t2Success).length * 2;
                let fail = total - success;
                let dirty = formatted.filter(r => r.t1Error === '脏读' || r.t2Error === '脏读').length;
                let nonRepeat = formatted.filter(r => r.t1Error === '不可重复读' || r.t2Error === '不可重复读').length;
                let lost = formatted.filter(r => r.t1Error === '丢失修改' || r.t2Error === '丢失修改').length;
                let lockTimeouts = formatted.filter(r => r.t1Error === '锁等待超时（Serializable）' || r.t2Error === '锁等待超时（Serializable）').length;
                allStats[scenario] = { total, success, fail, dirty, nonRepeat, lost, lockTimeouts };
            } catch (error) {
                message.error(`场景${scenario}测试失败: ${error.message}`);
            }
        }
        setResults(allResults);
        setStats(allStats);
        setLoading(false);
        message.success('所有选中场景测试完成');
    };

    const columns = [
        { title: '组编号', dataIndex: 'group', key: 'group', align: 'center', width: 80 },
        {
            title: '事务1结果', dataIndex: 't1', key: 't1', align: 'center',
            render: (t1) => <span>{getResultTag(t1)}<br />{t1.message || ''}</span>
        },
        {
            title: '事务2结果', dataIndex: 't2', key: 't2', align: 'center',
            render: (t2) => <span>{getResultTag(t2)}<br />{t2.message || ''}</span>
        },
        {
            title: <span style={{ fontWeight: 600 }}>异常类型<br /><span style={{ fontWeight: 400, color: '#888', fontSize: 12 }}>(并发问题是否发生)</span></span>, key: 'errorType', align: 'center',
            render: (_, r) => {
                const tags = [];
                if (r.t1Error) tags.push(<Tag color="#cf1322" key="t1e">T1: {r.t1Error}</Tag>);
                if (r.t2Error) tags.push(<Tag color="#fa8c16" key="t2e">T2: {r.t2Error}</Tag>);
                if (tags.length === 0) return <Tag color="green">无</Tag>;
                return tags;
            }
        }
    ];

    return (
        <Content style={{ padding: '24px', background: '#f5f7fa', minHeight: '100vh' }}>
            <Card title={<Title level={4} style={{ margin: 0 }}>数据库并发与事务隔离级别测试</Title>} style={{ maxWidth: 1000, margin: '0 auto', boxShadow: '0 2px 8px #f0f1f2', borderRadius: 16, background: '#fff' }}>
                <Paragraph>
                    选择菜单ID、事务隔离级别、并发组数，并运行不同的并发测试场景。每组模拟两个并发事务，观察在不同隔离级别下是否出现数据不一致问题（脏读、不可重复读、丢失修改）。
                </Paragraph>
                <Alert
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={
                        <span>
                            <b>提示：</b>API"成功/失败"标签仅表示接口调用本身是否顺利完成，<b style={{ color: '#cf1322' }}>真正判断并发问题是否发生，请关注表格中的"异常类型"列</b>。<br />
                            <span style={{ color: '#888' }}>如果"异常类型"显示"脏读""不可重复读""丢失修改"，说明该并发问题已被复现；显示"无"则说明本次未检测到该问题。</span>
                        </span>
                    }
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 32 }}>
                    <Form layout="vertical" style={{
                        background: '#f8fafc',
                        padding: '32px 32px 16px 32px',
                        borderRadius: 16,
                        boxShadow: '0 2px 12px #e6eaf1',
                        minWidth: 600,
                        width: 600,
                        fontWeight: 500
                    }}>
                        <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
                            <Form.Item label={<span style={{ fontWeight: 600 }}>菜单ID</span>} style={{ flex: 1, marginBottom: 0 }}>
                                <Input value={menuId} onChange={e => setMenuId(e.target.value)} placeholder="输入菜单ID" style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>
                            <Form.Item label={<span style={{ fontWeight: 600 }}>事务隔离级别</span>} style={{ flex: 1, marginBottom: 0 }}>
                                <Select
                                    value={isolationLevel}
                                    onChange={setIsolationLevel}
                                    style={{ width: '100%', borderRadius: 8, fontWeight: 600, background: '#f0f5ff' }}
                                    options={isolationOptions}
                                    optionLabelProp="label"
                                    dropdownRender={menu => <div style={{ minWidth: 220 }}>{menu}</div>}
                                />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', gap: 32, marginBottom: 0 }}>
                            <Form.Item label={<span style={{ fontWeight: 600 }}>并发组数</span>} style={{ flex: 1, marginBottom: 0 }}>
                                <Input type="number" min={1} max={20} value={concurrency} onChange={e => setConcurrency(Number(e.target.value))} style={{ width: '100%', borderRadius: 8 }} />
                            </Form.Item>
                            <Form.Item label={<span style={{ fontWeight: 600 }}>测试场景</span>} style={{ flex: 1, marginBottom: 0 }}>
                                <Select
                                    mode="multiple"
                                    value={scenarios}
                                    onChange={setScenarios}
                                    style={{ width: '100%', borderRadius: 8, fontWeight: 600, background: '#f0f5ff' }}
                                    options={scenarioOptions}
                                    optionLabelProp="label"
                                    tagRender={({ value, closable, onClose }) => {
                                        const opt = scenarioOptions.find(o => o.value === value);
                                        return <Tag color={opt?.tag?.props.color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>{opt?.tag?.props.children}</Tag>;
                                    }}
                                />
                            </Form.Item>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                            <Button type="primary" loading={loading} onClick={runTest} style={{ height: 44, borderRadius: 22, fontWeight: 600, fontSize: 18, padding: '0 48px' }}>开始测试</Button>
                        </div>
                    </Form>
                </div>
                <Divider />
                {Object.keys(results).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {/* 场景切换按钮组 */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            {scenarios.map(scene => {
                                const opt = scenarioOptions.find(o => o.value === scene);
                                return (
                                    <Button
                                        key={scene}
                                        type={activeScene === scene ? 'primary' : 'default'}
                                        onClick={() => setActiveScene(scene)}
                                        style={{ fontWeight: 600, borderRadius: 16 }}
                                        icon={opt?.tag}
                                    >
                                        {scene}
                                    </Button>
                                );
                            })}
                        </div>
                        {/* 隔离级别Tag展示 */}
                        <div style={{ marginBottom: 12 }}>
                            当前事务隔离级别：
                            {isolationOptions.find(o => o.value === isolationLevel)?.tag}
                            <span style={{ marginLeft: 8, color: '#888' }}>{isolationLevel}</span>
                        </div>
                        {/* 只展示当前场景的统计和表格 */}
                        <Card type="inner" title={<span style={{ fontWeight: 600 }}>{activeScene} {scenarioOptions.find(o => o.value === activeScene)?.tag}</span>} style={{ borderRadius: 12, boxShadow: '0 1px 6px #e6eaf1' }}>
                            <Row gutter={24} style={{ marginBottom: 16 }}>
                                <Col span={3}><Statistic title="总运行数" value={stats[activeScene]?.total || 0} /></Col>
                                <Col span={3}><Statistic title="API成功" value={stats[activeScene]?.success || 0} valueStyle={{ color: '#3f8600' }} /></Col>
                                <Col span={3}><Statistic title="API失败" value={stats[activeScene]?.fail || 0} valueStyle={{ color: '#cf1322' }} /></Col>
                                <Col span={3}><Statistic title="问题检测" value={stats[activeScene]?.issues || 0} valueStyle={{ color: '#faad14' }} /></Col>
                                <Col span={3}><Statistic title="脏读" value={stats[activeScene]?.dirty || 0} /></Col>
                                <Col span={3}><Statistic title="不可重复读" value={stats[activeScene]?.nonRepeat || 0} /></Col>
                                <Col span={3}><Statistic title="丢失修改" value={stats[activeScene]?.lost || 0} /></Col>
                                <Col span={3}><Statistic title={<span>锁等待超时<br /><span style={{ fontWeight: 400, color: '#888', fontSize: 12 }}>(发生次数)</span></span>} value={stats[activeScene]?.lockTimeouts || 0} valueStyle={{ color: '#1890ff' }} /></Col>
                            </Row>
                            <Alert type="info" showIcon style={{ marginBottom: 16 }} message="每组模拟两个并发事务，结果和异常类型如下表所示。" />
                            <Table
                                columns={columns}
                                dataSource={results[activeScene]}
                                pagination={{ pageSize: 8 }}
                                bordered
                                size="middle"
                                style={{ background: '#fff' }}
                            />
                            <Progress percent={100} status={stats[activeScene]?.fail > 0 ? 'exception' : 'success'} showInfo={false} style={{ marginTop: 16 }} />
                        </Card>
                    </div>
                )}
            </Card>
        </Content>
    );
};

export default ConcurrencyTestPage; 