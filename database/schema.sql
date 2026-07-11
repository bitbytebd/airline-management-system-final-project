-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: airway
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `aircrafts`
--

DROP TABLE IF EXISTS `aircrafts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aircrafts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity` int DEFAULT NULL,
  `model_name` varchar(255) DEFAULT NULL,
  `registration_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `aircraft_code` varchar(255) DEFAULT NULL,
  `aircraft_name` varchar(255) DEFAULT NULL,
  `aircraft_type` varchar(255) DEFAULT NULL,
  `cabin_classes` varchar(255) DEFAULT NULL,
  `cruise_speed_kmh` int DEFAULT NULL,
  `image_url` varchar(1000) DEFAULT NULL,
  `manufacturer` varchar(255) DEFAULT NULL,
  `range_km` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKg57r2d6v448ou3ve3ou3e3vl9` (`registration_number`),
  UNIQUE KEY `UK8si0l3ymr3vl1t2nd9u85poqp` (`aircraft_code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `airlines`
--

DROP TABLE IF EXISTS `airlines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `airlines` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `airline_code` varchar(255) DEFAULT NULL,
  `airline_name` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `alliance` varchar(255) DEFAULT NULL,
  `fleet_size` int DEFAULT NULL,
  `headquarters` varchar(255) DEFAULT NULL,
  `iata_prefix` varchar(255) DEFAULT NULL,
  `logo_url` varchar(1000) DEFAULT NULL,
  `primary_hub` varchar(255) DEFAULT NULL,
  `support_email` varchar(255) DEFAULT NULL,
  `support_phone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpi61dtw46fa21b67vmlr2s2wc` (`airline_code`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `app_users`
--

DROP TABLE IF EXISTS `app_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `app_users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `employee_code` varchar(255) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `last_login_at` datetime(6) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `station` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `profile_image_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4vj92ux8a2eehds1mdvmks473` (`email`),
  UNIQUE KEY `UKe3h5swllyyqiaoasybuevydtj` (`employee_code`),
  UNIQUE KEY `UKspsnwr241e9k9c8p5xl4k45ih` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `baggage_support_cases`
--

DROP TABLE IF EXISTS `baggage_support_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `baggage_support_cases` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `allowance_kg` double DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `cabin_weight_kg` double DEFAULT NULL,
  `case_reference` varchar(255) DEFAULT NULL,
  `checked_bags` int DEFAULT NULL,
  `checked_weight_kg` double DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `estimated_fee` double DEFAULT NULL,
  `excess_kg` double DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `issue_type` varchar(255) DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `passenger_email` varchar(255) DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK8vs90mpabanrv1jmcqead86jy` (`case_reference`),
  KEY `idx_baggage_booking_ref` (`booking_reference`),
  KEY `idx_baggage_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `boarding_pass_records`
--

DROP TABLE IF EXISTS `boarding_pass_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boarding_pass_records` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `boarding_time` varchar(255) DEFAULT NULL,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `class_type` varchar(255) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `departure_time` varchar(255) DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `gate` varchar(255) DEFAULT NULL,
  `issued_at` datetime(6) DEFAULT NULL,
  `pass_reference` varchar(255) DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `seat_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `zone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK5bogqdrrrgy63jxrqh4tf2sdr` (`pass_reference`),
  KEY `idx_boarding_booking_ref` (`booking_reference`),
  KEY `idx_boarding_flight` (`flight_number`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `arrival_time` varchar(255) DEFAULT NULL,
  `base_fare` double DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `class_type` varchar(255) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `departure_time` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `discount` double DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `flight_id` bigint DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `passenger_id` bigint DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `passport_number` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `seat_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `tax` double DEFAULT NULL,
  `total_distance` double DEFAULT NULL,
  `total_price` double DEFAULT NULL,
  `coupon_code` varchar(255) DEFAULT NULL,
  `coupon_discount` double DEFAULT NULL,
  `loyalty_discount` double DEFAULT NULL,
  `loyalty_member_number` varchar(255) DEFAULT NULL,
  `loyalty_points_used` int DEFAULT NULL,
  `adult_count` int DEFAULT NULL,
  `adult_fare_total` double DEFAULT NULL,
  `baggage_fee` double DEFAULT NULL,
  `cabin_weight_kg` double DEFAULT NULL,
  `checked_bags` int DEFAULT NULL,
  `checked_weight_kg` double DEFAULT NULL,
  `child_count` int DEFAULT NULL,
  `child_fare_total` double DEFAULT NULL,
  `grand_total` double DEFAULT NULL,
  `infant_count` int DEFAULT NULL,
  `infant_fare_total` double DEFAULT NULL,
  `passenger_fare_total` double DEFAULT NULL,
  `return_date` date DEFAULT NULL,
  `special_service_fee` double DEFAULT NULL,
  `special_service_notes` varchar(255) DEFAULT NULL,
  `special_services` varchar(255) DEFAULT NULL,
  `sub_total_before_discount` double DEFAULT NULL,
  `trip_type` varchar(255) DEFAULT NULL,
  `extra_passenger_names` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKe92mgyq35mdeo8gc1un2o6uk0` (`booking_reference`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `applicable_cabin` varchar(255) DEFAULT NULL,
  `applicable_route` varchar(255) DEFAULT NULL,
  `code` varchar(40) NOT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `discount_type` enum('FIXED_AMOUNT','PERCENTAGE') NOT NULL,
  `discount_value` double NOT NULL,
  `maximum_discount_amount` double DEFAULT NULL,
  `minimum_booking_amount` double DEFAULT NULL,
  `status` enum('ACTIVE','EXPIRED','INACTIVE') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `usage_limit` int DEFAULT NULL,
  `used_count` int DEFAULT NULL,
  `valid_from` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeplt0kkm9yf2of2lnx6c1oy9b` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `expense_date` date DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `reference_no` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `vendor_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `flight_status_log`
--

DROP TABLE IF EXISTS `flight_status_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flight_status_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `actual_arrival` datetime(6) DEFAULT NULL,
  `actual_departure` datetime(6) DEFAULT NULL,
  `altitude_ft` int DEFAULT NULL,
  `arrival_gate` varchar(255) DEFAULT NULL,
  `current_latitude` double DEFAULT NULL,
  `current_longitude` double DEFAULT NULL,
  `delay_minutes` int DEFAULT NULL,
  `delay_reason` varchar(255) DEFAULT NULL,
  `departure_gate` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `estimated_arrival` datetime(6) DEFAULT NULL,
  `flight_id` bigint NOT NULL,
  `flight_number` varchar(255) NOT NULL,
  `flight_status` enum('APPROACHING','ARRIVED','BOARDING','CANCELLED','DELAYED','DEPARTED','DIVERTED','EN_ROUTE','GATE_HOLD','LANDED','SCHEDULED') NOT NULL,
  `logged_at` datetime(6) NOT NULL,
  `logged_by` varchar(255) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `progress_percent` int DEFAULT NULL,
  `scheduled_arrival` datetime(6) DEFAULT NULL,
  `scheduled_departure` datetime(6) DEFAULT NULL,
  `speed_kmh` int DEFAULT NULL,
  `terminal` varchar(255) DEFAULT NULL,
  `aircraft_icao` varchar(255) DEFAULT NULL,
  `aircraft_registration` varchar(255) DEFAULT NULL,
  `distance_remaining_km` double DEFAULT NULL,
  `estimated_landing_minutes` int DEFAULT NULL,
  `heading_degree` int DEFAULT NULL,
  `last_gps_updated_at` datetime(6) DEFAULT NULL,
  `tracking_source` varchar(255) DEFAULT NULL,
  `destination_latitude` double DEFAULT NULL,
  `destination_longitude` double DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `last_tracked_at` datetime(6) DEFAULT NULL,
  `origin_latitude` double DEFAULT NULL,
  `origin_longitude` double DEFAULT NULL,
  `remaining_distance_km` double DEFAULT NULL,
  `tracking_mode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_fsl_flight_id` (`flight_id`),
  KEY `idx_fsl_status` (`flight_status`),
  KEY `idx_fsl_logged_at` (`logged_at`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `flights`
--

DROP TABLE IF EXISTS `flights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flights` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `arrival_date` date DEFAULT NULL,
  `arrival_time` time DEFAULT NULL,
  `base_price` double DEFAULT NULL,
  `business_price` double DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `departure_time` time DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `distance` double DEFAULT NULL,
  `economy_price` double DEFAULT NULL,
  `first_class_price` double DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `premium_price` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `total_seats` int DEFAULT NULL,
  `aircraft_icao` varchar(255) DEFAULT NULL,
  `aircraft_registration` varchar(255) DEFAULT NULL,
  `altitude_ft` int DEFAULT NULL,
  `current_latitude` double DEFAULT NULL,
  `current_longitude` double DEFAULT NULL,
  `destination_latitude` double DEFAULT NULL,
  `destination_longitude` double DEFAULT NULL,
  `estimated_landing_minutes` int DEFAULT NULL,
  `heading_degree` int DEFAULT NULL,
  `last_tracked_at` datetime(6) DEFAULT NULL,
  `origin_latitude` double DEFAULT NULL,
  `origin_longitude` double DEFAULT NULL,
  `progress_percent` int DEFAULT NULL,
  `speed_kmh` int DEFAULT NULL,
  `tracking_mode` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6bx3i9v6ikjiy0ru5ybor8t7` (`flight_number`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `loyalty_accounts`
--

DROP TABLE IF EXISTS `loyalty_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_accounts` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `available_points` int DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `enrolled_date` datetime(6) NOT NULL,
  `expiring_points` int DEFAULT NULL,
  `is_active` bit(1) NOT NULL,
  `last_activity_date` datetime(6) DEFAULT NULL,
  `last_flight_number` varchar(20) DEFAULT NULL,
  `member_number` varchar(20) NOT NULL,
  `passenger_email` varchar(150) DEFAULT NULL,
  `passenger_id` bigint NOT NULL,
  `passenger_name` varchar(150) NOT NULL,
  `passport_number` varchar(30) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `points_expiry_date` datetime(6) DEFAULT NULL,
  `tier` enum('BRONZE','GOLD','PLATINUM','SILVER') NOT NULL,
  `tier_expiry_date` datetime(6) DEFAULT NULL,
  `tier_qualifying_points` int DEFAULT NULL,
  `total_flights_taken` int DEFAULT NULL,
  `total_miles_flown` double DEFAULT NULL,
  `total_points_earned` int DEFAULT NULL,
  `total_points_redeemed` int DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm47m1aotvpxknvqpg8xsg7sko` (`member_number`),
  UNIQUE KEY `UK3hfulskop1xwkr65k3u53nau` (`passenger_id`),
  KEY `idx_la_passenger_id` (`passenger_id`),
  KEY `idx_la_member_number` (`member_number`),
  KEY `idx_la_tier` (`tier`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `loyalty_transactions`
--

DROP TABLE IF EXISTS `loyalty_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loyalty_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_id` bigint NOT NULL,
  `balance_after` int NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(20) DEFAULT NULL,
  `class_type` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(60) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `distance_km` double DEFAULT NULL,
  `flight_number` varchar(20) DEFAULT NULL,
  `flight_route` varchar(120) DEFAULT NULL,
  `member_number` varchar(20) DEFAULT NULL,
  `passenger_id` bigint NOT NULL,
  `passenger_name` varchar(150) DEFAULT NULL,
  `points_amount` int NOT NULL,
  `redemption_reference` varchar(30) DEFAULT NULL,
  `redemption_value` double DEFAULT NULL,
  `tier_multiplier` double DEFAULT NULL,
  `transaction_type` enum('ADJUSTED','BONUS','EARNED','EXPIRED','REDEEMED','TIER_BONUS') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lt_account_id` (`account_id`),
  KEY `idx_lt_passenger_id` (`passenger_id`),
  KEY `idx_lt_type` (`transaction_type`),
  KEY `idx_lt_created_at` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `passengers`
--

DROP TABLE IF EXISTS `passengers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `passengers` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `date_of_birth` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `frequent_flyer_no` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `meal_preference` varchar(255) DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `passport_number` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKejvp8b3th7f5uqyn8gyckhbqi` (`passport_number`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_number` varchar(30) DEFAULT NULL,
  `bank_name` varchar(80) DEFAULT NULL,
  `base_fare` double NOT NULL,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(25) DEFAULT NULL,
  `card_brand` varchar(20) DEFAULT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  `coupon_code` varchar(30) DEFAULT NULL,
  `coupon_discount` double DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `created_by` varchar(80) DEFAULT NULL,
  `currency` varchar(5) DEFAULT NULL,
  `discount_amount` double DEFAULT NULL,
  `failure_reason` varchar(300) DEFAULT NULL,
  `flight_number` varchar(20) DEFAULT NULL,
  `flight_route` varchar(120) DEFAULT NULL,
  `gateway_message` varchar(200) DEFAULT NULL,
  `gateway_name` varchar(50) DEFAULT NULL,
  `gateway_response_code` varchar(10) DEFAULT NULL,
  `initiated_at` datetime(6) DEFAULT NULL,
  `loyalty_discount` double DEFAULT NULL,
  `loyalty_points_used` int DEFAULT NULL,
  `mobile_number` varchar(20) DEFAULT NULL,
  `notes` varchar(400) DEFAULT NULL,
  `passenger_email` varchar(150) DEFAULT NULL,
  `passenger_id` bigint DEFAULT NULL,
  `passenger_name` varchar(150) DEFAULT NULL,
  `payment_method` enum('BANK_TRANSFER','BKASH','CASH','CREDIT_CARD','DEBIT_CARD','LOYALTY_POINTS','NAGAD','ONLINE_PAYMENT','ROCKET') NOT NULL,
  `payment_reference` varchar(25) NOT NULL,
  `retry_count` int DEFAULT NULL,
  `status` enum('CANCELLED','COMPLETED','FAILED','PARTIAL','PENDING','PROCESSING','REFUNDED') NOT NULL,
  `tax_amount` double DEFAULT NULL,
  `total_amount` double NOT NULL,
  `transaction_reference` varchar(60) DEFAULT NULL,
  `amount` double DEFAULT NULL,
  `expense_id` bigint DEFAULT NULL,
  `expense_reference` varchar(50) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_purpose` enum('BOOKING_PAYMENT','EXPENSE_PAYMENT') DEFAULT NULL,
  `payment_status` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK4jacl30fsqtdp5mhmg5wnvn7q` (`payment_reference`),
  UNIQUE KEY `UKrwn36natqiwaseu5c3jvaun3` (`transaction_reference`),
  KEY `idx_pay_booking_id` (`booking_id`),
  KEY `idx_pay_status` (`status`),
  KEY `idx_pay_method` (`payment_method`),
  KEY `idx_pay_transaction_ref` (`transaction_reference`),
  KEY `idx_pay_created_at` (`created_at`),
  KEY `idx_pay_expense_id` (`expense_id`),
  KEY `idx_pay_purpose` (`payment_purpose`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `refunds`
--

DROP TABLE IF EXISTS `refunds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refunds` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint NOT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `class_type` varchar(255) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `flight_route` varchar(255) DEFAULT NULL,
  `original_amount` double DEFAULT NULL,
  `passenger_email` varchar(255) DEFAULT NULL,
  `passenger_id` bigint DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `penalty_amount` double DEFAULT NULL,
  `penalty_percentage` double DEFAULT NULL,
  `processed_at` datetime(6) DEFAULT NULL,
  `processed_by` varchar(255) DEFAULT NULL,
  `reason_notes` varchar(255) DEFAULT NULL,
  `refund_amount` double DEFAULT NULL,
  `refund_reason` enum('DUPLICATE_BOOKING','FLIGHT_CANCEL','FLIGHT_DELAY','MEDICAL','OTHER','OVERBOOKING','PASSENGER_CANCEL','WEATHER') DEFAULT NULL,
  `refund_reference` varchar(255) DEFAULT NULL,
  `requested_at` datetime(6) DEFAULT NULL,
  `status` enum('APPROVED','PENDING','PROCESSED','REJECTED') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2irx02s3tuilqcgvcvemmd04l` (`refund_reference`),
  KEY `idx_refund_booking_id` (`booking_id`),
  KEY `idx_refund_status` (`status`),
  KEY `idx_refund_requested_at` (`requested_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `special_assistance_requests`
--

DROP TABLE IF EXISTS `special_assistance_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `special_assistance_requests` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `contact_preference` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `passenger_email` varchar(255) DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `passenger_phone` varchar(255) DEFAULT NULL,
  `priority` varchar(255) DEFAULT NULL,
  `request_reference` varchar(255) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `services` varchar(600) DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgc34aatpsaj6ijmilqj75ctyx` (`request_reference`),
  KEY `idx_assistance_booking_ref` (`booking_reference`),
  KEY `idx_assistance_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--


--
-- Table structure for table `waitlist_entries`
--

DROP TABLE IF EXISTS `waitlist_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waitlist_entries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booking_id` bigint DEFAULT NULL,
  `booking_reference` varchar(255) DEFAULT NULL,
  `class_type` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `currency` varchar(3) DEFAULT NULL,
  `departure_date` date DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `expires_at` datetime(6) DEFAULT NULL,
  `fare_offer` double DEFAULT NULL,
  `flight_id` bigint DEFAULT NULL,
  `flight_number` varchar(255) DEFAULT NULL,
  `last_notified_at` datetime(6) DEFAULT NULL,
  `loyalty_tier` varchar(255) DEFAULT NULL,
  `notes` varchar(600) DEFAULT NULL,
  `notification_channel` varchar(255) DEFAULT NULL,
  `origin` varchar(255) DEFAULT NULL,
  `passenger_email` varchar(255) DEFAULT NULL,
  `passenger_id` bigint DEFAULT NULL,
  `passenger_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `priority_score` int DEFAULT NULL,
  `requested_seats` int DEFAULT NULL,
  `status` enum('CANCELLED','CONFIRMED','EXPIRED','NOTIFIED','PRIORITY','WAITING') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `waitlist_reference` varchar(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKeyp6k9f9r450nlsoyubij457o` (`waitlist_reference`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-11 15:11:47
