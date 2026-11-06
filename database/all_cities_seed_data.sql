-- ====================================================================
-- TOWNTREK MASTER DATABASE SCRIPT (A TO Z ALL-IN-ONE)
-- Database: towntrek_db
-- Cities Covered: Mumbai, Chennai, Bangalore
-- Safe to run repeatedly: Won't throw duplicate column or FK errors
-- ====================================================================

CREATE DATABASE IF NOT EXISTS towntrek_db;
USE towntrek_db;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- PART 1: DDL - CREATE ALL 13 TABLES IF NOT EXISTS
-- --------------------------------------------------------------------

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_salt VARCHAR(64) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    city VARCHAR(100) DEFAULT 'Chennai',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. THEATRES
CREATE TABLE IF NOT EXISTS theatres (
    theatre_id INT AUTO_INCREMENT PRIMARY KEY,
    theatre_name VARCHAR(120) NOT NULL,
    location VARCHAR(150) NOT NULL,
    total_screens INT DEFAULT 4,
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- 3. MOVIES
CREATE TABLE IF NOT EXISTS movies (
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_name VARCHAR(150) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL,
    language VARCHAR(50) NOT NULL
);

-- 4. SHOWS
CREATE TABLE IF NOT EXISTS shows (
    show_id INT AUTO_INCREMENT PRIMARY KEY,
    movie_id INT NOT NULL,
    theatre_id INT NOT NULL,
    show_date DATE NOT NULL,
    show_time TIME NOT NULL,
    FOREIGN KEY (movie_id) REFERENCES movies(movie_id) ON DELETE CASCADE,
    FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id) ON DELETE CASCADE
);

-- 5. SEATS
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

-- 6. CINEMA BOOKINGS
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

-- 7. PARTIES & CONCERTS
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
    description TEXT,
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- 8. PARTY BOOKINGS
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

-- 9. TOWNTREK EVENTS & WORKSHOPS
CREATE TABLE IF NOT EXISTS towntrek_events (
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
    description TEXT,
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- 10. COMPATIBILITY VIEW: district_events
CREATE OR REPLACE VIEW district_events AS SELECT * FROM towntrek_events;

-- 11. EVENT REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
    reg_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(120) NOT NULL,
    event_id INT NOT NULL,
    attendee_count INT NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('CONFIRMED', 'CANCELLED') DEFAULT 'CONFIRMED',
    reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES towntrek_events(event_id) ON DELETE CASCADE
);

-- 12. TOURIST ATTRACTIONS
CREATE TABLE IF NOT EXISTS tourist_attractions (
    attraction_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category ENUM('HERITAGE', 'NATURE_BEACH', 'MUSEUM', 'PARK') NOT NULL,
    location VARCHAR(150) NOT NULL,
    opening_hours VARCHAR(100) NOT NULL,
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    highlights TEXT NOT NULL,
    best_time_to_visit VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- 13. CITY SPOTS (Dining, Cafes & Bazaars)
CREATE TABLE IF NOT EXISTS city_spots (
    spot_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    spot_type ENUM('RESTAURANT', 'CAFE', 'SHOPPING_MALL', 'STREET_FOOD_HUB', 'LOCAL_BAZAAR') NOT NULL,
    cuisine_or_specialty VARCHAR(120) NOT NULL,
    price_range VARCHAR(20) NOT NULL,
    address VARCHAR(200) NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    contact_number VARCHAR(30) NOT NULL,
    timings VARCHAR(100) NOT NULL,
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- 14. EMERGENCY SERVICES (Missing 13th Table)
CREATE TABLE IF NOT EXISTS emergency_services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(150) NOT NULL,
    category ENUM('EMERGENCY_HELPLINE', 'HOSPITAL', 'POLICE', 'FIRE_SAFETY', 'CIVIC_TRANSIT') NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    alternate_number VARCHAR(30),
    address VARCHAR(200) NOT NULL,
    is_24_7 BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(255),
    city VARCHAR(100) DEFAULT 'Chennai'
);

-- --------------------------------------------------------------------
-- PART 2: DYNAMIC SAFE MIGRATION (ADDS `city` COLUMN IF TABLES EXISTED)
-- --------------------------------------------------------------------
SET @db = DATABASE();

-- Users
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'users' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE users ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Theatres
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'theatres' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE theatres ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Parties & Concerts
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'parties_concerts' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE parties_concerts ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- TownTrek Events
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'towntrek_events' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE towntrek_events ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Tourist Attractions
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'tourist_attractions' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE tourist_attractions ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- City Spots
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'city_spots' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE city_spots ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Emergency Services
SET @c = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'emergency_services' AND COLUMN_NAME = 'city');
SET @s = IF(@c = 0, 'ALTER TABLE emergency_services ADD COLUMN city VARCHAR(100) DEFAULT "Chennai"', 'SELECT 1');
PREPARE stmt FROM @s; EXECUTE stmt; DEALLOCATE PREPARE stmt;


-- --------------------------------------------------------------------
-- PART 3: INSERT SEED DATA FOR CHENNAI, BANGALORE & MUMBAI
-- --------------------------------------------------------------------

-- 3.1 THEATRES (Chennai, Bangalore, Mumbai)
INSERT INTO theatres (theatre_id, theatre_name, location, total_screens, city) VALUES
-- Chennai
(1, 'SPI Palazzo & IMAX', 'Marina Waterfront Promenade, Chennai', 6, 'Chennai'),
(2, 'PVR Grand Luxe Multiplex', 'Velachery OMR Road, Chennai', 8, 'Chennai'),
(3, 'AGS Cinemas OMR', 'Navalur, Old Mahabalipuram Road, Chennai', 5, 'Chennai'),
-- Bangalore
(4, 'PVR Forum Superplex', 'Koramangala 7th Block, Bangalore', 11, 'Bangalore'),
(5, 'INOX Megaplex & IMAX', 'Orion Mall, Malleshwaram, Bangalore', 8, 'Bangalore'),
(6, 'Cinepolis Luxe Grand', 'Whitefield Main Road, Bangalore', 7, 'Bangalore'),
-- Mumbai
(7, 'PVR ICON Gold Cinema', 'Phoenix Palladium, Lower Parel, Mumbai', 9, 'Mumbai'),
(8, 'INOX Insignia & IMAX', 'Bandra Kurla Complex (BKC), Mumbai', 6, 'Mumbai'),
(9, 'PVR Superplex Juhu', 'Dynamix Mall, Juhu Vile Parle, Mumbai', 5, 'Mumbai')
ON DUPLICATE KEY UPDATE theatre_name=VALUES(theatre_name), location=VALUES(location), city=VALUES(city);

-- 3.2 MOVIES (Shared Blockbuster Catalog)
INSERT INTO movies (movie_id, movie_name, genre, duration_minutes, language) VALUES
(1, 'Interstellar: Beyond Horizon', 'Sci-Fi', 169, 'English'),
(2, 'Inception Paradox', 'Sci-Fi', 148, 'English'),
(3, 'Avatar: The Way of Water', 'Sci-Fi', 192, 'English'),
(4, 'The Dark Knight Returns', 'Action', 152, 'English'),
(5, 'Jawan: Final Chapter', 'Action', 169, 'Hindi'),
(6, 'Leo: Roar of Justice', 'Action', 164, 'Tamil'),
(7, 'Oppenheimer', 'Drama', 180, 'English'),
(8, 'Vikram Vedha Chronicles', 'Thriller', 156, 'Tamil'),
(9, 'Dune: Prophecy of Sand', 'Sci-Fi', 166, 'English'),
(10, 'Kantara: Legend of Forest', 'Action/Drama', 150, 'Kannada'),
(11, 'Brahmastra Part Two', 'Fantasy', 160, 'Hindi'),
(12, 'Jailer: High Table Command', 'Action', 168, 'Tamil')
ON DUPLICATE KEY UPDATE movie_name=VALUES(movie_name);

-- 3.3 SHOWS (Dynamic Upcoming Dates across Chennai, Bangalore, Mumbai)
INSERT INTO shows (show_id, movie_id, theatre_id, show_date, show_time) VALUES
-- Chennai Shows (Theatres 1, 2, 3)
(1, 1, 1, CURDATE(), '14:30:00'),
(2, 6, 1, CURDATE(), '18:45:00'),
(3, 7, 2, CURDATE(), '19:30:00'),
(4, 9, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:15:00'),
-- Bangalore Shows (Theatres 4, 5, 6)
(5, 1, 4, CURDATE(), '15:00:00'),
(6, 10, 4, CURDATE(), '18:30:00'),
(7, 7, 5, CURDATE(), '20:00:00'),
(8, 9, 6, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:45:00'),
-- Mumbai Shows (Theatres 7, 8, 9)
(9, 5, 7, CURDATE(), '16:00:00'),
(10, 1, 7, CURDATE(), '19:30:00'),
(11, 7, 8, CURDATE(), '20:30:00'),
(12, 9, 9, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:15:00')
ON DUPLICATE KEY UPDATE show_time=VALUES(show_time);

-- 3.4 SEATS (Automatic Recliner & VIP grid for each show)
INSERT IGNORE INTO seats (show_id, seat_code, seat_type, price, seat_status)
SELECT sh.show_id,
       CONCAT(r.row_letter, n.seat_number),
       CASE
           WHEN r.row_letter IN ('A','B') THEN 'REGULAR'
           WHEN r.row_letter IN ('C','D') THEN 'PREMIUM'
           ELSE 'VIP'
       END,
       CASE
           WHEN r.row_letter IN ('A','B') THEN 150.00
           WHEN r.row_letter IN ('C','D') THEN 250.00
           ELSE 420.00
       END,
       'AVAILABLE'
FROM shows sh
CROSS JOIN (
    SELECT 'A' AS row_letter UNION ALL SELECT 'B'
    UNION ALL SELECT 'C' UNION ALL SELECT 'D' UNION ALL SELECT 'E'
) r
CROSS JOIN (
    SELECT 1 AS seat_number UNION ALL SELECT 2 UNION ALL SELECT 3
    UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
    UNION ALL SELECT 7 UNION ALL SELECT 8
) n;

-- 3.5 PARTIES & CONCERTS (Live gigs, raves & standup across Chennai, Bangalore, Mumbai)
INSERT INTO parties_concerts 
(event_id, title, category, artist_performer, venue, location, event_date, event_time, ticket_price, total_capacity, available_slots, description, city) VALUES
-- CHENNAI
(1, 'Acoustic Symphony Live', 'CONCERT', 'Arijit Singh & Philharmonic Orchestra', 'TownTrek Open Air Amphitheatre', 'Eco Park Boulevard, Chetpet, Chennai', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:00:00', 1499.00, 2500, 1850, 'A magical 3-hour live acoustic and symphonic experience under the open sky.', 'Chennai'),
(2, 'Neon Horizon Beach Rave', 'CLUB_PARTY', 'DJ Nucleya & Sunburn Collective', 'Marina Seaside Promenade', 'Marina Beachway, Chennai', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:30:00', 999.00, 3000, 2400, 'High-octane bass drops, lasers, and immersive pyrotechnics by the ocean.', 'Chennai'),
(3, 'Tathastu: The Relatable Tour', 'COMEDY_NIGHT', 'Zakir Khan Live', 'Sir Mutha Concert Hall', 'Chetpet Arts Enclave, Chennai', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '19:30:00', 899.00, 1200, 780, 'Heartfelt storytelling, desi relatable humor, and side-splitting comedy.', 'Chennai'),

-- BANGALORE
(4, 'Silicon Indie Rock Revival', 'CONCERT', 'The Local Train Tribute & Thermal Project', 'Phoenix Live Arena', 'Whitefield IT Corridor, Bangalore', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '20:00:00', 799.00, 1500, 1120, 'Pure indie rock, soul-stirring guitars, and anthems celebrating classic indie hits.', 'Bangalore'),
(5, 'Skyline 360 Rooftop Sundowner', 'CLUB_PARTY', 'DJ Ankytrixx & Melodic Beats', 'High-Rise Sky Lounge', 'Koramangala 4th Block, Bangalore', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '17:30:00', 1200.00, 300, 180, 'Sunset views, signature cold brews and mocktails with melodic deep house.', 'Bangalore'),
(6, 'Uncensored Punchlines: Live Comedy', 'COMEDY_NIGHT', 'Samay Raina & Friends', 'The Laugh Store Bangalore', 'Indiranagar 100 Feet Rd, Bangalore', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '20:00:00', 699.00, 500, 310, 'Uncensored comedy, spontaneous crowd work, and fresh jokes crafted live.', 'Bangalore'),

-- MUMBAI
(7, 'Bollywood Grand Arena Gala', 'CONCERT', 'Amit Trivedi & Fusion Band', 'Jio World Garden', 'Bandra Kurla Complex (BKC), Mumbai', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:30:00', 1799.00, 4000, 2900, 'Spectacular live orchestra, Bollywood classics, and soulful regional fusion.', 'Mumbai'),
(8, 'Queen Necklace Midnight Yacht Rave', 'CLUB_PARTY', 'DJ Kiara & Bassline Syndicate', 'Bayview Pier Club', 'Marine Drive Promenade, Mumbai', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '22:00:00', 1500.00, 400, 220, 'Exclusive seaside night party overlooking the illuminated Queen''s Necklace.', 'Mumbai'),
(9, 'Bandra Comedy Showcase', 'COMEDY_NIGHT', 'Biswa Kalyan Rath Live', 'The Cuckoo Club', 'Pali Hill, Bandra West, Mumbai', DATE_ADD(CURDATE(), INTERVAL 9 DAY), '20:30:00', 799.00, 250, 140, 'Philosophical quirks and rapid-fire punchlines in an intimate club format.', 'Mumbai')
ON DUPLICATE KEY UPDATE title=VALUES(title), venue=VALUES(venue), location=VALUES(location), city=VALUES(city);

-- 3.6 TOWNTREK EVENTS & WORKSHOPS (Workshops, food fests, cultural)
INSERT INTO towntrek_events 
(event_id, title, category, venue, location, event_date, event_time, entry_fee, max_capacity, registered_count, description, city) VALUES
-- CHENNAI
(1, 'Artisan Pottery & Terracotta Workshop', 'WORKSHOP', 'DakshinaChitra Heritage Village', 'East Coast Road (ECR), Chennai', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', 450.00, 40, 18, 'Hands-on wheel pottery training, glazing fundamentals, and terracotta take-home sculpting.', 'Chennai'),
(2, 'Grand Coastal Street Food Carnival', 'FOOD_FEST', 'Central Island Grounds', 'Old Fort Esplanade, Anna Salai, Chennai', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '16:00:00', 100.00, 5000, 1820, 'Over 80 curated street food counters, traditional dosas, kothu parotta, and seafood specials.', 'Chennai'),
(3, 'Marina Dawn 10K Scenic Run', 'SPORTS', 'Marina Beach Lighthouse', 'Kamarajar Promenade, Chennai', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '05:30:00', 300.00, 2000, 1420, 'Seaside morning sunrise marathon with chip timing, finisher medals, and hydration stations.', 'Chennai'),
(4, 'Margazhi Classical & Folk Dance Fest', 'CULTURAL', 'Kalakshetra Foundation Grounds', 'Thiruvanmiyur, Chennai', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '18:00:00', 0.00, 800, 540, 'Captivating live Bharatanatyam, Carnatic flute recital, and indigenous folk gala.', 'Chennai'),

-- BANGALORE
(5, 'Generative AI & Agentic Coding Bootcamp', 'WORKSHOP', 'Metro Innovation Tech Hub', 'IT Expressway Phase 1, Bangalore', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '14:00:00', 0.00, 250, 195, 'Deep-dive into building autonomous multi-agent pipelines and LLM systems with live code.', 'Bangalore'),
(6, 'Asian Dumpling & Artisan Noodle Expo', 'FOOD_FEST', 'The Courtyard Square', 'Indiranagar 12th Main, Bangalore', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '12:00:00', 150.00, 1000, 680, 'Authentic dim sum tastings, ramen noodle bowls, bao buns, and craft bubble teas.', 'Bangalore'),
(7, 'Cubbon Park Night Cycling Tour', 'SPORTS', 'Cubbon Park Main Gate', 'Kasturba Road, Bangalore', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '21:30:00', 200.00, 300, 185, 'Guided 20km leisure cycle ride through heritage avenues and illuminated city plazas.', 'Bangalore'),
(8, 'Koramangala Spoken Word & Jazz Jam', 'CULTURAL', 'Atta Galatta Literature Lawn', 'Koramangala 5th Block, Bangalore', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '19:00:00', 120.00, 150, 110, 'Soulful spoken-word poetry, acoustic guitar sets, and open-mic discussions.', 'Bangalore'),

-- MUMBAI
(9, 'French Sourdough & Patisserie Masterclass', 'WORKSHOP', 'Artisan Culinary Studio', 'Pali Village, Bandra West, Mumbai', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00', 850.00, 30, 22, 'Learn artisan sourdough starters, flaky butter croissants, and brioche baking.', 'Mumbai'),
(10, 'Kala Ghoda Street Gastronomy Fair', 'FOOD_FEST', 'Kala Ghoda Arts Precinct', 'Fort, South Mumbai', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '15:00:00', 150.00, 3500, 2100, 'Mumbai street chaats, Irani cafe bun maska, gourmet taco trucks, and dessert bars.', 'Mumbai'),
(11, 'Marine Drive Sunset Rollerblading & Skating', 'SPORTS', 'Nariman Point Promontory', 'Marine Drive, Mumbai', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '17:30:00', 100.00, 400, 260, 'Sunset fitness skate meetup along the Arabian Sea boulevard with safety instructors.', 'Mumbai'),
(12, 'Colaba Heritage Art & Architecture Walk', 'CULTURAL', 'Gateway of India Plaza', 'Apollo Bunder, Colaba, Mumbai', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '08:00:00', 250.00, 60, 48, 'Curated morning architectural walk exploring Victorian Gothic and Art Deco buildings.', 'Mumbai')
ON DUPLICATE KEY UPDATE title=VALUES(title), venue=VALUES(venue), location=VALUES(location), city=VALUES(city);

-- 3.7 TOURIST ATTRACTIONS (Heritage, beaches, parks & museums)
INSERT INTO tourist_attractions 
(attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit, city) VALUES
-- CHENNAI
(1, 'Marina Beach & Golden Lighthouse', 'NATURE_BEACH', 'Kamarajar Promenade, Triplicane, Chennai', 'Open 24 Hours (Lighthouse 10 AM - 5 PM)', 20.00, 'Longest natural urban beach in India, 360-degree elevator lighthouse views, roasted corn stalls.', 'Sunrise 05:30 AM or Sunset 05:30 PM', 'Chennai'),
(2, 'Fort St. George & Citadel Bastion', 'HERITAGE', 'Rajaji Salai, George Town, Chennai', '09:00 AM - 05:00 PM (Closed Fri)', 25.00, 'Historic 1644 British citadel, museum with colonial weaponry, paintings, and church.', 'Morning 09:30 AM', 'Chennai'),
(3, 'San Thome Gothic Basilica Spire', 'HERITAGE', 'Cathedral Square, Mylapore, Chennai', '06:00 AM - 08:30 PM', 0.00, 'Stunning Neo-Gothic Catholic cathedral built over the tomb of St. Thomas Apostle.', 'Late afternoon 04:30 PM', 'Chennai'),
(4, 'DakshinaChitra Living Heritage Museum', 'MUSEUM', 'East Coast Road (ECR), Muthukadu, Chennai', '10:00 AM - 06:00 PM (Closed Tue)', 175.00, 'Authentic reconstructed traditional houses of South India, folk crafts, and live weaving.', 'Morning or Early Winter', 'Chennai'),

-- BANGALORE
(5, 'Lalbagh Glass House & Botanical Garden', 'PARK', 'Mavalli Circle, Lalbagh, Bangalore', '06:00 AM - 07:00 PM', 30.00, 'Famous 1889 Glass House inspired by London Crystal Palace, ancient rock, and lotus ponds.', 'Early morning 06:30 AM', 'Bangalore'),
(6, 'Bangalore Royal Palace & Durbar Hall', 'HERITAGE', 'Palace Road, Vasanth Nagar, Bangalore', '10:00 AM - 05:30 PM', 250.00, 'Tudor-revival architecture, fortified battlements, wooden carvings, and royal memorabilia.', 'Morning 11:00 AM', 'Bangalore'),
(7, 'Cubbon Park & Bamboo Enclave', 'PARK', 'Kasturba Road, Central Bangalore', '06:00 AM - 08:00 PM', 0.00, '300 acres of tranquil bamboo groves, centuries-old mahogany trees, and walking trails.', 'Sunrise 06:00 AM', 'Bangalore'),
(8, 'Visvesvaraya Science & Cosmos Museum', 'MUSEUM', 'Kasturba Road, Opp. Cubbon Park, Bangalore', '10:00 AM - 06:00 PM', 85.00, 'Interactive physical science exhibits, engine simulators, dinosaur gallery, and planetarium.', 'Afternoon 01:00 PM', 'Bangalore'),

-- MUMBAI
(9, 'Gateway of India & Taj Promenade', 'HERITAGE', 'Apollo Bunder, Colaba, Mumbai', 'Open 24 Hours', 0.00, 'Iconic 1924 basalt triumphal arch overlooking Mumbai Harbour and historic heritage waterfront.', 'Evening sunset 05:30 PM', 'Mumbai'),
(10, 'Marine Drive Queen''s Necklace Promenade', 'NATURE_BEACH', 'Netaji Subhash Chandra Bose Rd, Mumbai', 'Open 24 Hours', 0.00, '3.6-kilometer seaside promenade forming the world-famous illuminated arc at night.', 'Dusk 06:30 PM - 10:00 PM', 'Mumbai'),
(11, 'Chhatrapati Shivaji Maharaj Vastu Museum', 'MUSEUM', 'Fort Precinct, Mahatma Gandhi Rd, Mumbai', '10:15 AM - 06:00 PM', 150.00, 'Indo-Saracenic grand mansion housing ancient sculptures, miniature paintings, and armory.', 'Morning 11:00 AM', 'Mumbai'),
(12, 'Bandra Bandstand & Portuguese Sea Fort', 'HERITAGE', 'Byramji Jeejeebhoy Road, Bandra West, Mumbai', '06:00 AM - 08:30 PM', 0.00, 'Historic 1640 Castella de Aguada fort ruins with panoramic views of Bandra-Worli Sea Link.', 'Sunset 06:00 PM', 'Mumbai')
ON DUPLICATE KEY UPDATE name=VALUES(name), location=VALUES(location), city=VALUES(city);

-- 3.8 CITY SPOTS (Cafes, legacy dining, malls & street bazaars)
INSERT INTO city_spots 
(spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings, city) VALUES
-- CHENNAI
(1, 'Amethyst Garden Cafe & Roastery', 'CAFE', 'Single-Origin Filter Brews & Pasta', '₹₹', 'Whites Road, Royapettah, Chennai', 4.7, '+91 44 4599 1633', '10:00 AM - 11:00 PM', 'Chennai'),
(2, 'Murugan Idli Shop Heritage', 'RESTAURANT', 'Ghee Podi Idli, Masala Dosa, Jigarthanda', '₹', 'GN Chetty Road, T. Nagar, Chennai', 4.6, '+91 44 2815 5449', '07:00 AM - 11:00 PM', 'Chennai'),
(3, 'Bayview Seafood Trattoria', 'RESTAURANT', 'Fresh Lobster, Crab Masala & Coastal Grills', '₹₹₹', 'Vivanta Fisherman''s Cove, Covelong ECR, Chennai', 4.8, '+91 44 6741 3333', '12:30 PM - 11:00 PM', 'Chennai'),
(4, 'T. Nagar Ranganathan Silk & Spice Bazaar', 'LOCAL_BAZAAR', 'Kanchipuram Silk, Fresh Flowers & Street Jewelry', '₹', 'Ranganathan Street, T. Nagar, Chennai', 4.5, '+91 94440 12345', '09:00 AM - 10:00 PM', 'Chennai'),
(5, 'Phoenix Marketcity Chennai', 'SHOPPING_MALL', 'Global Designer Stores, IMAX & Food Lounge', '₹₹₹', 'Velachery Main Road, Chennai', 4.7, '+91 44 6134 3000', '10:00 AM - 10:00 PM', 'Chennai'),

-- BANGALORE
(6, 'Vidyarthi Bhavan Legacy Diner', 'RESTAURANT', 'Crispy Golden Masala Dosa & Filter Kaapi', '₹', 'Gandhi Bazaar Main Road, Basavanagudi, Bangalore', 4.7, '+91 80 2667 7588', '06:30 AM - 11:30 AM, 02:00 PM - 08:00 PM', 'Bangalore'),
(7, 'Toit Craft Brewpub & Kitchen', 'RESTAURANT', 'Artisan Woodfire Pizzas & Craft Brews', '₹₹₹', '100 Feet Road, Indiranagar, Bangalore', 4.8, '+91 90197 13388', '12:00 PM - 12:00 AM', 'Bangalore'),
(8, 'Third Wave Coffee Roastery Flagship', 'CAFE', 'Nitro Cold Brew & Sourdough Toasts', '₹₹', '80 Feet Road, Koramangala 4th Block, Bangalore', 4.8, '+91 80 4370 4567', '07:30 AM - 11:30 PM', 'Bangalore'),
(9, 'Commercial Street Heritage Bazaar', 'LOCAL_BAZAAR', 'Handicrafts, Silk Fabrics, Antiques & Mojaris', '₹₹', 'Commercial Street, Tasker Town, Bangalore', 4.5, '+91 80 2558 3344', '10:30 AM - 09:30 PM', 'Bangalore'),
(10, 'UB City Luxury Galleria', 'SHOPPING_MALL', 'High-End Luxury Brands & Rooftop Fine Dining', '₹₹₹₹', 'Vittal Mallya Road, Central Bangalore', 4.8, '+91 80 2227 2220', '11:00 AM - 10:00 PM', 'Bangalore'),

-- MUMBAI
(11, 'Leopold Cafe & Bar Heritage', 'CAFE', 'Classic Beers, Cheesecake & Continental', '₹₹', 'Colaba Causeway, Colaba, Mumbai', 4.6, '+91 22 2282 4805', '07:30 AM - 12:00 AM', 'Mumbai'),
(12, 'Britannia & Co. Irani Dining', 'RESTAURANT', 'Berry Pulao, Sali Boti & Caramel Custard', '₹₹', 'Wakefield House, Ballard Estate, Fort, Mumbai', 4.7, '+91 22 2261 5264', '11:30 AM - 04:30 PM', 'Mumbai'),
(13, 'Prithvi Cafe & Theatre Lounge', 'CAFE', 'Cutting Chai, Parathas & Waffles in Garden', '₹', 'Janki Kutir, Juhu Church Road, Juhu, Mumbai', 4.8, '+91 22 2617 4118', '10:00 AM - 10:30 PM', 'Mumbai'),
(14, 'Linking Road & Hill Road Fashion Bazaar', 'LOCAL_BAZAAR', 'Street Style Clothing, Footwear & Accessories', '₹', 'Bandra West, Mumbai', 4.5, '+91 98200 98765', '11:00 AM - 09:30 PM', 'Mumbai'),
(15, 'Phoenix Palladium Luxury Mall', 'SHOPPING_MALL', 'High Fashion, Multiplex & Gourmet Dining', '₹₹₹', 'Senapati Bapat Marg, Lower Parel, Mumbai', 4.8, '+91 22 4333 9999', '11:00 AM - 10:00 PM', 'Mumbai')
ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), city=VALUES(city);

-- 3.9 EMERGENCY SERVICES (Hospitals, police, fire, 24/7 helplines)
INSERT INTO emergency_services 
(service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes, city) VALUES
-- NATIONAL / UNIFIED
(1, 'National Unified Emergency Helpline (Police / Fire / Ambulance)', 'EMERGENCY_HELPLINE', '112', '100', 'State Central Command Centre', TRUE, 'All-in-one national emergency helpline for prompt dispatch.', 'National'),
(2, 'National Women in Distress Helpline', 'EMERGENCY_HELPLINE', '1091', '080-22943225', 'Women Protection Wing Headquarters', TRUE, 'Immediate safety patrol dispatch and legal counseling support.', 'National'),
(3, 'Childline Rapid Response Network', 'EMERGENCY_HELPLINE', '1098', '1800-11-9898', 'Child Protection Central Command', TRUE, 'Dedicated 24/7 care and rescue for children in distress.', 'National'),

-- CHENNAI
(4, 'Apollo Main Hospital & Trauma Centre', 'HOSPITAL', '+91 44 2829 0200', '1066', '21 Greams Lane, Thousand Lights, Chennai', TRUE, 'Level-1 24/7 cardiac, neuro, and accident trauma care.', 'Chennai'),
(5, 'Rajiv Gandhi Government General Hospital (GH)', 'HOSPITAL', '+91 44 2530 5000', '108', 'EVR Periyar Salai, Park Town, Chennai', TRUE, 'Free 24/7 emergency casualty, ICU, and blood bank.', 'Chennai'),
(6, 'Greater Chennai Police Control Room', 'POLICE', '100', '+91 44 2345 2359', 'Police Commissioner Office, Vepery, Chennai', TRUE, 'City-wide police dispatch, patrol vans, and rapid distress unit.', 'Chennai'),
(7, 'Chennai Traffic Accident Relief & Towing', 'POLICE', '103', '+91 44 2345 2330', 'Traffic Command Centre, Kilpauk, Chennai', TRUE, 'Immediate road clearance, towing assistance, and accident relief.', 'Chennai'),

-- BANGALORE
(8, 'Manipal Multi-Specialty & Critical Care Hospital', 'HOSPITAL', '+91 80 2502 4444', '+91 80 2502 3333', '98 HAL Old Airport Road, Bangalore', TRUE, 'Advanced neuro-trauma, intensive care units, and 24-hr pharmacy.', 'Bangalore'),
(9, 'Victoria Government Hospital & Trauma Casualty', 'HOSPITAL', '+91 80 2670 1150', '108', 'Fort Road, Near City Market, Bangalore', TRUE, 'Large government hospital with free emergency casualty and blood bank.', 'Bangalore'),
(10, 'Bengaluru City Police Command & Control', 'POLICE', '100', '+91 80 2294 2222', 'Infantry Road Police Headquarters, Bangalore', TRUE, 'Main police dispatch and PCR patrol van coordination center.', 'Bangalore'),
(11, 'South Zone Quick Response Fire Station', 'FIRE_SAFETY', '101', '+91 80 2297 1550', 'Kanakapura Road, Jayanagar 7th Block, Bangalore', TRUE, 'Rapid intervention water-foam tenders and urban rescue squad.', 'Bangalore'),

-- MUMBAI
(12, 'Lilavati Hospital & Research Centre', 'HOSPITAL', '+91 22 2675 1000', '+91 22 2642 1111', 'A-791 Bandra Reclamation, Bandra West, Mumbai', TRUE, 'World-class 24/7 intensive care, trauma, and surgical emergency.', 'Mumbai'),
(13, 'King Edward Memorial (KEM) Government Hospital', 'HOSPITAL', '+91 22 2410 7000', '108', 'Acharya Donde Marg, Parel, Mumbai', TRUE, 'Premier municipal trauma hospital with round-the-clock emergency casualty.', 'Mumbai'),
(14, 'Mumbai Police Central Control Command', 'POLICE', '100', '+91 22 2262 0111', 'Crawford Market Police HQ, Fort, Mumbai', TRUE, 'Main Mumbai police dispatch, coastal security, and PCR patrol.', 'Mumbai'),
(15, 'Mumbai Fire Brigade Headquarters & Disaster Cell', 'FIRE_SAFETY', '101', '+91 22 2307 6111', 'Byculla Fire Command, Mumbai', TRUE, 'High-rise hydraulic ladders, coastal and monsoon disaster rescue.', 'Mumbai')
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name), address=VALUES(address), city=VALUES(city);

-- 3.10 TEST USER ACCOUNTS (Password for all: password123)
INSERT INTO users (user_id, full_name, email, password_salt, password_hash, city) VALUES
(1, 'Aravindh Murugesh', 'arav@towntrek.com', 'a1b2c3d4e5f60718293a4b5c6d7e8f90', '486851b2f70b74100e4708765278c78d8a7c2fdfae58498877bc95c0c9cb3c59', 'Chennai'),
(2, 'TownTrek Explorer', 'user@towntrek.com', 'b2c3d4e5f60718293a4b5c6d7e8f90a1', 'd8d15a5fbc40dcf92ea5aa6930501a3964d4b3c4ffdfad931ea7b036ca6d5c56', 'Bangalore'),
(3, 'TownTrek Mumbai Explorer', 'mumbai@towntrek.com', 'a1b2c3d4e5f60718293a4b5c6d7e8f90', '486851b2f70b74100e4708765278c78d8a7c2fdfae58498877bc95c0c9cb3c59', 'Mumbai')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), city=VALUES(city);

-- 3.11 INITIAL SAMPLE BOOKINGS (Populates My Passes & Booking History)
INSERT INTO bookings (booking_id, customer_name, movie_id, show_id, seat_codes, coupon_code, total_amount, booking_status) VALUES
(1, 'Aravindh Murugesh', 1, 1, 'C3,C4', 'CINE10', 450.00, 'CONFIRMED'),
(2, 'TownTrek Explorer', 1, 5, 'D1,D2', NULL, 500.00, 'CONFIRMED')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);

INSERT INTO party_bookings (booking_id, customer_name, user_email, event_id, tickets_count, total_amount, booking_status) VALUES
(1, 'Aravindh Murugesh', 'arav@towntrek.com', 1, 2, 2998.00, 'CONFIRMED'),
(2, 'TownTrek Explorer', 'user@towntrek.com', 4, 1, 799.00, 'CONFIRMED')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);

INSERT INTO event_registrations (reg_id, customer_name, user_email, event_id, attendee_count, total_fee, status) VALUES
(1, 'Aravindh Murugesh', 'arav@towntrek.com', 1, 1, 450.00, 'CONFIRMED'),
(2, 'TownTrek Explorer', 'user@towntrek.com', 5, 2, 0.00, 'CONFIRMED')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);

SET FOREIGN_KEY_CHECKS = 1;

-- ====================================================================
-- TOWNTREK SETUP COMPLETE: 13 TABLES + 1 VIEW + 3 CITIES DATA
-- ====================================================================
