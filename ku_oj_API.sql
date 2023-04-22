CREATE DATABASE  IF NOT EXISTS `ku_oj` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ku_oj`;
-- MySQL dump 10.13  Distrib 8.0.33, for Linux (x86_64)
--
-- Host: localhost    Database: ku_oj
-- ------------------------------------------------------
-- Server version	8.0.33

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
-- Table structure for table `contest`
--

DROP TABLE IF EXISTS `contest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `title` varchar(255) NOT NULL,
  `startTime` double NOT NULL,
  `endTime` double DEFAULT NULL,
  `hostId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hostId` (`hostId`),
  CONSTRAINT `contest_ibfk_1` FOREIGN KEY (`hostId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contestResult`
--

DROP TABLE IF EXISTS `contestResult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contestResult` (
  `contestId` int DEFAULT NULL,
  `contestantId` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `submissionDetails` varchar(255) DEFAULT '""',
  PRIMARY KEY (`id`),
  KEY `contestId` (`contestId`),
  KEY `contestantId` (`contestantId`),
  CONSTRAINT `contestResult_ibfk_1` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `contestResult_ibfk_2` FOREIGN KEY (`contestantId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem`
--

DROP TABLE IF EXISTS `problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `statementFileURL` text,
  `contestId` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `point` int NOT NULL DEFAULT '1',
  `testcaseFileURL` text,
  `outputFileURL` text,
  `numSolutions` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `contestId` (`contestId`),
  CONSTRAINT `problem_ibfk_1` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `registration`
--

DROP TABLE IF EXISTS `registration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registration` (
  `userId` int DEFAULT NULL,
  `contestId` int NOT NULL,
  KEY `userId` (`userId`),
  KEY `contestId` (`contestId`),
  CONSTRAINT `registration_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`),
  CONSTRAINT `registration_ibfk_2` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submission`
--

DROP TABLE IF EXISTS `submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `time` double NOT NULL,
  `verdict` varchar(10) DEFAULT NULL,
  `execTime` varchar(5) DEFAULT NULL,
  `language` varchar(20) NOT NULL,
  `submissionFileURL` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `problemId` int NOT NULL,
  `submittedBy` int NOT NULL,
  `score` int DEFAULT NULL,
  `contestId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `problemId` (`problemId`),
  KEY `submittedBy` (`submittedBy`),
  KEY `contestId` (`contestId`),
  CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`problemId`) REFERENCES `problem` (`id`),
  CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`submittedBy`) REFERENCES `user` (`id`),
  CONSTRAINT `submission_ibfk_3` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submissionResult`
--

DROP TABLE IF EXISTS `submissionResult`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissionResult` (
  `point` int DEFAULT '0',
  `contestResutId` int DEFAULT NULL,
  `probemId` int DEFAULT NULL,
  KEY `contestResutId` (`contestResutId`),
  KEY `probemId` (`probemId`),
  CONSTRAINT `submissionResult_ibfk_1` FOREIGN KEY (`contestResutId`) REFERENCES `contestResult` (`id`),
  CONSTRAINT `submissionResult_ibfk_2` FOREIGN KEY (`probemId`) REFERENCES `problem` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Primary Key',
  `userName` varchar(20) NOT NULL,
  `password` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-04-22 21:13:42
