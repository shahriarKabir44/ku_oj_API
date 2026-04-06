-- MySQL dump 10.13  Distrib 8.4.8, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ku_oj
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'd0f88dbf-216e-11f1-91de-9666ae9cc5b7:1-42';

--
-- Table structure for table `contest`
--

DROP TABLE IF EXISTS `contest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `startTime` double DEFAULT NULL,
  `endTime` double DEFAULT NULL,
  `hostId` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '0',
  `isPublished` int DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `fk_contest_hostId` (`hostId`),
  CONSTRAINT `fk_contest_hostId` FOREIGN KEY (`hostId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contestContributor`
--

DROP TABLE IF EXISTS `contestContributor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contestContributor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `contestId` int DEFAULT NULL,
  `contributorId` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '0',
  `createDate` datetime DEFAULT NULL,
  `updateDate` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_contestContributor_contestId` (`contestId`),
  CONSTRAINT `fk_contestContributor_contestId` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contestMessage`
--

DROP TABLE IF EXISTS `contestMessage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contestMessage` (
  `contestId` int DEFAULT NULL,
  `senderId` int DEFAULT NULL,
  `senderName` varchar(20) DEFAULT NULL,
  `message` mediumtext,
  `time` varchar(20) DEFAULT NULL,
  KEY `fk_contestMessage_contestId` (`contestId`),
  KEY `fk_contestMessage_senderId` (`senderId`),
  CONSTRAINT `fk_contestMessage_contestId` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `fk_contestMessage_senderId` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `description` mediumtext,
  `official_description` mediumtext,
  `official_points` int DEFAULT NULL,
  `officialVerdicts` mediumtext,
  `verdicts` mediumtext,
  `hasAttemptedOfficially` int DEFAULT NULL,
  `hasAttemptedUnofficially` int DEFAULT NULL,
  `unofficial_ac_time` mediumtext,
  `official_ac_time` mediumtext,
  `position` int DEFAULT NULL,
  KEY `fk_contestResult_contestId` (`contestId`),
  KEY `fk_contestResult_contestantId` (`contestantId`),
  CONSTRAINT `fk_contestResult_contestantId` FOREIGN KEY (`contestantId`) REFERENCES `user` (`id`),
  CONSTRAINT `fk_contestResult_contestId` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem`
--

DROP TABLE IF EXISTS `problem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `problem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `contestId` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `numSolutions` int DEFAULT '0',
  `code` varchar(255) DEFAULT NULL,
  `createdOn` mediumtext,
  `isAvailable` int DEFAULT '0',
  `createById` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_problem_contestId` (`contestId`),
  CONSTRAINT `fk_problem_contestId` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submission`
--

DROP TABLE IF EXISTS `submission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` double DEFAULT NULL,
  `verdict` varchar(50) DEFAULT NULL,
  `execTime` varchar(10) DEFAULT NULL,
  `language` varchar(10) DEFAULT NULL,
  `submissionFileURL` mediumtext,
  `problemId` int DEFAULT NULL,
  `submittedBy` int DEFAULT NULL,
  `contestId` int DEFAULT NULL,
  `errorMessage` mediumtext,
  `isOfficial` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_submission_contestId` (`contestId`),
  KEY `fk_submission_problemId` (`problemId`),
  KEY `fk_submission_submittedBy` (`submittedBy`),
  CONSTRAINT `fk_submission_contestId` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `fk_submission_problemId` FOREIGN KEY (`problemId`) REFERENCES `problem` (`id`),
  CONSTRAINT `fk_submission_submittedBy` FOREIGN KEY (`submittedBy`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'ku_oj'
--
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 21:08:23
