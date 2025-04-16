-- MySQL dump for improved library database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = '+00:00';

--
-- Database: `library_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

DROP TABLE IF EXISTS `books`;
CREATE TABLE `books` (
  `book_id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(20) NOT NULL,
  `publication_year` int(11) CHECK (publication_year <= YEAR(CURRENT_DATE)),
  `quantity` int(11) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  `available_quantity` int(11) NOT NULL DEFAULT 0 CHECK (available_quantity >= 0 AND available_quantity <= quantity),
  `date_added` timestamp NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `genre` varchar(100) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT 'default-book-cover.jpg',
  `description` TEXT,
  `language` varchar(50) DEFAULT 'English',
  `publisher` varchar(255),
  `page_count` int,
  `rating` DECIMAL(3,2) DEFAULT 0.00,
  PRIMARY KEY (`book_id`),
  UNIQUE KEY `isbn` (`isbn`),
  INDEX idx_genre (genre),
  INDEX idx_author (author),
  INDEX idx_publication_year (publication_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE,
  `phone` varchar(20),
  `address` varchar(255) DEFAULT NULL,
  `student_id` varchar(50) UNIQUE,
  `member_type` ENUM('student', 'faculty', 'staff') NOT NULL,
  `status` ENUM('active', 'suspended', 'expired') DEFAULT 'active',
  `registration_date` timestamp NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`member_id`),
  INDEX idx_member_type (member_type),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
CREATE TABLE `loans` (
  `loan_id` int(11) NOT NULL AUTO_INCREMENT,
  `book_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `borrow_date` timestamp NULL DEFAULT current_timestamp(),
  `due_date` date NOT NULL,
  `return_date` timestamp NULL DEFAULT NULL,
  `loan_status` enum('borrowed','returned','overdue') NOT NULL DEFAULT 'borrowed',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`loan_id`),
  KEY `fk_loan_book_idx` (`book_id`),
  KEY `fk_loan_member_idx` (`member_id`),
  CONSTRAINT `fk_loan_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  CONSTRAINT `fk_loan_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`),
  CONSTRAINT `chk_return_date` CHECK (return_date IS NULL OR return_date >= borrow_date),
  CONSTRAINT `chk_due_date` CHECK (due_date >= DATE(borrow_date))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `book_reviews`
--

DROP TABLE IF EXISTS `book_reviews`;
CREATE TABLE `book_reviews` (
    `review_id` int(11) NOT NULL AUTO_INCREMENT,
    `book_id` int(11) NOT NULL,
    `member_id` int(11) NOT NULL,
    `rating` int CHECK (rating BETWEEN 1 AND 5),
    `review_text` TEXT,
    `review_date` timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`review_id`),
    FOREIGN KEY (`book_id`) REFERENCES books(`book_id`),
    FOREIGN KEY (`member_id`) REFERENCES members(`member_id`),
    INDEX idx_book_rating (book_id, rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
    `reservation_id` int(11) NOT NULL AUTO_INCREMENT,
    `book_id` int(11) NOT NULL,
    `member_id` int(11) NOT NULL,
    `reservation_date` timestamp DEFAULT CURRENT_TIMESTAMP,
    `expiry_date` timestamp,
    `status` ENUM('pending', 'fulfilled', 'expired', 'cancelled') DEFAULT 'pending',
    PRIMARY KEY (`reservation_id`),
    FOREIGN KEY (`book_id`) REFERENCES books(`book_id`),
    FOREIGN KEY (`member_id`) REFERENCES members(`member_id`),
    INDEX idx_reservation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) UNIQUE,
  `role` enum('librarian','administrator') NOT NULL DEFAULT 'librarian',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;