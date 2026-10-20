# Online Movie Ticket Booking System

A complete, console-based **Online Movie Ticket Booking System** built with **Core Java, JDBC, MySQL 8, and Maven**.

## 1. Project Overview

CineBook allows users to view movies and showtimes, inspect a seat map, book multiple seats, apply the `CINE10` discount coupon, and cancel bookings. Movie, show, seat, and booking information is stored in MySQL.

## 2. Features

1. **View All Movies**: Displays movie ID, name, genre, duration, and language.
2. **View All Shows**: Displays show ID, movie name, date, and time.
3. **View Available Seats**: Displays a 5 × 8 seat map; `O` means available and `X` means booked.
4. **Book Movie Tickets**: Validates seats and records a booking.
5. **Coupon Support**: `CINE10` gives 10% off.
6. **Cancel Booking**: Marks a booking cancelled and releases its seats.
7. **Database Persistence**: Stores records in MySQL using JDBC `PreparedStatement`s.

## 3. Technology Stack

- **Language**: Java 17
- **Database**: MySQL 8
- **Connectivity**: JDBC with MySQL Connector/J 8.3.0
- **Build Tool**: Apache Maven
- **IDE**: Visual Studio Code

## 4. Folder Structure

```text
MovieTicketBookingSystem/
├── pom.xml
├── README.md
├── database/
│   ├── schema.sql
│   └── sample_data.sql
└── src/main/java/com/moviebooking/
    ├── Main.java
    ├── config/DBConnection.java
    ├── model/
    │   ├── Movie.java
    │   ├── Show.java
    │   ├── Seat.java
    │   └── Booking.java
    ├── dao/
    │   ├── MovieDAO.java
    │   ├── ShowDAO.java
    │   ├── SeatDAO.java
    │   └── BookingDAO.java
    ├── service/BookingService.java
    └── util/InputHelper.java
```

## 5. Database Tables

- `movies`: movie details.
- `shows`: movie show dates and times.
- `seats`: seat code, category, price, and availability for each show.
- `bookings`: customer name, show, selected seat codes, coupon, amount, and status.

## 6. Database Setup

Run `database/schema.sql` in MySQL Workbench. If you already created the tables, do not run it again to replace your existing schema.

For a fresh database, run `database/sample_data.sql` once after the schema. If sample data is already inserted, do not run the sample script again because it will create duplicate rows.

## 7. Configure Database Credentials

PowerShell, for the current terminal session:

```powershell
$env:DB_USER = "root"
$env:DB_PASSWORD = "your_actual_mysql_password"
```

Optional database URL:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/movie_booking_db?useSSL=false&serverTimezone=UTC"
```

## 8. Build and Run

Open the project root folder in VS Code, then run:

```powershell
mvn clean compile
mvn exec:java
```

Install JDK 17+ and Maven first. Install the VS Code **Extension Pack for Java** for IDE support.

## 9. Main Menu

```text
============== CINEBOOK MENU ==============
1. View All Movies
2. View All Shows
3. View Available Seats
4. Book Movie Tickets
5. Cancel Booking
0. Exit
============================================
```

## 10. Seat Pricing

| Rows | Category | Price |
|---|---|---:|
| A–B | REGULAR | Rs. 150 |
| C–D | PREMIUM | Rs. 250 |
| E | VIP | Rs. 400 |

## 11. Common Issues

| Issue | Solution |
|---|---|
| `mvn` is not recognized | Install Maven and add it to `PATH`, then reopen the terminal. |
| `Access denied for user` | Set the correct `DB_USER` and `DB_PASSWORD`. |
| `Unknown database` | Execute `database/schema.sql` in Workbench. |
| `Communications link failure` | Start MySQL Server and verify port 3306. |
| `Seat is unavailable or invalid` | Check the show ID and seat map; choose an available seat. |

## 12. Viva Questions

1. **Why use JDBC?** JDBC connects Java code to MySQL and allows SQL queries to be executed from the application.
2. **Why use `PreparedStatement`?** It binds user input as parameters and helps prevent SQL injection.
3. **Why use a transaction for booking?** The booking record and seat updates should succeed together or roll back together.
4. **How does cancellation work?** The booking status changes to `CANCELLED` and the selected seats become available again.
5. **How does `CINE10` work?** It reduces the total seat price by 10%.
