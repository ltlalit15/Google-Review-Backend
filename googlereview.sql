-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 31, 2025 at 07:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `googlereview`
--

-- --------------------------------------------------------

--
-- Table structure for table `banner`
--

CREATE TABLE `banner` (
  `id` int(255) NOT NULL,
  `user_id` int(255) NOT NULL,
  `qr_code_id` int(255) DEFAULT NULL,
  `image` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id` int(255) NOT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `business_type` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `image` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id`, `business_name`, `business_type`, `first_name`, `last_name`, `location`, `email`, `password`, `image`) VALUES
(1, 'kiaan technology', '', 'Jhon', 'doe', 'indore mp', 'ktech@gmail.com', '$2a$10$IAbKQeuZMSMLEvkfHN3T..XrVLmT/xJXG4hL5l9vcJADOMb8CiRgC', ''),
(2, '56 dukan', NULL, 'jhon', 'doe', 'indore mp', 'jhon@gmail.com', '$2b$10$KjkcVtvUK0a54UeVLuSGiuLStNdZC6/H093flcspHYdSJmaOw56zC', '');

-- --------------------------------------------------------

--
-- Table structure for table `enquiry`
--

CREATE TABLE `enquiry` (
  `id` int(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `contact` varchar(255) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `enquiry`
--

INSERT INTO `enquiry` (`id`, `full_name`, `email`, `phone`, `contact`, `notes`, `created_at`) VALUES
(1, 'Amit Verma', 'amit.verma@example.in', '+919876543210', 'phone', 'Birthday celebration, corner table preferred', '2025-05-30 11:07:08');

-- --------------------------------------------------------

--
-- Table structure for table `google_business`
--

CREATE TABLE `google_business` (
  `id` int(11) NOT NULL,
  `google_business_id` varchar(255) NOT NULL,
  `qr_code_url` text DEFAULT NULL,
  `banner_url` text NOT NULL,
  `created` datetime DEFAULT current_timestamp(),
  `updated` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` int(11) NOT NULL,
  `group_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `groups`
--

INSERT INTO `groups` (`id`, `group_name`, `description`) VALUES
(2, 'admin', 'Can manage users and settings but with limited access compared to superadmin.'),
(3, 'company', 'Represents a company-level group with access to relevant modules.');

-- --------------------------------------------------------

--
-- Table structure for table `plans`
--

CREATE TABLE `plans` (
  `id` int(11) NOT NULL,
  `plan_name` varchar(100) NOT NULL,
  `month_duration` int(11) NOT NULL,
  `num_establishments` int(11) DEFAULT 1,
  `free_trial_days` int(11) DEFAULT 0,
  `plan_details` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `order_id` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `plans`
--

INSERT INTO `plans` (`id`, `plan_name`, `month_duration`, `num_establishments`, `free_trial_days`, `plan_details`, `price`, `created_at`, `updated_at`, `order_id`) VALUES
(6, 'Basic Plan', 3, 5, 10, 'Basic features with moderate limits', 199.99, '2025-04-08 07:24:01', '2025-04-10 08:26:40', '6D88E6900947636DBAE2778E'),
(7, 'Growth Plan', 9, 20, 14, 'Designed for growing businesses with extra flexibility', 799.00, '2025-04-08 07:24:21', '2025-04-08 11:01:47', '98720869A3F62490190DD986'),
(8, 'Pro Plan', 6, 10, 14, 'Includes everything in the basic plan plus analytics', 499.99, '2025-04-08 07:24:41', '2025-04-08 07:24:41', '35FF8189E88E068D00E4589B');

-- --------------------------------------------------------

--
-- Table structure for table `qr_code`
--

CREATE TABLE `qr_code` (
  `id` int(255) NOT NULL,
  `user_id` int(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `headline` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `footer` varchar(255) NOT NULL,
  `size` varchar(255) NOT NULL,
  `qr_color` varchar(255) NOT NULL,
  `offer` varchar(500) NOT NULL,
  `place_id` varchar(255) NOT NULL,
  `image` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review`
--

CREATE TABLE `review` (
  `id` int(255) NOT NULL,
  `user_id` int(255) DEFAULT NULL,
  `qr_code_id` int(255) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `feedback` varchar(500) DEFAULT NULL,
  `rating` varchar(500) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `review_customization`
--

CREATE TABLE `review_customization` (
  `id` int(255) NOT NULL,
  `rating_count` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `review_customization`
--

INSERT INTO `review_customization` (`id`, `rating_count`, `created_at`) VALUES
(1, '4', '2025-04-23 10:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `group_id` varchar(15) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT '0',
  `image` varchar(500) NOT NULL,
  `googleBusinessProfile` varchar(500) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `group_id`, `status`, `image`, `googleBusinessProfile`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@gmail.com', '$2b$10$3Jva2xqKcxzOsb3r.q7A1.9KKuAit48HPrBIX4MULXyVFZp9UE1vG', '0000000000', '2', '1', 'https://res.cloudinary.com/du4xmywbv/image/upload/v1745059273/dfc4fed9-6860-4843-86d3-465f452960bd_j9icd0.jpg', '', '2025-04-22 07:03:03', '2025-04-23 06:17:41');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `enquiry`
--
ALTER TABLE `enquiry`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `google_business`
--
ALTER TABLE `google_business`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `plans`
--
ALTER TABLE `plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`);

--
-- Indexes for table `qr_code`
--
ALTER TABLE `qr_code`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `review_customization`
--
ALTER TABLE `review_customization`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `banner`
--
ALTER TABLE `banner`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `enquiry`
--
ALTER TABLE `enquiry`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `google_business`
--
ALTER TABLE `google_business`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `plans`
--
ALTER TABLE `plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `qr_code`
--
ALTER TABLE `qr_code`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review`
--
ALTER TABLE `review`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `review_customization`
--
ALTER TABLE `review_customization`
  MODIFY `id` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
