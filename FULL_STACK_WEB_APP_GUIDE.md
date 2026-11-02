# TownTrek Full-Stack Web Application

TownTrek has been completely converted into a modern, full-stack web application connecting directly to your existing MySQL database (`movie_booking_db`).

---

## 1. Project Structure

```
Movie Ticket Booking System/
├── backend/                       # Spring Boot 3.2.5 REST API Backend
│   ├── src/main/java/com/towntrek/
│   │   ├── TownTrekApplication.java
│   │   ├── config/                # CorsConfig, WebMvc
│   │   ├── controller/            # AuthController, MovieController, PartyController,
│   │   │                          # EventController, GuideController, BookingManagementController, SearchController
│   │   ├── dao/                   # AuthDAO, MovieDAO, ShowDAO, SeatDAO, BookingDAO,
│   │   │                          # PartyConcertDAO, DistrictEventDAO, CitySpotDAO, TouristAttractionDAO, EmergencyServiceDAO
│   │   ├── dto/                   # RegisterRequest, LoginRequest, AuthResponse, MovieBookingRequest, PartyBookingRequest, etc.
│   │   ├── model/                 # Entity POJOs (Movie, Show, Seat, PartyConcert, DistrictEvent, etc.)
│   │   └── util/                  # PasswordUtil (PBKDF2 Salt/Hash), JwtUtil
│   ├── src/main/resources/
│   │   └── application.properties # Database connection settings & JWT secret
│   └── pom.xml
│
├── frontend/                      # React 18 + Vite + TypeScript + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/            # Navbar, Footer, SeatMap
│   │   ├── context/               # AuthContext (JWT session state & user profile)
│   │   ├── pages/                 # HomePage, MoviesPage, MovieDetailPage, EntertainmentPage,
│   │   │                          # EventsPage, TouristAttractionsPage, DiningShoppingPage, EmergencyServicesPage, MyPassesPage, SearchPage, LoginPage, RegisterPage
│   │   ├── services/              # Axios API client with automatic Bearer token injection
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
└── database/
    └── migration_district_towntrek.sql  # Complete 13-table schema & test data
```

---

## 2. How to Run the Application

### Step 1: Ensure MySQL is running
Make sure your local MySQL instance is running and your database is imported:
```bash
mysql -u root -p < database/migration_district_towntrek.sql
```
*(If your MySQL password is not blank, you can set it via `$env:DB_PASSWORD = "your_password"` or in `backend/src/main/resources/application.properties`)*

---

### Step 2: Start the Spring Boot Backend (Port 8080)
Open a terminal in the project root:
```bash
cd backend
mvn spring-boot:run
```
The REST API will be available at `http://localhost:8080/api`.

---

### Step 3: Start the React Frontend (Port 5173)
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 3. Features Implemented & Connected to MySQL

1. **Authentication & Security**:
   - Registration and Login with PBKDF2 salt + 210,000 iterations.
   - JWT token generation and storage in local context.
   - Pre-seeded test account: `arav@district.com` (Password: `password123`).

2. **Movies & Interactive Seat Booking**:
   - Real-time movie listing and show schedule fetching from MySQL.
   - Interactive 5 × 8 screen seat map with live status (`AVAILABLE` vs `BOOKED`).
   - Pessimistic locking (`FOR UPDATE`) in `BookingDAO` preventing race conditions.
   - Dynamic coupon calculation (`CINE10` provides 10% discount).
   - Generates digital cinema pass with Booking ID.

3. **Parties, Concerts & Comedy Shows**:
   - Filter by `CONCERT`, `CLUB_PARTY`, and `COMEDY_NIGHT`.
   - Pass reservation with live slot decrements and capacity checking.

4. **Events & Workshops**:
   - Filter by `WORKSHOP`, `FOOD_FEST`, `SPORTS`, and `CULTURAL`.
   - RSVP registrations with instant spot reservation and capacity limits.

5. **Tourist Landmarks, Dining & Emergency Directory**:
   - Heritage monuments, museums, botanical gardens with timings and fees.
   - Fine dining, cafes, malls, street food hubs, and local bazaars.
   - 24/7 rapid dispatch helplines (112, 100, 108) with one-click dial links.

6. **Unified Passes Dashboard**:
   - Consolidated ticket manager displaying movies, concerts, and workshops for the user.
   - One-click cancellation with immediate seat/slot release in MySQL.

7. **City Quick Search**:
   - Real-time keyword search across landmarks, dining spots, concerts, and events.

