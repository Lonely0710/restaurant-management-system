/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : restaurant-management

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 06/06/2025 20:26:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Category
-- ----------------------------
DROP TABLE IF EXISTS `Category`;
CREATE TABLE `Category` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Menu
-- ----------------------------
DROP TABLE IF EXISTS `Menu`;
CREATE TABLE `Menu` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category_id` int DEFAULT NULL,
  `style` varchar(255) DEFAULT NULL COMMENT '菜品风格，例如：清淡,辣,川菜,饮品',
  `imgurl` varchar(500) DEFAULT 'https://placehold.co/300x300/e8e8e8/787878?text=img',
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `name` (`name`),
  KEY `FK_Menu_Category` (`category_id`),
  CONSTRAINT `FK_Menu_Category` FOREIGN KEY (`category_id`) REFERENCES `Category` (`category_id`) ON DELETE SET NULL,
  CONSTRAINT `CK_Menu_price_Positive` CHECK ((`price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for menu_archive
-- ----------------------------
DROP TABLE IF EXISTS `menu_archive`;
CREATE TABLE `menu_archive` (
  `archive_id` int NOT NULL AUTO_INCREMENT,
  `menu_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `style` varchar(255) DEFAULT NULL,
  `imgurl` varchar(500) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `deleted_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`archive_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for menu_log
-- ----------------------------
DROP TABLE IF EXISTS `menu_log`;
CREATE TABLE `menu_log` (
  `log_id` int NOT NULL AUTO_INCREMENT,
  `menu_id` int DEFAULT NULL,
  `operation_type` varchar(10) DEFAULT NULL,
  `change_timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `details` text,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for OrderItem
-- ----------------------------
DROP TABLE IF EXISTS `OrderItem`;
CREATE TABLE `OrderItem` (
  `order_id` varchar(30) NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_id`,`menu_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `FK_OrderItem_Menu` FOREIGN KEY (`menu_id`) REFERENCES `Menu` (`menu_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_OrderItem_Orders` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`),
  CONSTRAINT `CK_OrderItem_quantity_Positive` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Orders
-- ----------------------------
DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `order_id` varchar(20) NOT NULL,
  `user_id` varchar(10) NOT NULL,
  `order_date` datetime NOT NULL,
  `state` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`order_id`),
  KEY `idx_order_date_user` (`order_date`,`user_id`),
  KEY `FK_Orders_Users` (`user_id`),
  CONSTRAINT `FK_Orders_Users` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Payment
-- ----------------------------
DROP TABLE IF EXISTS `Payment`;
CREATE TABLE `Payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(30) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `FK_Payment_Orders` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`),
  CONSTRAINT `CK_Payment_amount_Positive` CHECK ((`amount` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Users
-- ----------------------------
DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `user_id` varchar(10) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_time` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `identity` tinyint NOT NULL DEFAULT '2',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `phone` (`phone`),
  CONSTRAINT `users_chk_1` CHECK ((`identity` in (0,1,2)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Procedure structure for AddMenu
-- ----------------------------
DROP PROCEDURE IF EXISTS `AddMenu`;
delimiter ;;
CREATE PROCEDURE `AddMenu`(IN p_name VARCHAR(100),
  IN p_price DECIMAL(10,2),
  IN p_category_id INT,
  IN p_style VARCHAR(255),
  IN p_imgurl VARCHAR(500),
  IN p_description TEXT)
BEGIN
  INSERT INTO Menu (name, price, category_id, style, imgurl, description)
  VALUES (
    p_name,
    p_price,
    p_category_id,
    p_style,
    IFNULL(p_imgurl, 'https://placehold.co/300x300/e8e8e8/787878?text=img'),
    p_description
  );

  -- 返回插入的 menu_id
  SELECT LAST_INSERT_ID() AS menu_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AddOrder
-- ----------------------------
DROP PROCEDURE IF EXISTS `AddOrder`;
delimiter ;;
CREATE PROCEDURE `AddOrder`(IN p_user_id VARCHAR(10),
  IN p_menu_id INT,
  IN p_quantity INT)
BEGIN
  DECLARE new_order_id VARCHAR(30);

  SET new_order_id = GenerateOrderNo(p_user_id);

  INSERT INTO Orders (order_id, user_id, order_date)
  VALUES (new_order_id, p_user_id, NOW());

  INSERT INTO OrderItem (order_id, menu_id, quantity)
  VALUES (new_order_id, p_menu_id, p_quantity);
  
  -- 返回新创建的订单ID
  SELECT new_order_id AS order_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for AddUser
-- ----------------------------
DROP PROCEDURE IF EXISTS `AddUser`;
delimiter ;;
CREATE PROCEDURE `AddUser`(IN p_password_hash VARCHAR(255),
  IN p_name VARCHAR(100),
  IN p_phone VARCHAR(15),
  IN p_identity TINYINT)
BEGIN
  DECLARE new_user_id VARCHAR(10);

  SET new_user_id = GenerateUserId(p_identity);

   -- 插入用户数据
  INSERT INTO Users (
    user_id, 
    password_hash, 
    name, 
    phone, 
    create_time, 
    is_active, 
    identity
  ) VALUES (
    new_user_id,
    p_password_hash, 
    p_name, 
    p_phone, 
    NOW(), 
    1, 
    p_identity
  );
  
  -- 返回创建的用户ID
  SELECT new_user_id AS user_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for DeleteMenu
-- ----------------------------
DROP PROCEDURE IF EXISTS `DeleteMenu`;
delimiter ;;
CREATE PROCEDURE `DeleteMenu`(IN p_menu_id INT)
BEGIN
  -- 直接删除菜品，不检查订单关联
  DELETE FROM Menu WHERE menu_id = p_menu_id;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for GenerateOrderNo
-- ----------------------------
DROP FUNCTION IF EXISTS `GenerateOrderNo`;
delimiter ;;
CREATE FUNCTION `GenerateOrderNo`(user_id VARCHAR(10))
 RETURNS varchar(30) CHARSET utf8mb4
  READS SQL DATA 
BEGIN
    DECLARE date_part VARCHAR(8);
    DECLARE count_today INT;
    DECLARE seq_part VARCHAR(4);
    DECLARE result VARCHAR(30);

    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d');

    SELECT COUNT(*) INTO count_today
    FROM Orders
    WHERE user_id = user_id AND DATE(order_date) = CURDATE();

    SET seq_part = LPAD(count_today + 1, 4, '0');

    SET result = CONCAT('ORD', date_part, user_id, seq_part);

    RETURN result;
END
;;
delimiter ;

-- ----------------------------
-- Function structure for GenerateUserId
-- ----------------------------
DROP FUNCTION IF EXISTS `GenerateUserId`;
delimiter ;;
CREATE FUNCTION `GenerateUserId`(p_identity TINYINT)
 RETURNS varchar(10) CHARSET utf8mb4
  DETERMINISTIC
BEGIN
    DECLARE prefix CHAR(1);
    DECLARE max_id INT;
    DECLARE new_id VARCHAR(10);

    CASE p_identity
        WHEN 0 THEN SET prefix = 'A'; -- Admin
        WHEN 1 THEN SET prefix = 'E'; -- Employee
        ELSE SET prefix = 'U';        -- User
    END CASE;

    -- 获取该身份用户编号最大数字部分
    SELECT MAX(CAST(SUBSTRING(user_id, 2) AS UNSIGNED)) INTO max_id
    FROM Users
    WHERE user_id LIKE CONCAT(prefix, '%');

    IF max_id IS NULL THEN
        SET max_id = 0;
    END IF;

    SET new_id = CONCAT(prefix, LPAD(max_id + 1, 4, '0'));

    RETURN new_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for GetAllMenusWithCategory
-- ----------------------------
DROP PROCEDURE IF EXISTS `GetAllMenusWithCategory`;
delimiter ;;
CREATE PROCEDURE `GetAllMenusWithCategory`()
BEGIN
  SELECT m.menu_id, m.name, m.price, m.category_id, m.style, c.category_name, m.imgurl, m.description
  FROM Menu m
  LEFT JOIN Category c ON m.category_id = c.category_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for GetAllOrders
-- ----------------------------
DROP PROCEDURE IF EXISTS `GetAllOrders`;
delimiter ;;
CREATE PROCEDURE `GetAllOrders`()
BEGIN
  SELECT o.order_id, o.order_date, u.name as user_name, u.phone as user_phone, 
         (SELECT SUM(oi.quantity * m.price) FROM OrderItem oi 
          JOIN Menu m ON oi.menu_id = m.menu_id 
          WHERE oi.order_id = o.order_id) as total_amount,
         IFNULL(p.payment_id IS NOT NULL, 0) as state
  FROM Orders o
  JOIN Users u ON o.user_id = u.user_id
  LEFT JOIN Payment p ON o.order_id = p.order_id
  ORDER BY o.order_date DESC;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for GetOrderDetails
-- ----------------------------
DROP PROCEDURE IF EXISTS `GetOrderDetails`;
delimiter ;;
CREATE PROCEDURE `GetOrderDetails`(IN p_order_id VARCHAR(30))
BEGIN
  SELECT oi.menu_id, m.name, oi.quantity, m.price, 
         (oi.quantity * m.price) AS subtotal
  FROM OrderItem oi
  JOIN Menu m ON oi.menu_id = m.menu_id
  WHERE oi.order_id = p_order_id;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for GetUserOrders
-- ----------------------------
DROP PROCEDURE IF EXISTS `GetUserOrders`;
delimiter ;;
CREATE PROCEDURE `GetUserOrders`(IN p_user_id VARCHAR(10))
BEGIN
  SELECT o.order_id, o.order_date, 
         SUM(oi.quantity * m.price) AS total_amount
  FROM Orders o
  JOIN OrderItem oi ON o.order_id = oi.order_id
  JOIN Menu m ON oi.menu_id = m.menu_id
  WHERE o.user_id = p_user_id
  GROUP BY o.order_id, o.order_date;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for UpdateMenu
-- ----------------------------
DROP PROCEDURE IF EXISTS `UpdateMenu`;
delimiter ;;
CREATE PROCEDURE `UpdateMenu`(IN p_menu_id INT,
    IN p_name VARCHAR(255),
    IN p_price DECIMAL(10, 2),
    IN p_category_id INT,
    IN p_style VARCHAR(255),
    IN p_imgurl VARCHAR(255),
    IN p_description TEXT)
BEGIN
    UPDATE Menu
    SET
        name = p_name,
        price = p_price,
        category_id = p_category_id,
        style = p_style,
        imgurl = p_imgurl,
        description = p_description
    WHERE menu_id = p_menu_id;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table Menu
-- ----------------------------
DROP TRIGGER IF EXISTS `after_menu_insert`;
delimiter ;;
CREATE TRIGGER `restaurant-management`.`after_menu_insert` AFTER INSERT ON `Menu` FOR EACH ROW BEGIN
    INSERT INTO menu_log (menu_id, operation_type, details)
    VALUES (NEW.menu_id, 'INSERT', CONCAT('新菜品 "', NEW.name, '" (ID: ', NEW.menu_id, ') 被添加.'));
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table Menu
-- ----------------------------
DROP TRIGGER IF EXISTS `after_menu_update`;
delimiter ;;
CREATE TRIGGER `restaurant-management`.`after_menu_update` AFTER UPDATE ON `Menu` FOR EACH ROW BEGIN
    -- 检查是否有实际的字段变化，避免无意义的日志
    IF OLD.name <> NEW.name 
        OR OLD.price <> NEW.price 
        OR OLD.category_id <> NEW.category_id 
        OR OLD.style <> NEW.style 
        OR OLD.imgurl <> NEW.imgurl 
        OR OLD.description <> NEW.description THEN
        INSERT INTO menu_log (menu_id, operation_type, details)
        VALUES (NEW.menu_id, 'UPDATE', CONCAT('菜品 "', NEW.name, '" (ID: ', NEW.menu_id, ') 被更新.'));
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table Menu
-- ----------------------------
DROP TRIGGER IF EXISTS `before_menu_delete`;
delimiter ;;
CREATE TRIGGER `restaurant-management`.`before_menu_delete` BEFORE DELETE ON `Menu` FOR EACH ROW BEGIN
    INSERT INTO menu_archive (menu_id, name, price, category_id, style, imgurl, description)
    VALUES (OLD.menu_id, OLD.name, OLD.price, OLD.category_id, OLD.style, OLD.imgurl, OLD.description);
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
