-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quanlytuyendung_nhom10
-- ------------------------------------------------------
-- Server version	8.0.36

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `candidate_profile`
--

DROP TABLE IF EXISTS `candidate_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidate_profile` (
  `candidate_profile_id` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `create_at` datetime(6) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `update_at` datetime(6) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`candidate_profile_id`),
  UNIQUE KEY `UKciga765pnjof5l5iefxdmlblg` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidate_profile`
--

LOCK TABLES `candidate_profile` WRITE;
/*!40000 ALTER TABLE `candidate_profile` DISABLE KEYS */;
/*!40000 ALTER TABLE `candidate_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company_profile`
--

DROP TABLE IF EXISTS `company_profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company_profile` (
  `company_profile_id` varchar(255) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `create_at` datetime(6) DEFAULT NULL,
  `desired_salary` double DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `tax` varchar(255) DEFAULT NULL,
  `update_at` datetime(6) DEFAULT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`company_profile_id`),
  UNIQUE KEY `UKa5n87kjh84kejyddq444pcm9g` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company_profile`
--

LOCK TABLES `company_profile` WRITE;
/*!40000 ALTER TABLE `company_profile` DISABLE KEYS */;
INSERT INTO `company_profile` VALUES ('c5e1760d-f633-4443-8256-d83f0d2df3ae','121 yen lang',NULL,'company10','2026-03-30 18:19:09.278016',NULL,'company10@ygmail.com',NULL,NULL,NULL,'2026-03-30 18:19:09.278016','e2e79c0d-86f8-4ca2-a477-dc66c5bd727d');
/*!40000 ALTER TABLE `company_profile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `industry`
--

DROP TABLE IF EXISTS `industry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `industry` (
  `industry_id` bigint NOT NULL AUTO_INCREMENT,
  `name_industry` varchar(255) NOT NULL,
  PRIMARY KEY (`industry_id`),
  UNIQUE KEY `UK317ln1kvr143acmms3n624vv4` (`name_industry`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `industry`
--

LOCK TABLES `industry` WRITE;
/*!40000 ALTER TABLE `industry` DISABLE KEYS */;
INSERT INTO `industry` VALUES (1,'Công nghệ thông tin'),(3,'Điện tử'),(2,'Tài chính ngân hàng');
/*!40000 ALTER TABLE `industry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_application`
--

DROP TABLE IF EXISTS `job_application`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_application` (
  `id` varchar(255) NOT NULL,
  `applied_at` datetime(6) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` enum('ACTIVE','APPLIED','CLOSED','EXPIRED','PENDING','REJECTED') DEFAULT NULL,
  `urlcv` varchar(255) DEFAULT NULL,
  `candidate_profile_id` varchar(255) DEFAULT NULL,
  `job_posting_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKfqt4fxra0ab9to9p9i345riqi` (`candidate_profile_id`),
  KEY `FKa9y14gfb3f86qg8ljwkfeeho5` (`job_posting_id`),
  CONSTRAINT `FKa9y14gfb3f86qg8ljwkfeeho5` FOREIGN KEY (`job_posting_id`) REFERENCES `job_posting` (`job_posting_id`),
  CONSTRAINT `FKfqt4fxra0ab9to9p9i345riqi` FOREIGN KEY (`candidate_profile_id`) REFERENCES `candidate_profile` (`candidate_profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_application`
--

LOCK TABLES `job_application` WRITE;
/*!40000 ALTER TABLE `job_application` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_application` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_locations`
--

DROP TABLE IF EXISTS `job_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_locations` (
  `job_posting_id` varchar(255) NOT NULL,
  `location_id` bigint NOT NULL,
  PRIMARY KEY (`job_posting_id`,`location_id`),
  KEY `FK5123wveg5xrq0s0fhh8j54oyc` (`location_id`),
  CONSTRAINT `FK5123wveg5xrq0s0fhh8j54oyc` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
  CONSTRAINT `FKpw040ie46uym750dm27xisolo` FOREIGN KEY (`job_posting_id`) REFERENCES `job_posting` (`job_posting_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_locations`
--

LOCK TABLES `job_locations` WRITE;
/*!40000 ALTER TABLE `job_locations` DISABLE KEYS */;
INSERT INTO `job_locations` VALUES ('2a573a5b-e541-4d27-8f1a-183d636a2397',1),('54da72b0-3b52-4647-8c63-e026fe347769',1),('5f096b65-6ea7-4d1b-a03d-10cb418e5d6e',1),('9c941cd1-28ad-4987-b8d3-932ab9044602',1),('9f93f279-6759-4e90-a239-a4b767a5c426',1),('f830a77d-5c56-4332-b077-62f468a40e6c',1),('2a573a5b-e541-4d27-8f1a-183d636a2397',3),('54da72b0-3b52-4647-8c63-e026fe347769',3),('5f096b65-6ea7-4d1b-a03d-10cb418e5d6e',3),('9c941cd1-28ad-4987-b8d3-932ab9044602',3),('9f93f279-6759-4e90-a239-a4b767a5c426',3),('f830a77d-5c56-4332-b077-62f468a40e6c',3);
/*!40000 ALTER TABLE `job_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_posting`
--

DROP TABLE IF EXISTS `job_posting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_posting` (
  `job_posting_id` varchar(255) NOT NULL,
  `deadline` date DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `salary_require` decimal(38,2) DEFAULT NULL,
  `status` enum('ACTIVE','CLOSED','EXPIRED','PENDING','REJECTED') DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `company_profile_id` varchar(255) DEFAULT NULL,
  `industry_id` bigint DEFAULT NULL,
  PRIMARY KEY (`job_posting_id`),
  KEY `FK1uwscco0da8oil6x8qfegsivg` (`company_profile_id`),
  KEY `FKn695craslau96w8mywyfx5cwm` (`industry_id`),
  CONSTRAINT `FK1uwscco0da8oil6x8qfegsivg` FOREIGN KEY (`company_profile_id`) REFERENCES `company_profile` (`company_profile_id`),
  CONSTRAINT `FKn695craslau96w8mywyfx5cwm` FOREIGN KEY (`industry_id`) REFERENCES `industry` (`industry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_posting`
--

LOCK TABLES `job_posting` WRITE;
/*!40000 ALTER TABLE `job_posting` DISABLE KEYS */;
INSERT INTO `job_posting` VALUES ('2a573a5b-e541-4d27-8f1a-183d636a2397','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',1),('54da72b0-3b52-4647-8c63-e026fe347769','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',1),('5f096b65-6ea7-4d1b-a03d-10cb418e5d6e','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',1),('9c941cd1-28ad-4987-b8d3-932ab9044602','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',1),('9f93f279-6759-4e90-a239-a4b767a5c426','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',1),('f830a77d-5c56-4332-b077-62f468a40e6c','2026-03-31','huu khang',30000000.00,'PENDING','Tuyển dụng IT','c5e1760d-f633-4443-8256-d83f0d2df3ae',NULL);
/*!40000 ALTER TABLE `job_posting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_skill`
--

DROP TABLE IF EXISTS `job_skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_skill` (
  `job_posting_id` varchar(255) NOT NULL,
  `skill_id` bigint NOT NULL,
  PRIMARY KEY (`job_posting_id`,`skill_id`),
  KEY `FKj33qbbf3vk1lvhqpcosnh54u1` (`skill_id`),
  CONSTRAINT `FKclxtg4ksw6mngmi6t36aodr21` FOREIGN KEY (`job_posting_id`) REFERENCES `job_posting` (`job_posting_id`),
  CONSTRAINT `FKj33qbbf3vk1lvhqpcosnh54u1` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_skill`
--

LOCK TABLES `job_skill` WRITE;
/*!40000 ALTER TABLE `job_skill` DISABLE KEYS */;
INSERT INTO `job_skill` VALUES ('2a573a5b-e541-4d27-8f1a-183d636a2397',1),('54da72b0-3b52-4647-8c63-e026fe347769',1),('5f096b65-6ea7-4d1b-a03d-10cb418e5d6e',1),('9c941cd1-28ad-4987-b8d3-932ab9044602',1),('9f93f279-6759-4e90-a239-a4b767a5c426',1),('f830a77d-5c56-4332-b077-62f468a40e6c',1),('2a573a5b-e541-4d27-8f1a-183d636a2397',2),('54da72b0-3b52-4647-8c63-e026fe347769',2),('5f096b65-6ea7-4d1b-a03d-10cb418e5d6e',2),('9c941cd1-28ad-4987-b8d3-932ab9044602',2),('9f93f279-6759-4e90-a239-a4b767a5c426',2),('f830a77d-5c56-4332-b077-62f468a40e6c',2);
/*!40000 ALTER TABLE `job_skill` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `city` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT INTO `location` VALUES (1,'Hồ Chí Minh'),(2,'Hà Nội'),(3,'Đà Nẵng');
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `description` text,
  `is_read` bit(1) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `receiver_id` varchar(255) DEFAULT NULL,
  `receiver_type` enum('CANDIDATE','COMPANY') NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` enum('APPLY_SUCCESS','JOB_APPROVED','JOB_REJECTED','MESSAGE','NEW_JOB_MATCH','SYSTEM') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skill`
--

DROP TABLE IF EXISTS `skill`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skill` (
  `skill_id` bigint NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(255) NOT NULL,
  `industry_id` bigint DEFAULT NULL,
  PRIMARY KEY (`skill_id`),
  UNIQUE KEY `UK1ledx6hfgc5c7ht0js8bmdqs0` (`skill_name`),
  KEY `FKifxp0vmhxth0yh6dtp65abquv` (`industry_id`),
  CONSTRAINT `FKifxp0vmhxth0yh6dtp65abquv` FOREIGN KEY (`industry_id`) REFERENCES `industry` (`industry_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skill`
--

LOCK TABLES `skill` WRITE;
/*!40000 ALTER TABLE `skill` DISABLE KEYS */;
INSERT INTO `skill` VALUES (1,'Java Developer',1),(2,'Frontend Developer',1),(3,'IC Design',2),(4,'Lập trình nhúng',2),(5,'Commercial Banking',3),(6,'Corporate Finance',3),(7,'DevOps',1);
/*!40000 ALTER TABLE `skill` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-31 13:06:24
