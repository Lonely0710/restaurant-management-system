# 餐厅管理系统

这是一个基于React和Express的餐厅管理系统，提供菜品管理、订单管理和用户管理功能。

## 功能特性

- **菜品管理**：添加、编辑、删除菜品，分类管理
- **订单管理**：查看订单详情，包括订单项目和支付信息
- **用户管理**：添加、编辑用户，管理用户权限和状态

## 技术栈

- 前端：React, Ant Design, Axios
- 后端：Express, MySQL
- 构建工具：Vite

## 本地开发

### 前提条件

- Node.js v16+
- MySQL 8.0+

### 安装依赖

```bash
# 安装项目依赖
npm install
```

### 配置数据库

1. 创建MySQL数据库
2. 配置环境变量，在项目根目录创建`.env`文件：

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=restaurant_system
DB_PORT=3306
PORT=3001
```

3. 初始化数据库结构

```bash
# 使用MySQL客户端导入SQL脚本
mysql -u your_username -p restaurant_system < server/data/database.sql
```

### 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
npm run dev:server

# 同时启动前端和后端
npm run dev:all
```

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
restaurant-system/
├── public/             # 静态资源
├── server/             # 后端代码
│   ├── config/         # 数据库配置
│   ├── controllers/    # 控制器
│   ├── data/           # 数据库脚本
│   ├── models/         # 数据模型
│   └── routes/         # API路由
├── src/                # 前端代码
│   ├── admin/          # 管理员界面
│   ├── customer/       # 客户界面
│   └── pages/          # 公共页面
├── package.json        # 项目配置
└── vite.config.js      # Vite配置
```

## API接口

系统提供以下API接口：

- `/api/menu` - 菜品管理
- `/api/categories` - 分类管理
- `/api/users` - 用户管理
- `/api/orders` - 订单管理
- `/api/payments` - 支付管理

## 用户角色

系统支持三种用户角色：

- **超级管理员(0)** - 拥有所有权限
- **管理员(1)** - 拥有大部分管理权限
- **普通用户(2)** - 只能查看和下单
