-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: smartdom_platform
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `smartdom_platform`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `smartdom_platform` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `smartdom_platform`;

--
-- Table structure for table `coin_transactions`
--

DROP TABLE IF EXISTS `coin_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `coin_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dormitory_id` int(11) NOT NULL,
  `type` enum('TopUp','Usage') NOT NULL,
  `amount` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coin_transactions`
--

LOCK TABLES `coin_transactions` WRITE;
/*!40000 ALTER TABLE `coin_transactions` DISABLE KEYS */;
INSERT INTO `coin_transactions` VALUES (1,1,'Usage',0,'ซื้อแพ็กเกจ Starter','2026-06-24 03:30:49'),(2,1,'TopUp',3000,'เติมเงินเข้าระบบ','2026-06-24 03:30:59');
/*!40000 ALTER TABLE `coin_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_registry`
--

DROP TABLE IF EXISTS `dormitory_registry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_registry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_email` varchar(255) NOT NULL,
  `owner_name` varchar(255) NOT NULL,
  `dorm_name` varchar(255) NOT NULL,
  `db_name` varchar(100) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Active','Suspended','Cancelled') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `coins` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `owner_email` (`owner_email`),
  UNIQUE KEY `db_name` (`db_name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_registry`
--

LOCK TABLES `dormitory_registry` WRITE;
/*!40000 ALTER TABLE `dormitory_registry` DISABLE KEYS */;
INSERT INTO `dormitory_registry` VALUES (1,'kritsakorn801@gmail.com','kritsakorn801@gmail.com','หอพักกฤษกร','smartdom_dorm_1','0636040550','88/12 ','Active','2026-06-24 03:25:02','2026-06-24 03:25:02',3000);
/*!40000 ALTER TABLE `dormitory_registry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `packages`
--

DROP TABLE IF EXISTS `packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `max_rooms` int(11) NOT NULL,
  `max_dorms` int(11) DEFAULT 1,
  `features` longtext DEFAULT NULL,
  `duration_days` int(11) DEFAULT 30,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `packages`
--

LOCK TABLES `packages` WRITE;
/*!40000 ALTER TABLE `packages` DISABLE KEYS */;
INSERT INTO `packages` VALUES (1,'Starter',0.00,10,1,'[\\\"20 ห้องพัก\\\",\\\"1 หอพัก\\\"]',30,1,'2026-06-24 02:46:54'),(2,'Professional',990.00,50,1,'[\"จัดการได้สูงสุด 50 ห้อง\",\"ระบบแจ้งซ่อมอัตโนมัติ\",\"ระบบบัญชีเต็มรูปแบบ\",\"Line Notification สำหรับผู้เช่า\"]',30,1,'2026-06-24 02:46:54'),(3,'Enterprise',2490.00,9999,10,'[\"ไม่จำกัดจำนวนห้อง\",\"ทุกฟีเจอร์จาก Pro\",\"ซัพพอร์ตระดับ VIP 24/7\",\"ระบบจองห้องออนไลน์ผ่านเว็บ\"]',30,1,'2026-06-24 02:46:54'),(4,'Starter',0.00,20,1,'[]',30,1,'2026-06-24 02:50:05');
/*!40000 ALTER TABLE `packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_accounting`
--

DROP TABLE IF EXISTS `platform_accounting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_accounting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('Income','Refund','Adjustment','Expense') NOT NULL,
  `category` varchar(100) DEFAULT 'Subscription',
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `dormitory_id` int(11) DEFAULT NULL,
  `subscription_id` int(11) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dormitory_id` (`dormitory_id`),
  CONSTRAINT `platform_accounting_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitory_registry` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_accounting`
--

LOCK TABLES `platform_accounting` WRITE;
/*!40000 ALTER TABLE `platform_accounting` DISABLE KEYS */;
INSERT INTO `platform_accounting` VALUES (1,'Income','TopUp',3000.00,'เติมเงินซื้อเหรียญ',1,NULL,'2026-06-24','2026-06-24 03:30:59');
/*!40000 ALTER TABLE `platform_accounting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_activity_log`
--

DROP TABLE IF EXISTS `platform_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) DEFAULT NULL,
  `target_id` int(11) DEFAULT NULL,
  `details` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_activity_log`
--

LOCK TABLES `platform_activity_log` WRITE;
/*!40000 ALTER TABLE `platform_activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `platform_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platform_admins`
--

DROP TABLE IF EXISTS `platform_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platform_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('super_admin','support') DEFAULT 'super_admin',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platform_admins`
--

LOCK TABLES `platform_admins` WRITE;
/*!40000 ALTER TABLE `platform_admins` DISABLE KEYS */;
INSERT INTO `platform_admins` VALUES (2,'admin','$2b$10$SEyCjlcahPfNH.n0gpwIJean9ObJtyGbTiR6Fo84hdLz6qZXJ21W2','Platform Owner','super_admin',1,'2026-06-24 02:46:55');
/*!40000 ALTER TABLE `platform_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dormitory_id` int(11) NOT NULL,
  `package_id` int(11) NOT NULL,
  `status` enum('Active','Expired','Cancelled','Pending') DEFAULT 'Active',
  `start_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_date` timestamp NULL DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT 'manual',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `dormitory_id` (`dormitory_id`),
  KEY `package_id` (`package_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`dormitory_id`) REFERENCES `dormitory_registry` (`id`),
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,1,2,'Expired','2026-06-24 03:25:03','2026-07-23 20:25:03',0.00,'manual',NULL,'2026-06-24 03:25:03'),(2,1,1,'Active','2026-07-23 13:25:03','2026-08-22 13:25:03',0.00,'manual',NULL,'2026-06-24 03:30:49');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `smartdom_dorm_1`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `smartdom_dorm_1` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `smartdom_dorm_1`;

--
-- Table structure for table `accounting_monthly_summary`
--

DROP TABLE IF EXISTS `accounting_monthly_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounting_monthly_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year` int(11) NOT NULL,
  `month` int(11) NOT NULL,
  `total_income` decimal(10,2) DEFAULT 0.00,
  `total_expense` decimal(10,2) DEFAULT 0.00,
  `net_profit` decimal(10,2) DEFAULT 0.00,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `year` (`year`,`month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_monthly_summary`
--

LOCK TABLES `accounting_monthly_summary` WRITE;
/*!40000 ALTER TABLE `accounting_monthly_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_monthly_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounting_transactions`
--

DROP TABLE IF EXISTS `accounting_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `accounting_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('Income','Expense') NOT NULL,
  `category` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounting_transactions`
--

LOCK TABLES `accounting_transactions` WRITE;
/*!40000 ALTER TABLE `accounting_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounting_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcement_reads`
--

DROP TABLE IF EXISTS `announcement_reads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcement_reads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `announcement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_read` (`announcement_id`,`user_id`),
  CONSTRAINT `announcement_reads_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcement_reads`
--

LOCK TABLES `announcement_reads` WRITE;
/*!40000 ALTER TABLE `announcement_reads` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcement_reads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `is_important` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `billing_cycle` varchar(100) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('Unpaid','Paid','Overdue','Cancelled') DEFAULT 'Unpaid',
  `slip_url` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_progress`
--

DROP TABLE IF EXISTS `booking_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `booking_progress_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_progress`
--

LOCK TABLES `booking_progress` WRITE;
/*!40000 ALTER TABLE `booking_progress` DISABLE KEYS */;
/*!40000 ALTER TABLE `booking_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cleaning_jobs`
--

DROP TABLE IF EXISTS `cleaning_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cleaning_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) DEFAULT NULL,
  `task` varchar(255) NOT NULL,
  `status` enum('pending','in_progress','completed') DEFAULT 'pending',
  `assigned_to` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `photo_url` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `cleaning_jobs_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cleaning_jobs`
--

LOCK TABLES `cleaning_jobs` WRITE;
/*!40000 ALTER TABLE `cleaning_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `cleaning_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `deposit_amount` decimal(10,2) DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'PendingTenantSignature',
  `signature_data` longtext DEFAULT NULL,
  `owner_signature_data` longtext DEFAULT NULL,
  `signed_at` timestamp NULL DEFAULT NULL,
  `contract_terms` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `contracts_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `contracts_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `guest_id` int(11) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `last_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_profile`
--

DROP TABLE IF EXISTS `dormitory_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `water_rate` decimal(10,2) DEFAULT 18.00,
  `electricity_rate` decimal(10,2) DEFAULT 8.00,
  `has_wifi` tinyint(1) DEFAULT 0,
  `has_parking` tinyint(1) DEFAULT 0,
  `pet_friendly` tinyint(1) DEFAULT 0,
  `has_lan` tinyint(1) DEFAULT 0,
  `facilities` text DEFAULT NULL,
  `map_url` longtext DEFAULT NULL,
  `description` text DEFAULT NULL,
  `has_air_con` tinyint(1) DEFAULT 0,
  `cover_image` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_profile`
--

LOCK TABLES `dormitory_profile` WRITE;
/*!40000 ALTER TABLE `dormitory_profile` DISABLE KEYS */;
INSERT INTO `dormitory_profile` VALUES (1,'หอพักกฤษกร','88/12 ','0636040550',NULL,1,18.00,8.00,0,0,0,0,NULL,NULL,NULL,0,NULL,'2026-06-24 03:25:03');
/*!40000 ALTER TABLE `dormitory_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_rules`
--

DROP TABLE IF EXISTS `dormitory_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_rules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `order_index` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_rules`
--

LOCK TABLES `dormitory_rules` WRITE;
/*!40000 ALTER TABLE `dormitory_rules` DISABLE KEYS */;
/*!40000 ALTER TABLE `dormitory_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `keepers`
--

DROP TABLE IF EXISTS `keepers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `keepers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `position` enum('Maid','Technician','Guard','Other') DEFAULT 'Maid',
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `keepers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `keepers`
--

LOCK TABLES `keepers` WRITE;
/*!40000 ALTER TABLE `keepers` DISABLE KEYS */;
/*!40000 ALTER TABLE `keepers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_jobs`
--

DROP TABLE IF EXISTS `maintenance_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_jobs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_id` int(11) DEFAULT NULL,
  `issue` text NOT NULL,
  `urgency` enum('normal','rush') DEFAULT 'normal',
  `status` enum('pending','in_progress','waiting_parts','completed','cancelled') DEFAULT 'pending',
  `assigned_to` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `photo_url` longtext DEFAULT NULL,
  `tenant_notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `assigned_to` (`assigned_to`),
  CONSTRAINT `maintenance_jobs_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `maintenance_jobs_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_jobs`
--

LOCK TABLES `maintenance_jobs` WRITE;
/*!40000 ALTER TABLE `maintenance_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `maintenance_requests`
--

DROP TABLE IF EXISTS `maintenance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `maintenance_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `issue_type` varchar(100) DEFAULT NULL,
  `description` text NOT NULL,
  `status` enum('Pending','InProgress','Completed','Cancelled') DEFAULT 'Pending',
  `image_url` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  CONSTRAINT `maintenance_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `maintenance_requests`
--

LOCK TABLES `maintenance_requests` WRITE;
/*!40000 ALTER TABLE `maintenance_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `maintenance_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `move_out_requests`
--

DROP TABLE IF EXISTS `move_out_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `move_out_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `move_out_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `tenant_id` (`tenant_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `move_out_requests_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  CONSTRAINT `move_out_requests_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `move_out_requests`
--

LOCK TABLES `move_out_requests` WRITE;
/*!40000 ALTER TABLE `move_out_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `move_out_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcels`
--

DROP TABLE IF EXISTS `parcels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) DEFAULT NULL,
  `recipient_name` varchar(255) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `status` enum('Pending','Picked Up') DEFAULT 'Pending',
  `image_url` longtext DEFAULT NULL,
  `received_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `picked_up_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcels`
--

LOCK TABLES `parcels` WRITE;
/*!40000 ALTER TABLE `parcels` DISABLE KEYS */;
/*!40000 ALTER TABLE `parcels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) NOT NULL,
  `room_type` varchar(50) DEFAULT 'Standard',
  `price` decimal(10,2) NOT NULL,
  `status` enum('Available','Occupied','Maintenance') DEFAULT 'Available',
  `floor` int(11) DEFAULT 1,
  `tenant_id` int(11) DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `images` longtext DEFAULT NULL,
  `amenities` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `status` enum('Active','Inactive','MoveOut') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `room_id` (`room_id`),
  CONSTRAINT `tenants_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tenants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('owner','tenant','keeper','guest') NOT NULL DEFAULT 'guest',
  `sub_role` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `image_url` longtext DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'kritsakorn801@gmail.com','$2b$12$/u7iN5guW69eXG4R3OCLkufwL59myWHFWkvUioRAGFGAkNyFiHZgS','Owner','owner',NULL,NULL,NULL,NULL,1,'2026-06-24 03:25:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) DEFAULT NULL,
  `owner_name` varchar(255) DEFAULT NULL,
  `license_plate` varchar(50) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `vehicle_type` enum('Car','Motorcycle','Bicycle','Other') DEFAULT 'Car',
  `brand_model` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Current Database: `smartdomdb`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `smartdomdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;

USE `smartdomdb`;

--
-- Table structure for table `dormitory_packages`
--

DROP TABLE IF EXISTS `dormitory_packages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_packages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `max_rooms` int(11) NOT NULL,
  `max_dorms` int(11) DEFAULT 1,
  `features` longtext DEFAULT NULL,
  `duration_days` int(11) DEFAULT 30,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_packages`
--

LOCK TABLES `dormitory_packages` WRITE;
/*!40000 ALTER TABLE `dormitory_packages` DISABLE KEYS */;
INSERT INTO `dormitory_packages` VALUES (1,'Starter',0.00,10,1,'[\\\"จัดการได้สูงสุด 10 ห้อง\\\",\\\"ระบบจัดการผู้เช่าพื้นฐาน\\\",\\\"รายงานสรุปบิลประจำเดือน\\\"]',30),(2,'Professional',990.00,50,1,'[\\\"จัดการได้สูงสุด 50 ห้อง\\\",\\\"ระบบแจ้งซ่อมอัตโนมัติ\\\",\\\"ระบบบัญชีเต็มรูปแบบ\\\",\\\"Line Notification สำหรับผู้เช่า\\\"]',30),(3,'Enterprise',2490.00,999,10,'[\\\"ไม่จำกัดจำนวนห้อง\\\",\\\"ทุกฟีเจอร์จาก Pro\\\",\\\"ซัพพอร์ตระดับ VIP 24/7\\\",\\\"ระบบจองห้องออนไลน์ผ่านเว็บ (White Label)\\\"]',30);
/*!40000 ALTER TABLE `dormitory_packages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `dormitory_profile`
--

DROP TABLE IF EXISTS `dormitory_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `dormitory_profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `dormitory_profile`
--

LOCK TABLES `dormitory_profile` WRITE;
/*!40000 ALTER TABLE `dormitory_profile` DISABLE KEYS */;
INSERT INTO `dormitory_profile` VALUES (1,'SmartDom Grand Residence','99/1 ซอยอารีย์ ถนนพหลโยธิน แขวงสามเสนใน เขตพญาไท กรุงเทพฯ 10400','02-123-4567','0123456789012',1,'2026-06-24 02:46:55');
/*!40000 ALTER TABLE `dormitory_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `room_number` varchar(50) NOT NULL,
  `room_type` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `status` varchar(50) DEFAULT 'Available',
  `floor` int(11) DEFAULT 1,
  `image_url` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `dorm_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rooms`
--

LOCK TABLES `rooms` WRITE;
/*!40000 ALTER TABLE `rooms` DISABLE KEYS */;
INSERT INTO `rooms` VALUES (1,'101','Suite',9500.00,'Occupied',1,NULL,'2026-06-24 02:46:55',1),(2,'102','Suite',9500.00,'Occupied',1,NULL,'2026-06-24 02:46:55',1),(3,'103','Suite',9500.00,'Available',1,NULL,'2026-06-24 02:46:55',1),(4,'104','Standard',4500.00,'Available',1,NULL,'2026-06-24 02:46:55',1),(5,'105','Suite',9500.00,'Available',1,NULL,'2026-06-24 02:46:55',1),(6,'201','Standard',4500.00,'Occupied',2,NULL,'2026-06-24 02:46:55',1),(7,'202','Suite',9500.00,'Available',2,NULL,'2026-06-24 02:46:55',1),(8,'203','Standard',4500.00,'Available',2,NULL,'2026-06-24 02:46:55',1),(9,'204','Deluxe',6500.00,'Available',2,NULL,'2026-06-24 02:46:55',1),(10,'205','Deluxe',6500.00,'Available',2,NULL,'2026-06-24 02:46:55',1);
/*!40000 ALTER TABLE `rooms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) DEFAULT NULL,
  `package_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `start_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'สมชาย ใจดี','somchai@test.com','081-111-2222',1,'Active','2026-06-24 02:46:55',2),(2,'สมหญิง รักสะอาด','somying@test.com','086-333-4444',2,'Active','2026-06-24 02:46:55',3),(3,'มานี มานะ','manee@test.com','089-555-6666',6,'Active','2026-06-24 02:46:55',4);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'guest',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sub_role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'owner@smartdom.com','$2b$10$cNh5Z4j/T.wRr5PKWLUTyOFANFniNdEgZOPa9N0l3t3J5WSZGb5Hm','คุณกฤษฎา (เจ้าของหอพัก)','owner',1,NULL,'2026-06-24 02:46:55'),(2,'somchai@test.com','$2b$10$SbJcphhOS39NZMbLngCgh.8BzblV34sqrQz6Ad1QXW78Za7X78Wpu','สมชาย ใจดี','tenant',1,NULL,'2026-06-24 02:46:55'),(3,'somying@test.com','$2b$10$4.k/8imnYVshSgWx8ghJJuVWyhBk7ubb7wvfNWJpUSnbzXMsm5e7y','สมหญิง รักสะอาด','tenant',1,NULL,'2026-06-24 02:46:55'),(4,'manee@test.com','$2b$10$WWhqpRu53988Zmbgjc28GuVDrHiFAVZsT/yWvhlkFxoIb/wRbBZ9e','มานี มานะ','tenant',1,NULL,'2026-06-24 02:46:55'),(5,'kritsakorn801@gmail.com','$2b$12$pN7t.KX7IKCw.0bvknPT/OvfAWFvA.rhrIFAjRW.dpY.ybfuhRbcW','กฤษกร บัวอินทร์','owner',1,NULL,'2026-06-24 03:09:21');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-24 21:45:45
