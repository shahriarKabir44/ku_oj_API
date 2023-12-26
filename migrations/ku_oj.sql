-- MySQL dump 10.13  Distrib 8.0.35, for Linux (x86_64)
--
-- Host: localhost    Database: ku_oj
-- ------------------------------------------------------
-- Server version	8.0.35

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

--
-- Table structure for table `contest`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `contest` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `startTime` double DEFAULT NULL,
  `endTime` double DEFAULT NULL,
  `hostId` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `title` (`title`),
  KEY `hostId` (`hostId`),
  CONSTRAINT `contest_ibfk_1` FOREIGN KEY (`hostId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contestMessage`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `contestMessage` (
  `contestId` int DEFAULT NULL,
  `senderId` int DEFAULT NULL,
  `senderName` varchar(20) DEFAULT NULL,
  `message` mediumtext,
  `time` varchar(20) DEFAULT NULL,
  KEY `contestId` (`contestId`),
  KEY `senderId` (`senderId`),
  CONSTRAINT `contestMessage_ibfk_1` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `contestMessage_ibfk_2` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`),
  CONSTRAINT `contestMessage_ibfk_3` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `contestMessage_ibfk_4` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contestResult`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `contestResult` (
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
  KEY `contestId` (`contestId`),
  KEY `contestantId` (`contestantId`),
  CONSTRAINT `contestResult_ibfk_1` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `contestResult_ibfk_2` FOREIGN KEY (`contestantId`) REFERENCES `user` (`id`),
  CONSTRAINT `contestResult_ibfk_3` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `contestResult_ibfk_4` FOREIGN KEY (`contestantId`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `problem`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `problem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `contestId` int DEFAULT NULL,
  `points` int DEFAULT NULL,
  `numSolutions` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `createdOn` mediumtext,
  PRIMARY KEY (`id`),
  KEY `contestId` (`contestId`),
  CONSTRAINT `problem_ibfk_1` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `problem_ibfk_2` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `submission`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `submission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` double DEFAULT NULL,
  `verdict` varchar(10) DEFAULT NULL,
  `execTime` varchar(10) DEFAULT NULL,
  `language` varchar(10) DEFAULT NULL,
  `submissionFileURL` mediumtext,
  `problemId` int DEFAULT NULL,
  `submittedBy` int DEFAULT NULL,
  `contestId` int DEFAULT NULL,
  `errorMessage` mediumtext,
  `isOfficial` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `problemId` (`problemId`),
  KEY `submittedBy` (`submittedBy`),
  KEY `contestId` (`contestId`),
  CONSTRAINT `submission_ibfk_1` FOREIGN KEY (`problemId`) REFERENCES `problem` (`id`),
  CONSTRAINT `submission_ibfk_2` FOREIGN KEY (`submittedBy`) REFERENCES `user` (`id`),
  CONSTRAINT `submission_ibfk_3` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`),
  CONSTRAINT `submission_ibfk_4` FOREIGN KEY (`problemId`) REFERENCES `problem` (`id`),
  CONSTRAINT `submission_ibfk_5` FOREIGN KEY (`submittedBy`) REFERENCES `user` (`id`),
  CONSTRAINT `submission_ibfk_6` FOREIGN KEY (`contestId`) REFERENCES `contest` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user`
--

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userName` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-12-26 19:34:16
