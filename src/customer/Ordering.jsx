// src/customer/Ordering.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, InputNumber, Spin, message, List, Avatar, Badge, Drawer, Divider, Space, Empty, Affix } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

function Ordering() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({}); // { menu_id: quantity }
  const [cartVisible, setCartVisible] = useState(false);
  const navigate = useNavigate();

  const fetchMenu = async () => {
    setLoading(true);
    console.log("Fetching menu...");
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      // Replace with actual API call
      // const response = await axios.get('/api/menu');
      // setMenu(response.data);

      // Dummy Data (Grouped by category):
      const dummyData = [
        { menu_id: 1, name: '宫保鸡丁', price: 25.00, category: '主菜', description: '经典川菜，鸡丁嫩滑，花生香脆' },
        { menu_id: 2, name: '水煮鱼', price: 58.00, category: '主菜', description: '麻辣鲜香，鱼片嫩滑' },
        { menu_id: 3, name: '米饭', price: 2.00, category: '主食', description: '东北大米' },
        { menu_id: 4, name: '可乐', price: 5.00, category: '饮料', description: '冰镇' },
        { menu_id: 5, name: '拍黄瓜', price: 12.00, category: '凉菜', description: '清爽可口' },
      ];
      const groupedMenu = dummyData.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
      }, {});
      setMenu(groupedMenu); // Store as object with categories as keys

      // message.success('菜单加载成功!');
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


  return (
    <div>
      <Spin spinning={loading}>
        {Object.entries(menu).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '32px' }}>
            <Title level={3}>{category}</Title>
            <Row gutter={[16, 16]}>
              {items.map(item => (
                <Col xs={24} sm={12} md={8} lg={6} key={item.menu_id}>
                  <Card
                    hoverable
                    actions={[
                      <InputNumber
                        min={0}
                        value={cart[item.menu_id] || 0}
                        onChange={(value) => updateQuantity(item.menu_id, value)}
                        style={{ width: '60px', marginRight: '8px' }}
                      />,
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => addToCart(item)}>
                        加购
                      </Button>
                    ]}
                  >
                    <Meta
                      // avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />} // Optional image
                      title={`${item.name} - ￥${item.price.toFixed(2)}`}
                      description={<Paragraph ellipsis={{ rows: 2 }}>{item.description || '暂无描述'}</Paragraph>}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))}
        {Object.keys(menu).length === 0 && !loading && <Empty description="暂无菜品" />}
      </Spin>

      {/* Cart Floating Button */}
      <Affix style={{ position: 'fixed', bottom: 40, right: 40 }}>
        <Badge count={totalQuantity} size="default">
          <Button
            type="primary"
            shape="circle"
            icon={<ShoppingCartOutlined />}
            size="large"
            onClick={showDrawer}
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
        </Badge>
      </Affix>

      {/* Cart Drawer */}
      <Drawer
        title="我的购物车"
        placement="right"
        onClose={closeDrawer}
        open={cartVisible}
        width={350}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end" style={{ width: '100%' }}>
              <Title level={4}>总计: ￥{totalPrice.toFixed(2)}</Title>
              <Button onClick={closeDrawer} style={{ marginRight: 8 }}>
                继续点餐
              </Button>
              <Button onClick={proceedToPayment} type="primary" disabled={cartItems.length === 0}>
                去结算
              </Button>
            </Space>
          </div>
        }
      >
        {cartItems.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={cartItems}
            renderItem={item => (
              <List.Item
                actions={[
                  <InputNumber
                    min={1}
                    size='small'
                    value={item.quantity}
                    onChange={(value) => updateQuantity(item.menu_id, value)}
                    style={{ width: '50px' }}
                  />,
                  <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.menu_id)} />
                ]}
              >
                <List.Item.Meta
                  // avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
                  title={<a href="#!">{item.name}</a>} // Avoid actual link navigation
                  description={`￥${item.price.toFixed(2)}`}
                />
                <div>x {item.quantity}</div>
              </List.Item>
            )}
          />
        ) : (
          <Empty description="购物车是空的" />
        )}
      </Drawer>
    </div>
  );
}

export default Ordering;