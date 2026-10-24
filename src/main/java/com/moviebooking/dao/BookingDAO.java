package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {
    public int createBooking(String customerName, int movieId, int showId,
                             List<String> seatCodes, String couponCode,
                             BigDecimal total) throws SQLException {
        if (seatCodes == null || seatCodes.isEmpty()) throw new SQLException("Select at least one seat.");

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                List<Integer> seatIds = new ArrayList<>();
                BigDecimal calculated = BigDecimal.ZERO;

                
String selectSql = """
    SELECT seat_id, price FROM seats
    WHERE show_id = ? AND seat_code = ? AND seat_status = 'AVAILABLE'
    FOR UPDATE
    """;

try (PreparedStatement ps = con.prepareStatement(selectSql)) {
    for (String code : seatCodes) {
        ps.setInt(1, showId);
        ps.setString(2, code);
        try (ResultSet rs = ps.executeQuery()) {
            if (!rs.next()) {
                throw new SQLException(
                    "Seat " + code + " is unavailable or invalid."
                );
            }

            // Save the seat ID so its status can be updated
            seatIds.add(rs.getInt("seat_id"));

            // Add the actual seat price to the booking total
            calculated = calculated.add(rs.getBigDecimal("price"));
        }
    }
}


                if (couponCode != null && couponCode.equalsIgnoreCase("CINE10")) {
                    calculated = calculated.multiply(new BigDecimal("0.90")).setScale(2, java.math.RoundingMode.HALF_UP);
                }
                total = calculated;

                String bookingSql = """
                    INSERT INTO bookings
                    (customer_name, movie_id, show_id, seat_codes, coupon_code, total_amount, booking_status)
                    VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
                    """;
                int bookingId;
                try (PreparedStatement ps = con.prepareStatement(bookingSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, customerName);
                    ps.setInt(2, movieId);
                    ps.setInt(3, showId);
                    ps.setString(4, String.join(",", seatCodes));
                    ps.setString(5, (couponCode == null || couponCode.isBlank()) ? null : couponCode);
                    ps.setBigDecimal(6, total);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) throw new SQLException("Could not retrieve booking ID.");
                        bookingId = keys.getInt(1);
                    }
                }

                String updateSql = "UPDATE seats SET seat_status = 'BOOKED' WHERE seat_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateSql)) {
                    for (int id : seatIds) {
                        ps.setInt(1, id);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }

                con.commit();
                return bookingId;
            } catch (SQLException | RuntimeException ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public boolean cancelBooking(int bookingId) throws SQLException {
        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String findSql = "SELECT seat_codes, booking_status FROM bookings WHERE booking_id = ? FOR UPDATE";
                String seatCodes;
                try (PreparedStatement ps = con.prepareStatement(findSql)) {
                    ps.setInt(1, bookingId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next() || !"CONFIRMED".equals(rs.getString("booking_status"))) {
                            con.rollback();
                            return false;
                        }
                        seatCodes = rs.getString("seat_codes");
                    }
                }

                String updateBooking = "UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateBooking)) {
                    ps.setInt(1, bookingId);
                    ps.executeUpdate();
                }

                String[] codes = seatCodes.split(",");
                String updateSeats = "UPDATE seats SET seat_status = 'AVAILABLE' WHERE seat_code = ? AND show_id = (SELECT show_id FROM bookings WHERE booking_id = ?)";
                try (PreparedStatement ps = con.prepareStatement(updateSeats)) {
                    for (String code : codes) {
                        ps.setString(1, code.trim());
                        ps.setInt(2, bookingId);
                        ps.addBatch();
                    }
                    ps.executeBatch();
                }
                con.commit();
                return true;
            } catch (SQLException | RuntimeException ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public List<com.moviebooking.model.MovieBookingDetail> findBookingsByCustomer(String customerName) throws SQLException {
        String sql = """
            SELECT b.booking_id, b.customer_name, m.movie_name,
                   t.theatre_name, s.show_date, s.show_time,
                   b.seat_codes, b.total_amount, b.booking_status, b.booking_date
            FROM bookings b
            JOIN movies m ON b.movie_id = m.movie_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE b.customer_name = ?
            ORDER BY b.booking_id DESC
            """;
        List<com.moviebooking.model.MovieBookingDetail> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, customerName);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Timestamp ts = rs.getTimestamp("booking_date");
                    list.add(new com.moviebooking.model.MovieBookingDetail(
                            rs.getInt("booking_id"),
                            rs.getString("customer_name"),
                            rs.getString("movie_name"),
                            rs.getString("theatre_name"),
                            rs.getDate("show_date").toLocalDate(),
                            rs.getTime("show_time").toLocalTime(),
                            rs.getString("seat_codes"),
                            rs.getBigDecimal("total_amount"),
                            rs.getString("booking_status"),
                            ts != null ? ts.toLocalDateTime() : null
                    ));
                }
            }
        }
        return list;
    }

    public com.moviebooking.model.MovieBookingDetail findDetailById(int bookingId) throws SQLException {
        String sql = """
            SELECT b.booking_id, b.customer_name, m.movie_name,
                   t.theatre_name, s.show_date, s.show_time,
                   b.seat_codes, b.total_amount, b.booking_status, b.booking_date
            FROM bookings b
            JOIN movies m ON b.movie_id = m.movie_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE b.booking_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Timestamp ts = rs.getTimestamp("booking_date");
                    return new com.moviebooking.model.MovieBookingDetail(
                            rs.getInt("booking_id"),
                            rs.getString("customer_name"),
                            rs.getString("movie_name"),
                            rs.getString("theatre_name"),
                            rs.getDate("show_date").toLocalDate(),
                            rs.getTime("show_time").toLocalTime(),
                            rs.getString("seat_codes"),
                            rs.getBigDecimal("total_amount"),
                            rs.getString("booking_status"),
                            ts != null ? ts.toLocalDateTime() : null
                    );
                }
            }
        }
        return null;
    }
}

