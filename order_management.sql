/*
 Navicat Premium Dump SQL

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80040 (8.0.40)
 Source Host           : localhost:3306
 Source Schema         : order_management

 Target Server Type    : MySQL
 Target Server Version : 80040 (8.0.40)
 File Encoding         : 65001

 Date: 28/04/2025 01:22:30
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for Customer
-- ----------------------------
DROP TABLE IF EXISTS `Customer`;
CREATE TABLE `Customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `idx_customer_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Menu
-- ----------------------------
DROP TABLE IF EXISTS `Menu`;
CREATE TABLE `Menu` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'Uncategorized',
  PRIMARY KEY (`menu_id`),
  UNIQUE KEY `idx_menu_name` (`name`),
  CONSTRAINT `CK_Menu_price_Positive` CHECK ((`price` > 0)),
  CONSTRAINT `menu_chk_1` CHECK ((`price` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for OrderItem
-- ----------------------------
DROP TABLE IF EXISTS `OrderItem`;
CREATE TABLE `OrderItem` (
  `order_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`order_id`,`menu_id`),
  KEY `menu_id` (`menu_id`),
  CONSTRAINT `FK_OrderItem_Orders_order_id` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`),
  CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `Menu` (`menu_id`) ON DELETE CASCADE,
  CONSTRAINT `orderitem_chk_1` CHECK ((`quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Orders
-- ----------------------------
DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `order_date` datetime NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `customer_id` (`customer_id`),
  KEY `idx_order_date_customer` (`order_date`,`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `Customer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Table structure for Payment
-- ----------------------------
DROP TABLE IF EXISTS `Payment`;
CREATE TABLE `Payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `Orders` (`order_id`) ON DELETE CASCADE,
  CONSTRAINT `payment_chk_1` CHECK ((`amount` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- View structure for customercontacts_view
-- ----------------------------
DROP VIEW IF EXISTS `customercontacts_view`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `customercontacts_view` AS select `customer`.`name` AS `name`,`customer`.`phone` AS `phone` from `customer`;

-- ----------------------------
-- View structure for orderitemdetails_view
-- ----------------------------
DROP VIEW IF EXISTS `orderitemdetails_view`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `orderitemdetails_view` AS select `oi`.`order_id` AS `order_id`,`oi`.`menu_id` AS `menu_id`,`m`.`name` AS `menu_name`,`oi`.`quantity` AS `quantity`,`m`.`price` AS `unit_price`,(`oi`.`quantity` * `m`.`price`) AS `item_total_price` from (`orderitem` `oi` join `menu` `m`) where (`oi`.`menu_id` = `m`.`menu_id`);

-- ----------------------------
-- View structure for ordertotalamount
-- ----------------------------
DROP VIEW IF EXISTS `ordertotalamount`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `ordertotalamount` AS select `oi`.`order_id` AS `order_id`,sum((`oi`.`quantity` * `m`.`price`)) AS `total_amount` from (`orderitem` `oi` join `menu` `m`) where (`oi`.`menu_id` = `m`.`menu_id`) group by `oi`.`order_id`;

SET FOREIGN_KEY_CHECKS = 1;
