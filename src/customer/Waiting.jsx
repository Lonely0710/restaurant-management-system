// src/customer/Waiting.jsx
import React, { useState, useEffect } from 'react';
import {
  Result, Button, Spin, Typography, Steps, Card, Tag, Divider,
  Timeline, List, Space, Statistic, Row, Col, Progress, Alert
} from 'antd';
import {
  ClockCircleOutlined, CheckCircleOutlined, SyncOutlined,
  RocketOutlined, LoadingOutlined, SmileOutlined,
  FieldTimeOutlined, ShoppingOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Countdown } = Statistic;

function Waiting() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderItems, total, paymentMethod } = location.state || {};

  const [currentStep, setCurrentStep] = useState(0);
  const [remainingTime, setRemainingTime] = useState(10 * 60 * 1000); // 10 minutes in ms
  const [progressPercent, setProgressPercent] = useState(0);

  // 假设的订单状态
  const orderSteps = [
    { title: '已下单', description: '订单已提交', icon: <CheckCircleOutlined /> },
    { title: '制作中', description: '厨师正在精心制作', icon: <SyncOutlined spin /> },
    { title: '即将完成', description: '即将完成您的美食', icon: <RocketOutlined /> },
    { title: '已完成', description: '请取餐享用', icon: <SmileOutlined /> }
  ];

  // 模拟订单进度更新
  useEffect(() => {
    // 模拟1分钟后进入制作中
    const timer1 = setTimeout(() => {
      setCurrentStep(1);
      setProgressPercent(33);
    }, 10000); // 10秒后

    // 模拟3分钟后即将完成
    const timer2 = setTimeout(() => {
      setCurrentStep(2);
      setProgressPercent(66);
    }, 20000); // 20秒后

    // 模拟5分钟后完成
    const timer3 = setTimeout(() => {
      setCurrentStep(3);
      setProgressPercent(100);
    }, 30000); // 30秒后

    // 倒计时更新
    const countdownTimer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1000) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearInterval(countdownTimer);
    };
  }, []);

  // 动态生成订单活动记录
  const getTimelineItems = () => {
    const items = [
      {
        color: 'green',
        children: (
          <>
            <Text strong>订单提交成功</Text>
            <br />
            <Text type="secondary">{new Date().toLocaleString()}</Text>
          </>
        ),
        dot: <CheckCircleOutlined />
      }
    ];

    if (currentStep >= 1) {
      items.push({
        color: 'blue',
        children: (
          <>
            <Text strong>厨房已接单，开始制作</Text>
            <br />
            <Text type="secondary">{new Date(Date.now() - 9000).toLocaleString()}</Text>
          </>
        ),
        dot: <SyncOutlined spin />
      });
    }

    if (currentStep >= 2) {
      items.push({
        color: 'blue',
        children: (
          <>
            <Text strong>订单制作中，即将完成</Text>
            <br />
            <Text type="secondary">{new Date(Date.now() - 5000).toLocaleString()}</Text>
          </>
        ),
        dot: <RocketOutlined />
      });
    }

    if (currentStep >= 3) {
      items.push({
        color: 'green',
        children: (
          <>
            <Text strong>订单已完成，请取餐</Text>
            <br />
            <Text type="secondary">{new Date().toLocaleString()}</Text>
          </>
        ),
        dot: <SmileOutlined />
      });
    }

    return items;
  };

  // 获取支付方式中文名
  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'wechat': return '微信支付';
      case 'alipay': return '支付宝';
      case 'cash': return '现金支付';
      default: return '未知支付方式';
    }
  };

  // 获取当前状态文案
  const getStatusMessage = () => {
    switch (currentStep) {
      case 0: return '订单已提交，等待厨房确认...';
      case 1: return '大厨正在精心制作您的美食...';
      case 2: return '您的美食即将完成，请稍等片刻...';
      case 3: return '您的美食已准备好，请及时取餐！';
      default: return '订单处理中...';
    }
  };

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card bordered={true} style={{ marginBottom: 24 }}>
            <Result
              icon={currentStep === 3
                ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
                : <LoadingOutlined style={{ color: '#1890ff' }} />
              }
              title={currentStep === 3 ? "您的订单已完成！" : "订单处理中"}
              subTitle={getStatusMessage()}
              extra={
                <Space size="middle">
                  <Link to="/customer/order">
                    <Button>继续点餐</Button>
                  </Link>
                  <Link to="/">
                    <Button type="primary">返回首页</Button>
                  </Link>
                </Space>
              }
            />

            <div style={{ padding: '0 24px 24px' }}>
              <Progress
                percent={progressPercent}
                status={currentStep === 3 ? "success" : "active"}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#52c41a',
                }}
              />

              <Divider style={{ margin: '24px 0 16px' }}>
                <Text type="secondary">订单进度</Text>
              </Divider>

              <Steps
                current={currentStep}
                responsive
                size="small"
              >
                {orderSteps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                    icon={index === currentStep ? step.icon : null}
                  />
                ))}
              </Steps>
            </div>
          </Card>

          <Card
            title={
              <Space>
                <FieldTimeOutlined />
                <span>订单活动记录</span>
              </Space>
            }
            bordered={true}
          >
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <Space>
                <ShoppingOutlined />
                <span>订单信息</span>
              </Space>
            }
            bordered={true}
            style={{ marginBottom: 24 }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">订单编号：</Text>
              <Text copyable strong>{orderId || 'N/A'}</Text>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text type="secondary">支付方式：</Text>
              <Tag color="blue">{getPaymentMethodName(paymentMethod)}</Tag>
            </div>

            {currentStep < 3 && (
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">预计完成时间：</Text>
                <br />
                <Countdown
                  value={Date.now() + remainingTime}
                  format="mm:ss"
                  prefix="剩余："
                />
              </div>
            )}

            {currentStep === 3 && (
              <Alert
                message="取餐提醒"
                description="您的餐品已准备完成，请凭订单号到前台取餐，感谢您的耐心等待！"
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Divider style={{ margin: '16px 0' }} />

            <div>
              <Text type="secondary">订单金额：</Text>
              <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>￥{total?.toFixed(2) || '0.00'}</Text>
            </div>
          </Card>

          {orderItems && orderItems.length > 0 && (
            <Card
              title="订单明细"
              bordered={true}
              size="small"
            >
              <List
                size="small"
                dataSource={orderItems}
                renderItem={item => (
                  <List.Item>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Text>{item.name} x{item.quantity}</Text>
                      <Text>￥{(item.price * item.quantity).toFixed(2)}</Text>
                    </div>
                  </List.Item>
                )}
                footer={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>合计</Text>
                    <Text strong>￥{total?.toFixed(2) || '0.00'}</Text>
                  </div>
                }
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Waiting;