# TownTrek — District Console Application

**TownTrek** is an all-in-one console-based district exploration and booking application developed using **Java 17, JDBC, MySQL 8, and Maven**. It serves as a unified digital district companion for city dwellers, tourists, and newcomers to explore entertainment, events, landmarks, dining, and essential emergency services.

---

## 1. Core Modules & Features

1. **Movies & Cinema Booking**:
   - Browse films, genres, languages, and showtimes.
   - Interactive 5 × 8 screen seat map (`O = Available`, `X = Booked`).
   - Cinema concessions (Popcorn, Juices, Nachos, Drinks).
   - Instant booking confirmation with coupon support (`CINE10` for 10% off).
   - Ticket pass look-up and seat release cancellation.

2. **Parties, Concerts & Comedy Nights**:
   - Discover live gigs, EDM festivals, rooftop DJ parties, and standup comedy specials.
   - View artist profiles, ticket prices, and live slot capacity.
   - Book multi-pass tickets with digital booking IDs.

3. **District Events & Workshops**:
   - Community workshops (pottery, AI/tech, urban farming).
   - Food carnivals, street fests, marathons, and cultural dance galas.
   - RSVP and registration for individuals and groups.

4. **Tourist Attractions & City Landmarks**:
   - Heritage forts, Gothic basilicas, clock towers, coastal beaches, museums, and botanical parks.
   - Comprehensive visiting guide with opening hours, entry fees, highlights, and best visiting times.

5. **Dining & Shopping Centres**:
   - Curated directory of restaurants, cafes, shopping malls, street food streets, and heritage bazaars.
   - Details: price range (₹ to ₹₹₹₹), ratings (★ 4.4 to 4.8), address, timings, and contact numbers.

6. **Essential Public Services & Emergency Contacts**:
   - 24/7 rapid dispatch helplines (112, 100, 108, 1091, 1098).
   - Hospital trauma centers, police stations, fire rescue squads, and municipal civic services.

7. **My District Passes & Unified Booking Management**:
   - Centralized dashboard displaying all active and past bookings across movies, concerts, and events.
   - Unified cancellation portal that restores seat/capacity slots immediately.

8. **City Quick Search**:
   - Search across landmarks, food spots, events, and movies using any keyword.

---

## 2. Aesthetic Design & Menu Interface

TownTrek uses a clean, modern aesthetic with consistent dividing rules and aligned tabular listings:

```text
____________________________________________________________________________________
                             TOWNTREK DISTRICT HUB
____________________________________________________________________________________
 Active User : Aravindh Murugesh (arav@district.com)
 District    : Metropolitan Central District
____________________________________________________________________________________
  1. Movies & Cinema             Browse movies, cinemas, seat maps & book tickets
  2. Parties & Live Concerts     Discover DJ nights, music fests & comedy shows
  3. Nearby Events & Workshops   Register for workshops, food fests & sports
  4. Tourist Attractions         Explore monuments, beaches, museums & nature parks
  5. Dining & Shopping Centres   Locate top restaurants, cafes, markets & malls
  6. Emergency & Public Services 24/7 Police, trauma care, ambulance & civic helplines
  7. My Passes & Bookings        Unified ticket dashboard & cancellations
  8. City Quick Search           Find spots, events, or movies by keyword
  0. Sign Out / Exit
____________________________________________________________________________________
```

---

## 3. Database Setup & Migration

### One-Step Migration
Run the complete migration script located at `database/migration_district_towntrek.sql` in MySQL Workbench or via terminal:

```bash
mysql -u root -p < database/migration_district_towntrek.sql
```

This single script:
- Creates the `movie_booking_db` database if not present.
- Sets up all 13 relational tables (users, theatres, movies, shows, seats, bookings, parties_concerts, party_bookings, district_events, event_registrations, tourist_attractions, city_spots, emergency_services).
- Seeds **at least 3 realistic records per category** across all domains.
- Adds test accounts (e.g. `arav@district.com` with password `password123`).

---

## 4. Database Credentials Configuration

TownTrek automatically detects configuration from three sources (in priority order):

1. **Environment Variables**:
   ```powershell
   $env:DB_USER = "root"
   $env:DB_PASSWORD = "your_actual_mysql_password"
   $env:DB_URL = "jdbc:mysql://localhost:3306/movie_booking_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
   ```

2. **Optional `db.properties` File**:
   Copy `db.properties.example` to `db.properties` in the project root:
   ```properties
   db.url=jdbc:mysql://localhost:3306/movie_booking_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   db.user=root
   db.password=your_password_here
   ```

3. **Built-in Defaults**:
   Defaults to `localhost:3306/movie_booking_db` with user `root` and blank password.

---

## 5. Build and Run

```powershell
mvn clean compile
mvn exec:java
```
