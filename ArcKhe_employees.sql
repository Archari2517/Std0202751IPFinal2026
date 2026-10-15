-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2026 at 04:53 AM
-- Server version: 8.0.46-0ubuntu0.24.04.4
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ip_std6730202751`
--

-- --------------------------------------------------------

--
-- Table structure for table `ArcKhe_employees`
--

CREATE TABLE `ArcKhe_employees` (
  `ArcKhe_id` int NOT NULL,
  `ArcKhe_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ArcKhe_position` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ArcKhe_status` enum('Active','On Leave') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `ArcKhe_salary` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ArcKhe_employees`
--

INSERT INTO `ArcKhe_employees` (`ArcKhe_id`, `ArcKhe_name`, `ArcKhe_position`, `ArcKhe_status`, `ArcKhe_salary`) VALUES
(1, 'John Doe', 'Software Engineer', 'Active', 45000.00),
(2, 'Jane Smith', 'Product Manager', 'Active', 85000.00),
(3, 'Somchai Jaidee', 'Junior Developer', 'On Leave', 18500.00),
(4, 'Mali Rakdee', 'HR Officer', 'Active', 22000.00),
(5, 'Peter Chan', 'Senior Architect', 'On Leave', 95000.00),
(6, 'Nida Suksan', 'QA Engineer', 'Active', 40000.00),
(8, 'Archari Khemthong', 'Manager', 'Active', 35000.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ArcKhe_employees`
--
ALTER TABLE `ArcKhe_employees`
  ADD PRIMARY KEY (`ArcKhe_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ArcKhe_employees`
--
ALTER TABLE `ArcKhe_employees`
  MODIFY `ArcKhe_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
