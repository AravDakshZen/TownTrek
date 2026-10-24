-- ====================================================================
-- TOWNTREK DISTRICT CONSOLE APPLICATION - COMPLETE DATABASE MIGRATION
-- Run this script in MySQL Workbench or via MySQL CLI:
-- mysql -u root -p < migration_district_towntrek.sql
-- ====================================================================


CREATE DATABASE IF NOT EXISTS movie_booking_db;
USE movie_booking_db;

-- 1. USERS TABLE (Authentication with Salt + Hash)
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

-- 4. SHOWS TABLE (Linked to Movies & Theatres)
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

-- ====================================================================
-- SEED DATA (MINIMUM 3 REALISTIC RECORDS PER CATEGORY ACROSS ALL DOMAINS)
-- ====================================================================

-- 1. THEATRES (3 distinct venues)
INSERT INTO theatres (theatre_id, theatre_name, location, total_screens) VALUES
(1, 'PVR Grand Luxe Multiplex', 'Downtown City Centre', 6),
(2, 'INOX Megaplex & IMAX', 'Westfield Boulevard', 8),
(3, 'SPI Palazzo Cinema', 'Marina Waterfront Promenade', 5)
ON DUPLICATE KEY UPDATE theatre_name=VALUES(theatre_name);

-- 2. MOVIES (At least 3 per genre: Sci-Fi, Action, Drama/Thriller)
INSERT INTO movies (movie_id, movie_name, genre, duration_minutes, language) VALUES
-- Sci-Fi (3 records)
(1, 'Interstellar: Beyond Horizon', 'Sci-Fi', 169, 'English'),
(2, 'Inception Paradox', 'Sci-Fi', 148, 'English'),
(3, 'Avatar: The Way of Water', 'Sci-Fi', 192, 'English'),
-- Action (3 records)
(4, 'The Dark Knight Returns', 'Action', 152, 'English'),
(5, 'Jawan: Final Chapter', 'Action', 169, 'Hindi'),
(6, 'Leo: Roar of Justice', 'Action', 164, 'Tamil'),
-- Drama / Thriller (3 records)
(7, 'Oppenheimer', 'Drama', 180, 'English'),
(8, 'Vikram Vedha Chronicles', 'Thriller', 156, 'Tamil'),
(9, 'Dune: Prophecy of Sand', 'Sci-Fi', 166, 'English')
ON DUPLICATE KEY UPDATE movie_name=VALUES(movie_name);

-- 3. SHOWS (Active shows linking movies and theatres)
INSERT INTO shows (show_id, movie_id, theatre_id, show_date, show_time) VALUES
(1, 1, 1, CURDATE(), '14:30:00'),
(2, 1, 2, CURDATE(), '19:30:00'),
(3, 2, 1, CURDATE(), '17:00:00'),
(4, 3, 3, CURDATE(), '20:15:00'),
(5, 4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00'),
(6, 5, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00'),
(7, 6, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'),
(8, 7, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00')
ON DUPLICATE KEY UPDATE movie_id=VALUES(movie_id);

-- 4. SEATS GENERATION FOR SHOWS 1 TO 8 (A1 to E8 grid)
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
           ELSE 400.00
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

-- Mark a few sample seats as booked to demonstrate live availability
UPDATE seats SET seat_status = 'BOOKED' WHERE show_id = 1 AND seat_code IN ('C3', 'C4', 'E1');
UPDATE seats SET seat_status = 'BOOKED' WHERE show_id = 2 AND seat_code IN ('A2', 'D5');

-- 5. PARTIES & CONCERTS (Minimum 3 records per category: CONCERT, CLUB_PARTY, COMEDY_NIGHT)
INSERT INTO parties_concerts
(event_id, title, category, artist_performer, venue, location, event_date, event_time, ticket_price, total_capacity, available_slots, description) VALUES
-- Category: CONCERT (3 records)
(1, 'Acoustic Symphony Live', 'CONCERT', 'Arijit Singh & Philharmonic Orchestra', 'District Open Air Amphitheatre', 'Eco Park Boulevard', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '19:00:00', 1499.00, 2500, 1850, 'A magical 3-hour live acoustic and symphonic experience under the stars with chart-topping ballads.'),
(2, 'Neon Horizon Electronic Festival', 'CONCERT', 'DJ Nucleya & Sunburn Collective', 'Marina Grand Arena', 'Seaside Road', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '18:30:00', 999.00, 3000, 2400, 'High-octane bass drops, lasers, and immersive pyrotechnics featuring premier electronic artists.'),
(3, 'Rock Revival: Retro Titans Tour', 'CONCERT', 'The Local Train Tribute & Thermal Project', 'Phoenix Live Arena', 'Downtown Midtown', DATE_ADD(CURDATE(), INTERVAL 12 DAY), '20:00:00', 799.00, 1500, 1120, 'Pure indie rock, soul-stirring guitars, and anthems celebrating classic indie hits.'),

-- Category: CLUB_PARTY (3 records)
(4, 'Skyline Rooftop Sundowner', 'CLUB_PARTY', 'DJ Ankytrixx & Melodic Beats', 'Aura 360 Sky Lounge', 'High-Rise Tower 21, Business Bay', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '17:30:00', 1200.00, 300, 180, 'Sunset views, signature mocktails and cocktails, organic deep house rhythms on the 40th floor.'),
(5, 'Midnight Glow Neon Rave', 'CLUB_PARTY', 'DJ Kiara & Bassline Syndicate', 'Underground Vault Club', 'Church Street Hub', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '22:00:00', 850.00, 450, 320, 'UV face-paint, neon glow sticks, and pulsating commercial club tracks until late midnight.'),
(6, 'Retro Bollywood Disco Night', 'CLUB_PARTY', 'DJ Suketu & Rhythm Dholaks', 'Club Illusions', 'Park Avenue Plaza', DATE_ADD(CURDATE(), INTERVAL 9 DAY), '21:00:00', 750.00, 400, 260, 'Throwback 90s and 2000s Bollywood dance hits with live percussionists and dynamic dance floors.'),

-- Category: COMEDY_NIGHT (3 records)
(7, 'Tathastu & Beyond: Standup Special', 'COMEDY_NIGHT', 'Zakir Khan Live', 'Sir Mutha Venkatasubba Concert Hall', 'Chetpet Arts District', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:30:00', 899.00, 1200, 780, 'Heartfelt storytelling, desi relatable humor, and side-splitting comedy about growing up and friendships.'),
(8, 'Unfiltered: Raw & Punchy', 'COMEDY_NIGHT', 'Samay Raina & Friends', 'The Laugh Store Comedy Hub', 'Metro Square Mall', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '20:00:00', 699.00, 500, 310, 'Uncensored dark comedy, spontaneous crowd work, and fresh jokes crafted live for the comedy fan.'),
(9, 'Mind Your Wit: Improv Showdown', 'COMEDY_NIGHT', 'The Improv Collective Troupe', 'Black Box Theatre Studio', 'Koramangala 4th Block', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '18:00:00', 499.00, 250, 160, 'Interactive situational improv comedy games shaped completely by live audience prompts and twists.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. DISTRICT EVENTS & WORKSHOPS (Minimum 3 records per category: WORKSHOP, FOOD_FEST, SPORTS, CULTURAL)
INSERT INTO district_events
(event_id, title, category, venue, location, event_date, event_time, entry_fee, max_capacity, registered_count, description) VALUES
-- Category: WORKSHOP (3 records)
(1, 'Artisan Pottery & Clay Sculpting Workshop', 'WORKSHOP', 'Kala Heritage Studio', 'Arts Village, Gandhi Nagar', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00', 450.00, 40, 18, 'Hands-on wheel pottery training, glazing fundamentals, and take-home clay creations guided by master potters.'),
(2, 'Generative AI & Agentic Coding Masterclass', 'WORKSHOP', 'Metro Innovation Tech Hub', 'IT Expressway Phase 1', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '14:00:00', 0.00, 150, 95, 'Deep-dive into building autonomous multi-agent pipelines and LLM architectures with hands-on coding demos.'),
(3, 'Urban Terrace Hydroponics & Gardening Bootcamp', 'WORKSHOP', 'Green Horizon Eco Centre', 'Jayanagar Sector 5', DATE_ADD(CURDATE(), INTERVAL 7 DAY), '09:30:00', 299.00, 50, 27, 'Learn soil-less vegetable cultivation, nutrient cycles, and balcony drip-irrigation setups for modern homes.'),

-- Category: FOOD_FEST (3 records)
(4, 'District Grand Street Food Carnival', 'FOOD_FEST', 'Central Island Grounds', 'Old Fort Esplanade', DATE_ADD(CURDATE(), INTERVAL 3 DAY), '16:00:00', 100.00, 5000, 1820, 'Over 80 curated street food stalls from Chaats, Momos, and Biryanis to live Dosa counters and Kulfi bars.'),
(5, 'Asian Dumpling & Street Noodle Festival', 'FOOD_FEST', 'The Courtyard Square', 'Indiranagar Main Road', DATE_ADD(CURDATE(), INTERVAL 6 DAY), '12:00:00', 150.00, 800, 420, 'Authentic dim sum tastings, ramen noodle bowls, bao buns, and bubble tea varieties from master pan-Asian chefs.'),
(6, 'Artisanal Dessert & Single-Origin Coffee Fair', 'FOOD_FEST', 'Civic Heritage Lawn', 'Cubbon Park Entrance', DATE_ADD(CURDATE(), INTERVAL 9 DAY), '11:00:00', 50.00, 1200, 680, 'Specialty bean roasting workshops, bean-to-bar chocolate tastings, French macarons, and craft cold brews.'),

-- Category: SPORTS (3 records)
(7, 'Metro Dawn 10K & Half Marathon Run', 'SPORTS', 'Marina Promenade Starting Line', 'South Coast Beachway', DATE_ADD(CURDATE(), INTERVAL 4 DAY), '05:30:00', 350.00, 2000, 1450, 'Scenic seaside morning run with electronic RFID timing chips, finisher medals, and hydration stations.'),
(8, 'District Night Cycling Expedition (25 KM)', 'SPORTS', 'Vidhana Soudha Plaza', 'Dr. Ambedkar Veedhi', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '21:30:00', 200.00, 300, 185, 'Guided night leisure cycle tour through heritage avenues, illuminated monuments, and peaceful city boulevards.'),
(9, 'Inter-District Smash Badminton Open', 'SPORTS', 'District Indoor Sports Complex', 'Kanteerava Stadium Zone', DATE_ADD(CURDATE(), INTERVAL 11 DAY), '08:30:00', 400.00, 128, 92, 'Singles and doubles knockout tournament for enthusiasts and club players with trophies and cash vouchers.'),

-- Category: CULTURAL (3 records)
(10, 'District Heritage Folk Dance & Classical Gala', 'CULTURAL', 'Tagore Memorial Open Theatre', 'Cultural Enclave', DATE_ADD(CURDATE(), INTERVAL 5 DAY), '18:00:00', 0.00, 1000, 610, 'Captivating evening of Bharatanatyam, Kathak, and traditional folk dances celebrating indigenous artistic heritage.'),
(11, 'International Indie Cinema Retrospective', 'CULTURAL', 'Alliance Francaise Auditorium', 'Millers Road', DATE_ADD(CURDATE(), INTERVAL 8 DAY), '15:00:00', 100.00, 250, 140, 'Curated screening of award-winning world cinema, festival documentaries, and director Q&A discussions.'),
(12, 'Moonlit Poetry Slam & Acoustic Melodies', 'CULTURAL', 'Atta Galatta Literature Lawn', 'Koramangala Arts Quarter', DATE_ADD(CURDATE(), INTERVAL 10 DAY), '19:00:00', 75.00, 120, 88, 'Soulful spoken-word poetry, Urdu shayaris, and acoustic guitar ballads in a candlelit open-air garden setting.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. TOURIST ATTRACTIONS & LANDMARKS (Minimum 3 records per category: HERITAGE, NATURE_BEACH, MUSEUM, PARK)
INSERT INTO tourist_attractions
(attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit) VALUES
-- Category: HERITAGE (3 records)
(1, 'Imperial Fort & Royal Bastion', 'HERITAGE', 'Old City Citadel, Heritage Gate', '09:00 AM - 05:30 PM', 50.00, '16th-century granite fortifications, royal durbar hall, armory museum, and panoramic bastion watchtowers.', 'Morning or late afternoon'),
(2, 'Saint Mary Basilica & Gothic Spire', 'HERITAGE', 'Cathedral Square, Shivajinagar', '06:00 AM - 08:30 PM', 0.00, 'Stunning French Gothic architecture, stained-glass windows, and tranquil centuries-old vaulted nave.', 'Early morning weekdays'),
(3, 'Victoria Memorial Clock Tower & Arcade', 'HERITAGE', 'Central Circle, Market Road', 'Open 24 Hours (Exterior)', 0.00, 'Historic 1890s Victorian clock tower, heritage colonnaded walkways, and illuminated evening facade.', 'Evenings 06:00 PM - 09:00 PM'),

-- Category: NATURE_BEACH (3 records)
(4, 'Marina Golden Beach & Lighthouse Promenade', 'NATURE_BEACH', 'Kamraj Promenade East', 'Open 24 Hours (Lighthouse 10 AM - 5 PM)', 20.00, 'Expansive sandy beach, active lighthouse with elevator to 360-degree coast views, sea breeze, and roasted corn stalls.', 'Sunrise 05:30 AM or Sunset 05:30 PM'),
(5, 'Whispering Palm Cove & Rocky Bay', 'NATURE_BEACH', 'East Coast Highway km 18', '06:00 AM - 07:00 PM', 0.00, 'Secluded shoreline, natural tide pools, dolphin-watching boat trips, and scenic coastal sunset views.', '04:00 PM - 06:30 PM'),
(6, 'Silver Cascade Valley & Forest Ridge', 'NATURE_BEACH', 'Bannerghatta Valley Road', '08:30 AM - 05:00 PM', 40.00, 'Natural fresh-water cascading stream, gentle trekking trail, bamboo groves, and lush picnic glades.', 'Post-monsoon and Winter months'),

-- Category: MUSEUM (3 records)
(7, 'Metro Museum of Science & Cosmos Planetarium', 'MUSEUM', 'Kasturba Road, Opp. Park Gate', '10:00 AM - 06:00 PM (Closed Mon)', 80.00, 'Interactive physical science exhibits, flight simulators, dinosaur fossil gallery, and 4K digital sky show.', '11:00 AM - 03:00 PM'),
(8, 'District Archaeological & Coin Museum', 'MUSEUM', 'Government Museum Building, Kasturba Rd', '10:00 AM - 05:00 PM (Closed Wed)', 30.00, 'Ancient Roman and Chola coins, bronze sculptures, Hoysala stone carvings, and palm-leaf manuscripts.', 'Morning 10:30 AM'),
(9, 'National Modern Art Gallery (Manikyavelu Mansion)', 'MUSEUM', 'Palace Road, Vasanth Nagar', '10:00 AM - 05:00 PM (Closed Mon)', 50.00, 'Colonial heritage mansion displaying Raja Ravi Varma oil paintings, contemporary sculptures, and sculpture garden cafe.', 'Afternoon 02:00 PM - 04:30 PM'),

-- Category: PARK (3 records)
(10, 'Cubbon Botanic Heritage Park', 'PARK', 'Kasturba Road, Central District', '06:00 AM - 08:00 PM', 0.00, '300 acres of tranquil bamboo groves, centuries-old mahogany trees, rose gardens, and pedestrian running tracks.', '06:00 AM - 09:00 AM (Vehicle free)'),
(11, 'Lalbagh Botanical Garden & Glass House', 'PARK', 'Mavalli South Circle', '06:00 AM - 07:00 PM', 30.00, 'Famed 1889 Glass House inspired by London Crystal Palace, 3000-million-year-old Peninsular rock, and lotus lake.', 'Early morning or Annual Flower Shows'),
(12, 'Sankey Freshwater Lake & Eco Promenade', 'PARK', 'Sadashivanagar, 11th Cross', '06:00 AM - 08:00 PM', 10.00, 'Paved waterside walking tracks, pedal boating jetty, bird-watching points, and lush floral borders.', 'Sunset 05:00 PM - 07:00 PM')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 8. CITY SPOTS (RESTAURANTS, CAFES, SHOPPING MALLS, STREET FOOD, BAZAARS)
-- Minimum 3 records per category
INSERT INTO city_spots
(spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings) VALUES
-- Category: RESTAURANT (3 records)
(1, 'The Colonial Courtyard', 'RESTAURANT', 'North Indian & Awadhi Fine Dine', '₹₹₹', '45 Lavelle Road, Richmond Circle', 4.7, '+91 80 4123 4567', '12:00 PM - 11:30 PM'),
(2, 'Coastal Bay Seafood Trattoria', 'RESTAURANT', 'Mangalorean & Malabar Seafood', '₹₹', '12 80 Feet Road, Indiranagar', 4.6, '+91 80 2521 9876', '12:30 PM - 11:00 PM'),
(3, 'Tuscany Woodfire Kitchen', 'RESTAURANT', 'Authentic Italian & Neapolitan Pizzas', '₹₹₹', '72 St. Marks Road, Central', 4.8, '+91 80 4155 7788', '01:00 PM - 11:00 PM'),

-- Category: CAFE (3 records)
(4, 'Roast & Bloom Artisanal Coffee', 'CAFE', 'Single-Origin Brews & Sourdough Toasts', '₹₹', '104 12th Main, Koramangala 4th Block', 4.8, '+91 98450 11223', '07:30 AM - 10:30 PM'),
(5, 'The Bohemian Library Cafe', 'CAFE', 'Herbal Teas, Cheesecakes & Book Lounge', '₹', '33 Church Street, Brigade Road', 4.5, '+91 97420 55667', '09:00 AM - 10:00 PM'),
(6, 'French Press Petite Patisserie', 'CAFE', 'Croissants, Crepes & French Roasts', '₹₹', '18 Defence Colony, Indiranagar', 4.7, '+91 99800 33445', '08:00 AM - 11:00 PM'),

-- Category: SHOPPING_MALL (3 records)
(7, 'Phoenix Marketcity & Grand Galleria', 'SHOPPING_MALL', 'Global Fashion Brands, IMAX & Dining', '₹₹₹', 'Whitefield Main Road, Mahadevapura', 4.7, '+91 80 6726 6111', '10:00 AM - 10:00 PM'),
(8, 'Nexus Koramangala Grand Mall', 'SHOPPING_MALL', 'Department Stores, Bowling & Multiplex', '₹₹', 'Hosur Main Road, Koramangala', 4.4, '+91 80 2206 7800', '10:00 AM - 10:30 PM'),
(9, 'UB City Luxury Collection Mall', 'SHOPPING_MALL', 'High-End Luxury Boutiques & Fine Diners', '₹₹₹₹', '24 Vittal Mallya Road', 4.8, '+91 80 2227 2220', '11:00 AM - 09:30 PM'),

-- Category: STREET_FOOD_HUB (3 records)
(10, 'V.V. Puram Thindi Beedi (Food Street)', 'STREET_FOOD_HUB', 'Butter Dosa, Floating Pani Puri, Gulkand', '₹', 'Old Brahmin Street, Sajjan Rao Circle', 4.6, '+91 94480 77112', '06:00 PM - 11:30 PM'),
(11, 'Mosque Road Shawarma & Kabab Alley', 'STREET_FOOD_HUB', 'Smoked Seekh Kababs, Haleem & Faloodas', '₹', 'Mosque Road, Frazer Town', 4.5, '+91 98860 99443', '05:30 PM - 12:00 AM'),
(12, 'Koramangala 5th Block Momo & Chaat Line', 'STREET_FOOD_HUB', 'Steamed Tibetan Momos, Bhelpuri, Kathi Rolls', '₹', 'Koramangala Club Road', 4.4, '+91 96110 33221', '04:00 PM - 11:00 PM'),

-- Category: LOCAL_BAZAAR (3 records)
(13, 'Commercial Street Heritage Apparel Bazaar', 'LOCAL_BAZAAR', 'Ethnic Fabrics, Footwear & Silver Jewelry', '₹₹', 'Commercial Street, Tasker Town', 4.5, '+91 80 2558 3344', '10:30 AM - 09:00 PM'),
(14, 'Gandhi Bazaar Traditional Flower & Spice Market', 'LOCAL_BAZAAR', 'Mysore Silk, Fresh Jasmine & Spices', '₹', 'Gandhi Bazaar Main Rd, Basavanagudi', 4.6, '+91 80 2661 8899', '07:00 AM - 08:30 PM'),
(15, 'Chitra Santhe Artisan Flea & Crafts Alley', 'LOCAL_BAZAAR', 'Handmade Terracotta, Wooden Toys & Paintings', '₹₹', 'Kumara Krupa Road', 4.7, '+91 98440 66554', '10:00 AM - 07:00 PM')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 9. ESSENTIAL PUBLIC & EMERGENCY SERVICES (Minimum 3 records per category)
INSERT INTO emergency_services
(service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes) VALUES
-- Category: EMERGENCY_HELPLINE (3 records)
(1, 'National Unified Emergency Response (Police/Fire/Ambulance)', 'EMERGENCY_HELPLINE', '112', '100', 'State Central Emergency Command Centre', TRUE, 'All-in-one national emergency helpline for prompt dispatch.'),
(2, 'Women Helpline & Distress Safety Response', 'EMERGENCY_HELPLINE', '1091', '080-22943225', 'Women Protection Wing, Central Police HQ', TRUE, 'Immediate safety patrol dispatch and legal counseling support.'),
(3, 'Childline Emergency & Protection Network', 'EMERGENCY_HELPLINE', '1098', '080-23456789', 'District Child Protection Unit, Infantry Rd', TRUE, 'Dedicated 24/7 care and rescue for children in distress.'),

-- Category: HOSPITAL (3 records)
(4, 'Apollo Multi-Specialty & 24/7 Emergency Trauma Care', 'HOSPITAL', '+91 80 2630 4050', '1066', '154/11 Bannerghatta Road, Opp. IIM', TRUE, 'Level-1 trauma center, round-the-clock cardiac and stroke response.'),
(5, 'Victoria Government Hospital & Trauma Casualty', 'HOSPITAL', '+91 80 2670 1150', '108', 'Fort Road, Near City Market', TRUE, 'Large government hospital with free emergency casualty and blood bank.'),
(6, 'Manipal Hospital & Critical Care Centre', 'HOSPITAL', '+91 80 2502 4444', '+91 80 2502 3333', '98 HAL Old Airport Road', TRUE, 'Advanced neuro-trauma, intensive care units, and 24-hr pharmacy.'),

-- Category: POLICE (3 records)
(7, 'Central District Police Control Room', 'POLICE', '100', '080-22942222', 'Infantry Road Police Headquarters', TRUE, 'Main police dispatch and PCR patrol van coordination center.'),
(8, 'Downtown Traffic & Accident Relief Cell', 'POLICE', '103', '080-22943030', 'Traffic Management Centre, St. Marks Road', TRUE, 'Traffic towing assistance, road accident response, and highway safety.'),
(9, 'Cyber Crime & Online Fraud Investigation Cell', 'POLICE', '1930', '080-22375522', 'CID Cyber Wing, Carlton House, Palace Road', TRUE, 'Immediate reporting of online financial fraud and cyber extortion.'),

-- Category: FIRE_SAFETY (3 records)
(10, 'Central Fire & Disaster Rescue Command HQ', 'FIRE_SAFETY', '101', '080-22971500', 'Sheshadri Road, Gandhinagar', TRUE, 'Heavy-duty hydraulic ladders, building fire and disaster relief.'),
(11, 'South Zone Quick Response Fire Station', 'FIRE_SAFETY', '101', '080-22971550', 'Kanakapura Road, Jayanagar 7th Block', TRUE, 'Rapid intervention water-foam tenders and urban rescue squad.'),
(12, 'Industrial & Chemical Hazmat Fire Command', 'FIRE_SAFETY', '101', '080-28520101', 'Electronics City Phase 1 Main Gate', TRUE, 'Equipped for chemical hazard, industrial, and electrical fire suppression.'),

-- Category: CIVIC_TRANSIT (3 records)
(13, 'District Municipal Corporation 24/7 Control Room', 'CIVIC_TRANSIT', '1533', '080-22660000', 'Corporation Central Building, Hudson Circle', TRUE, 'Potholes, water-logging, tree falls, and garbage clearance relief.'),
(14, 'Metro Rail Corporation Passenger Helpline & Lost/Found', 'CIVIC_TRANSIT', '1800-425-12345', '080-25191091', 'Metro Bhavan, MG Road', FALSE, 'Train timings, smart-card issues, accessibility support (05:00 AM - 11:30 PM).'),
(15, 'State Road Transport Corporation Helpline & Bus Enquiries', 'CIVIC_TRANSIT', '080-26252625', '1800-224-997', 'Kempegowda Bus Station, Majestic', TRUE, 'Inter-city bus bookings, local Volvo shuttle schedules, and emergency transit.')
ON DUPLICATE KEY UPDATE service_name=VALUES(service_name);

-- 10. SAMPLE USER ACCOUNTS FOR TESTING
-- User: Aravindh Murugesh (email: arav@district.com, password: password123)
-- Salt: a1b2c3d4e5f60718293a4b5c6d7e8f90
INSERT INTO users (full_name, email, password_salt, password_hash) VALUES
('Aravindh Murugesh', 'arav@district.com', 'a1b2c3d4e5f60718293a4b5c6d7e8f90', '486851b2f70b74100e4708765278c78d8a7c2fdfae58498877bc95c0c9cb3c59'),
('District Explorer', 'user@district.com', 'b2c3d4e5f60718293a4b5c6d7e8f90a1', 'd8d15a5fbc40dcf92ea5aa6930501a3964d4b3c4ffdfad931ea7b036ca6d5c56')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Sample initial bookings for demonstration
INSERT INTO party_bookings (customer_name, user_email, event_id, tickets_count, total_amount, booking_status)
VALUES ('Aravindh Murugesh', 'arav@district.com', 1, 2, 2998.00, 'CONFIRMED')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);

INSERT INTO event_registrations (customer_name, user_email, event_id, attendee_count, total_fee, status)
VALUES ('Aravindh Murugesh', 'arav@district.com', 2, 1, 0.00, 'CONFIRMED')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name);
