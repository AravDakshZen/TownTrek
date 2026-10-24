-- ====================================================================
-- TOWNTREK DISTRICT CONSOLE APPLICATION - COMPLETE DATABASE SCHEMA
-- ====================================================================


CREATE DATABASE IF NOT EXISTS movie_booking_db;
USE movie_booking_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_salt VARCHAR(64) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. THEATRES TABLE
CREATE TABLE IF NOT EXISTS theatres (
    theatre_id INT AUTO_INCREMENT PRIMARY KEY,
    theatre_name VARCHAR(120) NOT NULL,
    location VARCHAR(150) NOT NULL,
    total_screens INT DEFAULT 4
);

-- 3. MOVIES TABLE
CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_name VARCHAR(150) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL,
    language VARCHAR(50) NOT NULL
);

-- 4. SHOWS TABLE
CREATE TABLE IF NOT EXISTS shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    theatre_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE
);

-- 5. SEATS TABLE
CREATE TABLE IF NOT EXISTS seats (
    seat_id INT AUTO_INCREMENT PRIMARY KEY,
    show_id INT NOT NULL,
    seat_code VARCHAR(5) NOT NULL,
    seat_type ENUM('REGULAR', 'PREMIUM', 'VIP') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    seat_status ENUM('AVAILABLE', 'BOOKED') DEFAULT 'AVAILABLE',
    FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE,
    UNIQUE (show_id, seat_code)
);

-- 6. MOVIE BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    movie_id INT NOT NULL,
    show_id INT NOT NULL,
    seat_codes VARCHAR(100) NOT NULL,
    coupon_code VARCHAR(30),
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (show_id) REFERENCES shows(show_id) ON DELETE CASCADE
);

-- 7. PARTIES & CONCERTS TABLE
CREATE TABLE IF NOT EXISTS parties_concerts (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category ENUM('CONCERT', 'CLUB_PARTY', 'COMEDY_NIGHT') NOT NULL,
    artist_performer VARCHAR(120) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    total_capacity INT NOT NULL,
    available_slots INT NOT NULL,
    description TEXT
);

-- 8. PARTY & CONCERT BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS party_bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    event_id INT NOT NULL,
    tickets_count INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    booking_status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES parties_concerts(event_id) ON DELETE CASCADE
);

-- 9. DISTRICT EVENTS & WORKSHOPS TABLE
CREATE TABLE IF NOT EXISTS district_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category ENUM('WORKSHOP', 'FOOD_FEST', 'SPORTS', 'CULTURAL') NOT NULL,
    venue VARCHAR(150) NOT NULL,
    location VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_capacity INT NOT NULL,
    registered_count INT NOT NULL DEFAULT 0,
    description TEXT
);

-- 10. DISTRICT EVENT REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS event_registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    event_id INT NOT NULL,
    attendee_count INT NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES district_events(event_id) ON DELETE CASCADE
);

-- 11. TOURIST ATTRACTIONS & LANDMARKS TABLE
CREATE TABLE IF NOT EXISTS tourist_attractions (
    attraction_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('HERITAGE', 'NATURE_BEACH', 'MUSEUM', 'PARK') NOT NULL,
    location VARCHAR(150) NOT NULL,
    opening_hours VARCHAR(100) NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    highlights TEXT NOT NULL,
    best_time_to_visit VARCHAR(100) NOT NULL
);

-- 12. CITY SPOTS (RESTAURANTS, CAFES, SHOPPING CENTRES & MARKETS)
CREATE TABLE IF NOT EXISTS city_spots (
    spot_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    spot_type ENUM('RESTAURANT', 'CAFE', 'SHOPPING_MALL', 'STREET_FOOD_HUB', 'LOCAL_BAZAAR') NOT NULL,
    cuisine_or_specialty VARCHAR(120) NOT NULL,
    price_range ENUM('₹', '₹₹', '₹₹₹', '₹₹₹₹') NOT NULL,
    address VARCHAR(200) NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    timings VARCHAR(100) NOT NULL
);

-- 13. ESSENTIAL PUBLIC & EMERGENCY SERVICES TABLE
CREATE TABLE IF NOT EXISTS emergency_services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    category ENUM('EMERGENCY_HELPLINE', 'HOSPITAL', 'POLICE', 'FIRE_SAFETY', 'CIVIC_TRANSIT') NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    alternate_number VARCHAR(30),
    address VARCHAR(200) NOT NULL,
    is_24_7 BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(255)
);
