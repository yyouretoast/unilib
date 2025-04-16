-- MySQL dump for improved library database

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = '+00:00';

--
-- Database: `library_db`
--

CREATE DATABASE IF NOT EXISTS `library_db`;
USE `library_db`;

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `user_id` INT AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'librarian', 'administrator') DEFAULT 'student',
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    `profile_image` VARCHAR(255) DEFAULT 'default-avatar.jpg',
    `bio` TEXT,
    PRIMARY KEY (`user_id`),
    UNIQUE KEY `username` (`username`),
    UNIQUE KEY `email` (`email`),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `members`
--

DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `student_id` varchar(50) UNIQUE,
  `phone` varchar(20),
  `address` varchar(255) DEFAULT NULL,
  `member_type` ENUM('student', 'faculty', 'staff') NOT NULL,
  `department` varchar(100),
  `max_books` int DEFAULT 5,
  `current_borrowed` int DEFAULT 0 CHECK (current_borrowed >= 0),
  `registration_date` timestamp NULL DEFAULT current_timestamp(),
  `last_updated` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`member_id`),
  FOREIGN KEY (`user_id`) REFERENCES users(`user_id`) ON DELETE CASCADE,
  INDEX idx_member_type (member_type),
  INDEX idx_department (department)
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
  `loan_status` enum('borrowed','returned','overdue','renewed') NOT NULL DEFAULT 'borrowed',
  `renewal_count` int DEFAULT 0 CHECK (renewal_count >= 0),
  `fine_amount` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`loan_id`),
  FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`),
  CONSTRAINT `chk_return_date` CHECK (return_date IS NULL OR return_date >= borrow_date),
  CONSTRAINT `chk_due_date` CHECK (due_date >= DATE(borrow_date)),
  INDEX idx_loan_status (loan_status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `book_reviews`
--

DROP TABLE IF EXISTS `book_reviews`;
CREATE TABLE `book_reviews` (
    `review_id` int(11) NOT NULL AUTO_INCREMENT,
    `book_id` int(11) NOT NULL,
    `user_id` int(11) NOT NULL,
    `rating` int CHECK (rating BETWEEN 1 AND 5),
    `review_text` TEXT,
    `review_date` timestamp DEFAULT CURRENT_TIMESTAMP,
    `likes_count` int DEFAULT 0,
    `is_verified` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`review_id`),
    FOREIGN KEY (`book_id`) REFERENCES books(`book_id`),
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`),
    UNIQUE KEY `unique_user_book_review` (`user_id`, `book_id`),
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
    `notification_sent` BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (`reservation_id`),
    FOREIGN KEY (`book_id`) REFERENCES books(`book_id`),
    FOREIGN KEY (`member_id`) REFERENCES members(`member_id`),
    INDEX idx_reservation_status (status),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
    `notification_id` INT AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('due_date', 'reservation', 'overdue', 'system') NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`notification_id`),
    FOREIGN KEY (`user_id`) REFERENCES users(`user_id`),
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Add sample data for testing
INSERT INTO books (title, author, isbn, publication_year, quantity, available_quantity, genre, description) 
VALUES 
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1925, 5, 3, 'Fiction', 'A story of decadence and excess...'),
('To Kill a Mockingbird', 'Harper Lee', '9780446310789', 1960, 4, 2, 'Fiction', 'The unforgettable novel of a childhood in a sleepy Southern town...'),
('1984', 'George Orwell', '9780451524935', 1949, 6, 4, 'Science Fiction', 'A dystopian social science fiction novel...');