// src/customer/Ordering.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Button, Row, Col, Typography, InputNumber, Spin, message,
  List, Avatar, Badge, Drawer, Divider, Space, Empty, Affix,
  Layout, Menu, Tag, Modal, Image, Descriptions, Rate, Tooltip
} from 'antd';
import {
  ShoppingCartOutlined, PlusOutlined, MinusOutlined,
  AppstoreOutlined, BarsOutlined, InfoCircleOutlined,
  UserOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Sider, Content } = Layout;

function Ordering() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({}); // { menu_id: quantity }
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const navigate = useNavigate();

  const fetchMenu = async () => {
    setLoading(true);
    console.log("Fetching menu...");
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Dummy Data:
      const dummyData = [
        {
          menu_id: 1,
          name: '宫保鸡丁',
          price: 25.00,
          category: '热菜',
          description: '经典川菜，鸡丁嫩滑，花生香脆',
          ingredients: '鸡胸肉、花生、干辣椒、葱姜蒜',
          calories: 350,
          spicy_level: 2,
          cooking_time: '15分钟',
          is_recommended: true,
          rating: 4.7,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=宫保鸡丁'
        },
        {
          menu_id: 2,
          name: '水煮鱼',
          price: 58.00,
          category: '热菜',
          description: '麻辣鲜香，鱼片嫩滑',
          ingredients: '草鱼、豆芽、干辣椒、花椒',
          calories: 420,
          spicy_level: 5,
          cooking_time: '20分钟',
          is_recommended: true,
          rating: 4.8,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=水煮鱼'
        },
        {
          menu_id: 3,
          name: '米饭',
          price: 2.00,
          category: '主食',
          description: '东北大米',
          ingredients: '优质大米',
          calories: 200,
          spicy_level: 0,
          cooking_time: '30分钟',
          is_recommended: false,
          rating: 4.5,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=米饭'
        },
        {
          menu_id: 4,
          name: '可乐',
          price: 5.00,
          category: '饮料',
          description: '冰镇',
          ingredients: '可乐、冰块',
          calories: 150,
          spicy_level: 0,
          cooking_time: '即饮',
          is_recommended: false,
          rating: 4.0,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=可乐'
        },
        {
          menu_id: 5,
          name: '拍黄瓜',
          price: 12.00,
          category: '凉菜',
          description: '清爽可口',
          ingredients: '黄瓜、蒜末、香醋',
          calories: 80,
          spicy_level: 1,
          cooking_time: '10分钟',
          is_recommended: true,
          rating: 4.6,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=拍黄瓜'
        },
        {
          menu_id: 6,
          name: '香煎鸡排',
          price: 22.00,
          category: '热菜',
          description: '外酥里嫩，香气四溢',
          ingredients: '鸡胸肉、面包糠、鸡蛋',
          calories: 380,
          spicy_level: 0,
          cooking_time: '15分钟',
          is_recommended: true,
          rating: 4.5,
          img_url: 'https://placehold.co/300x300/e8e8e8/787878?text=香煎鸡排'
        },
      ];

      // 提取所有类别
      const allCategories = [...new Set(dummyData.map(item => item.category))];
      setCategories(allCategories);

      // 存储为分类对象
      const groupedMenu = dummyData.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
      }, {});

      setMenu(groupedMenu);
    } catch (error) {
      console.error("Failed to fetch menu:", error);
      message.error('加载菜单失败!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Cart Handlers
  const addToCart = (item) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[item.menu_id] || 0;
      return { ...prevCart, [item.menu_id]: currentQuantity + 1 };
    });
    message.success(`${item.name} 已添加到购物车`);
  };

  const updateQuantity = (itemId, newQuantity) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        const { [itemId]: _, ...rest } = prevCart; // Remove item if quantity is 0 or less
        return rest;
      }
      return { ...prevCart, [itemId]: newQuantity };
    });
  };

  const removeFromCart = (itemId) => {
    updateQuantity(itemId, 0); // Use updateQuantity to remove
  };

  const showDrawer = () => setCartVisible(true);
  const closeDrawer = () => setCartVisible(false);

  const getCartItems = () => {
    // Flatten menu for easy lookup
    const flatMenu = Object.values(menu).flat();
    return Object.entries(cart)
      .map(([id, quantity]) => {
        const itemDetails = flatMenu.find(item => item.menu_id === parseInt(id));
        return itemDetails ? { ...itemDetails, quantity } : null;
      })
      .filter(item => item !== null); // Filter out any potential mismatches
  };

  const cartItems = getCartItems();
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const proceedToPayment = () => {
    if (cartItems.length === 0) {
      message.warning('购物车是空的！');
      return;
    }
    console.log("Proceeding to payment with cart:", cartItems);
    closeDrawer();
    // Pass cart data to payment page via route state
    navigate('/customer/payment', { state: { orderItems: cartItems, total: totalPrice } });
  };

  // 显示菜品详情
  const showDishDetail = (dish) => {
    setSelectedDish(dish);
    setDetailVisible(true);
  };

  // 获取当前显示的菜品
  const getDisplayedItems = () => {
    if (selectedCategory === 'all') {
      return Object.values(menu).flat();
    }
    return menu[selectedCategory] || [];
  };

  // 辣度显示
  const renderSpicyLevel = (level) => {
    const spicyLevels = ['不辣', '微辣', '中辣', '辣', '特辣'];
    return (
      <Space>
        <Rate
          character={<span style={{ color: 'red' }}>辣</span>}
          disabled
          value={level}
          count={5}
        />
        <Text type="secondary">{spicyLevels[level] || '未知'}</Text>
      </Space>
    );
  };

  return (
    <Layout style={{ background: '#fff', minHeight: 'calc(100vh - 170px)' }}>
      {/* 侧边分类菜单 */}
      <Sider
        width={200}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100%',
          position: 'sticky',
          left: 0,
          top: 0,
          borderRight: '1px solid #f0f0f0'
        }}
      >
        <div style={{ padding: '16px 0' }}>
          <Title level={4} style={{ textAlign: 'center' }}>菜品分类</Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedCategory]}
          style={{ borderRight: 0 }}
          onClick={({ key }) => setSelectedCategory(key)}
        >
          <Menu.Item key="all" icon={<AppstoreOutlined />}>
            全部菜品
          </Menu.Item>
          <Menu.Divider />
          {categories.map(category => (
            <Menu.Item key={category} icon={<BarsOutlined />}>
              {category}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>

      {/* 主内容区 */}
      <Content style={{ padding: '0 24px', minHeight: 280 }}>
        <Spin spinning={loading}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3}>{selectedCategory === 'all' ? '全部菜品' : selectedCategory}</Title>
            <Badge count={totalQuantity} size="small">
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                onClick={showDrawer}
              >
                购物车
              </Button>
            </Badge>
          </div>

          <Row gutter={[16, 16]}>
            {getDisplayedItems().map(item => (
              <Col xs={24} sm={12} key={item.menu_id}>
                <Card
                  hoverable
                  bordered
                  style={{ display: 'flex', height: '100%' }}
                  bodyStyle={{ padding: 16, flex: 1, display: 'flex' }}
                >
                  {/* 左侧图片 */}
                  <div style={{ flex: '0 0 120px', marginRight: 16 }}>
                    <Image
                      src={item.img_url}
                      alt={item.name}
                      style={{ width: 120, height: 120, objectFit: 'cover' }}
                      preview={false}
                      onClick={() => showDishDetail(item)}
                    />
                  </div>

                  {/* 右侧内容 */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 16 }}>{item.name}</Text>
                        <Text type="danger" strong>￥{item.price.toFixed(2)}</Text>
                      </div>

                      <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#666', marginBottom: 8 }}>
                        {item.description || '暂无描述'}
                      </Paragraph>

                      <div style={{ marginBottom: 8 }}>
                        {item.spicy_level > 0 &&
                          <Tag color="red">辣度: {item.spicy_level}</Tag>
                        }
                        {item.is_recommended &&
                          <Tag color="green">推荐</Tag>
                        }
                        <Tag color="blue">{item.category}</Tag>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Button
                          type="text"
                          icon={<InfoCircleOutlined />}
                          onClick={() => showDishDetail(item)}
                        >
                          详情
                        </Button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<MinusOutlined />}
                          size="small"
                          onClick={() => updateQuantity(item.menu_id, (cart[item.menu_id] || 0) - 1)}
                          disabled={!cart[item.menu_id]}
                        />
                        <span style={{ margin: '0 8px', minWidth: '20px', textAlign: 'center' }}>
                          {cart[item.menu_id] || 0}
                        </span>
                        <Button
                          type="primary"
                          shape="circle"
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => addToCart(item)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          {getDisplayedItems().length === 0 && (
            <Empty description="暂无菜品" />
          )}
        </Spin>
      </Content>

      {/* 菜品详情弹窗 */}
      <Modal
        title={
          <Space>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => setDetailVisible(false)}
            />
            <span>菜品详情</span>
          </Space>
        }
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text type="danger" strong style={{ fontSize: 18 }}>
              ￥{selectedDish?.price?.toFixed(2) || '0.00'}
            </Text>
            <Button
              type="primary"
              onClick={() => {
                if (selectedDish) {
                  addToCart(selectedDish);
                  setDetailVisible(false);
                }
              }}
            >
              加入购物车
            </Button>
          </div>
        }
        width={700}
        bodyStyle={{ padding: '24px' }}
      >
        {selectedDish && (
          <div>
            <div style={{ display: 'flex', marginBottom: 24 }}>
              <Image
                src={selectedDish.img_url}
                alt={selectedDish.name}
                style={{ width: 300, height: 300, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, marginLeft: 24 }}>
                <Title level={3}>{selectedDish.name}</Title>
                <Rate disabled value={selectedDish.rating} allowHalf />
                <Text style={{ marginLeft: 8 }}>{selectedDish.rating}</Text>

                <Paragraph style={{ margin: '16px 0' }}>
                  {selectedDish.description}
                </Paragraph>

                <div style={{ marginBottom: 16 }}>
                  {selectedDish.is_recommended && (
                    <Tag color="green">厨师推荐</Tag>
                  )}
                  <Tag color="blue">{selectedDish.category}</Tag>
                  <Tag color="orange">烹饪时间: {selectedDish.cooking_time}</Tag>
                  <Tag color="purple">卡路里: {selectedDish.calories}cal</Tag>
                </div>

                {selectedDish.spicy_level > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>辣度: </Text>
                    {renderSpicyLevel(selectedDish.spicy_level)}
                  </div>
                )}
              </div>
            </div>

            <Divider />

            <Descriptions title="详细信息" bordered>
              <Descriptions.Item label="配料" span={3}>
                {selectedDish.ingredients}
              </Descriptions.Item>
              <Descriptions.Item label="分类">
                {selectedDish.category}
              </Descriptions.Item>
              <Descriptions.Item label="烹饪时间">
                {selectedDish.cooking_time}
              </Descriptions.Item>
              <Descriptions.Item label="卡路里">
                {selectedDish.calories} 卡路里
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <Title level={5}>口味选择</Title>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button>不辣</Button>
                <Button>微辣</Button>
                <Button>中辣</Button>
                <Button>特辣</Button>
                <Button>原味</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 购物车抽屉 */}
      <Drawer
        title={
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>
            <ShoppingCartOutlined /> 我的购物车
          </div>
        }
        placement="right"
        onClose={closeDrawer}
        open={cartVisible}
        width={380}
        headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '16px 24px' }}
        bodyStyle={{ padding: '16px 24px' }}
        footer={
          <div style={{ padding: '16px 0' }}>
            <Divider style={{ margin: '0 0 16px 0' }} />
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>小计:</Text>
                <Text>￥{totalPrice.toFixed(2)}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>总计:</Text>
                <Text strong type="danger" style={{ fontSize: 18 }}>￥{totalPrice.toFixed(2)}</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                block
                onClick={closeDrawer}
              >
                继续点餐
              </Button>
              <Button
                type="primary"
                block
                onClick={proceedToPayment}
                disabled={cartItems.length === 0}
              >
                去结算 ({totalQuantity}件)
              </Button>
            </div>
          </div>
        }
      >
        {cartItems.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={item => (
              <List.Item style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <Image
                    src={item.img_url}
                    alt={item.name}
                    width={60}
                    height={60}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                    preview={false}
                  />
                  <div style={{ flex: 1, marginLeft: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text strong>{item.name}</Text>
                      <Text type="danger">￥{(item.price * item.quantity).toFixed(2)}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text type="secondary">￥{item.price.toFixed(2)}/份</Text>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                          type="text"
                          icon={<MinusOutlined />}
                          size="small"
                          onClick={() => updateQuantity(item.menu_id, item.quantity - 1)}
                        />
                        <Text style={{ margin: '0 8px', minWidth: '24px', textAlign: 'center' }}>
                          {item.quantity}
                        </Text>
                        <Button
                          type="text"
                          icon={<PlusOutlined />}
                          size="small"
                          onClick={() => updateQuantity(item.menu_id, item.quantity + 1)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="购物车是空的"
            style={{ margin: '40px 0' }}
          />
        )}
      </Drawer>
    </Layout>
  );
}

export default Ordering;