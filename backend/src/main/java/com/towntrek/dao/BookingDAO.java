package com.towntrek.dao;

import com.towntrek.model.MovieBookingDetail;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.*;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;

    public BookingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int createBooking(String customerName, int movieId, int showId,
                             List<String> seatCodes, String couponCode) throws Exception {
        return createBooking(customerName, "", movieId, showId, seatCodes, couponCode);
    }

    @Transactional(rollbackFor = Exception.class)
    public int createBooking(String customerName, String customerEmail, int movieId, int showId,
                             List<String> seatCodes, String couponCode) throws Exception {
        if (seatCodes == null || seatCodes.isEmpty()) {
            throw new IllegalArgumentException("Select at least one seat.");
        }

        List<Integer> seatIds = new ArrayList<>();
        BigDecimal calculated = BigDecimal.ZERO;

        String selectSql = """
            SELECT seat_id, price FROM seats
            WHERE show_id = ? AND seat_code = ? AND seat_status = 'AVAILABLE'
            FOR UPDATE
            """;

        for (String code : seatCodes) {
            List<SeatInfo> available = jdbcTemplate.query(selectSql, (rs, rowNum) ->
                    new SeatInfo(rs.getInt("seat_id"), rs.getBigDecimal("price")), showId, code);

            if (available.isEmpty()) {
                throw new IllegalStateException("Seat " + code + " is unavailable or already booked.");
            }

            seatIds.add(available.get(0).id);
            calculated = calculated.add(available.get(0).price);
        }

        // Apply coupon discount if eligible
        if (couponCode != null && couponCode.trim().equalsIgnoreCase("CINE10")) {
            calculated = calculated.multiply(new BigDecimal("0.90")).setScale(2, RoundingMode.HALF_UP);
        }

        // Lock and update seat statuses to BOOKED
        String updateSeatSql = "UPDATE seats SET seat_status = 'BOOKED' WHERE seat_id = ?";
        for (Integer sId : seatIds) {
            jdbcTemplate.update(updateSeatSql, sId);
        }

        String seatCodesJoined = String.join(", ", seatCodes);
        final BigDecimal finalTotal = calculated;
        final String finalEmail = customerEmail != null ? customerEmail.trim() : "";
        final String finalName = customerName != null && !customerName.isBlank() ? customerName.trim() : "TownTrek Guest";

        KeyHolder keyHolder = new GeneratedKeyHolder();

        // 1. Try inserting with customer_email column
        try {
            String insertSqlWithEmail = """
                INSERT INTO bookings (customer_name, customer_email, movie_id, show_id, seat_codes, coupon_code, total_amount, booking_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')
                """;
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(insertSqlWithEmail, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, finalName);
                ps.setString(2, finalEmail);
                ps.setInt(3, movieId);
                ps.setInt(4, showId);
                ps.setString(5, seatCodesJoined);
                ps.setString(6, couponCode != null && !couponCode.isBlank() ? couponCode.trim() : null);
                ps.setBigDecimal(7, finalTotal);
                return ps;
            }, keyHolder);
        } catch (DataAccessException ex) {
            // Fallback without customer_email column if migration hasn't run yet
            String fallbackSql = """
                INSERT INTO bookings (customer_name, movie_id, show_id, seat_codes, coupon_code, total_amount, booking_status)
                VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
                """;
            jdbcTemplate.update(con -> {
                PreparedStatement ps = con.prepareStatement(fallbackSql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, finalName);
                ps.setInt(2, movieId);
                ps.setInt(3, showId);
                ps.setString(4, seatCodesJoined);
                ps.setString(5, couponCode != null && !couponCode.isBlank() ? couponCode.trim() : null);
                ps.setBigDecimal(6, finalTotal);
                return ps;
            }, keyHolder);
        }

        return Objects.requireNonNull(keyHolder.getKey()).intValue();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean cancelBooking(int bookingId) {
        String selectSql = "SELECT show_id, seat_codes, booking_status FROM bookings WHERE booking_id = ? FOR UPDATE";
        List<BookingCancelData> list = jdbcTemplate.query(selectSql, (rs, rowNum) ->
                new BookingCancelData(rs.getInt("show_id"), rs.getString("seat_codes"), rs.getString("booking_status")), bookingId);

        if (list.isEmpty()) {
            return false;
        }

        BookingCancelData info = list.get(0);
        if ("CANCELLED".equalsIgnoreCase(info.status)) {
            return true; // Already cancelled safely
        }

        // Mark booking cancelled
        jdbcTemplate.update("UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?", bookingId);

        // Release seats directly by show_id
        if (info.seatCodes != null && !info.seatCodes.isBlank()) {
            String[] codes = info.seatCodes.split(",");
            String updateSeats = "UPDATE seats SET seat_status = 'AVAILABLE' WHERE seat_code = ? AND show_id = ?";
            for (String code : codes) {
                if (!code.trim().isEmpty()) {
                    jdbcTemplate.update(updateSeats, code.trim(), info.showId);
                }
            }
        }

        return true;
    }

    private static class BookingCancelData {
        final int showId;
        final String seatCodes;
        final String status;
        BookingCancelData(int showId, String seatCodes, String status) {
            this.showId = showId;
            this.seatCodes = seatCodes;
            this.status = status;
        }
    }

    public List<MovieBookingDetail> findAllBookings() {
        String sql = """
            SELECT b.booking_id, b.customer_name, m.movie_name,
                   t.theatre_name, s.show_date, s.show_time,
                   b.seat_codes, b.total_amount, b.booking_status, b.booking_date
            FROM bookings b
            JOIN movies m ON b.movie_id = m.movie_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            ORDER BY b.booking_id DESC
            """;
        return jdbcTemplate.query(sql, this::mapMovieBookingDetail);
    }

    public List<MovieBookingDetail> findBookingsByCustomer(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            return findAllBookings();
        }
        return findBookingsForUser(List.of(customerName), List.of(), List.of());
    }

    /**
     * Comprehensive smart finder that matches user passes by:
     * 1. Specific booking IDs
     * 2. Email addresses (exact or partial)
     * 3. Customer name (bidirectional matching: e.g. "Arav" matches "Aravindh Murugesh" and vice-versa)
     * 4. Split name parts (first name / last name)
     */
    public List<MovieBookingDetail> findBookingsForUser(List<String> names, List<String> emails, List<Integer> specificIds) {
        List<MovieBookingDetail> all = findAllBookings();
        if (all.isEmpty()) return all;

        Set<Integer> targetIds = new HashSet<>(specificIds != null ? specificIds : List.of());

        Set<String> cleanEmails = new HashSet<>();
        if (emails != null) {
            for (String e : emails) {
                if (e != null && !e.isBlank()) cleanEmails.add(e.trim().toLowerCase());
            }
        }

        Set<String> cleanNames = new HashSet<>();
        if (names != null) {
            for (String n : names) {
                if (n != null && !n.isBlank()) {
                    String clean = n.trim().toLowerCase();
                    cleanNames.add(clean);
                    // Also add name tokens (e.g. "aravindh" from "aravindh murugesh")
                    String[] tokens = clean.split("[\\s_.-]+");
                    for (String token : tokens) {
                        if (token.length() >= 3) {
                            cleanNames.add(token);
                        }
                    }
                }
            }
        }

        // Filter all bookings using resilient matching
        List<MovieBookingDetail> matched = new ArrayList<>();
        for (MovieBookingDetail b : all) {
            boolean isMatch = false;

            // 1. Direct ID match
            if (targetIds.contains(b.getBookingId())) {
                isMatch = true;
            }

            // 2. Email match
            if (!isMatch && b.getCustomerEmail() != null && !b.getCustomerEmail().isBlank()) {
                String bEmail = b.getCustomerEmail().trim().toLowerCase();
                if (cleanEmails.contains(bEmail)) {
                    isMatch = true;
                }
            }

            // 3. Name or Email substring match
            if (!isMatch && b.getCustomerName() != null && !b.getCustomerName().isBlank()) {
                String bName = b.getCustomerName().trim().toLowerCase();

                // Check direct match
                if (cleanNames.contains(bName) || cleanEmails.contains(bName)) {
                    isMatch = true;
                }

                // Check bidirectional substring match
                if (!isMatch) {
                    for (String queryName : cleanNames) {
                        if (bName.contains(queryName) || queryName.contains(bName)) {
                            isMatch = true;
                            break;
                        }
                    }
                }

                // Check if user's email username matches booking name (e.g. "arav" from "arav@gmail.com")
                if (!isMatch) {
                    for (String email : cleanEmails) {
                        String prefix = email.split("@")[0];
                        if (prefix.length() >= 3 && (bName.contains(prefix) || prefix.contains(bName))) {
                            isMatch = true;
                            break;
                        }
                    }
                }
            }

            if (isMatch) {
                matched.add(b);
            }
        }

        return matched;
    }

    public MovieBookingDetail findDetailById(int bookingId) {
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
        List<MovieBookingDetail> list = jdbcTemplate.query(sql, this::mapMovieBookingDetail, bookingId);
        return list.isEmpty() ? null : list.get(0);
    }

    private MovieBookingDetail mapMovieBookingDetail(ResultSet rs, int rowNum) throws SQLException {
        Timestamp ts = rs.getTimestamp("booking_date");
        String email = "";
        try {
            email = rs.getString("customer_email");
            if (email == null) email = "";
        } catch (Exception ignored) {
            // column not in result set
        }

        return new MovieBookingDetail(
                rs.getInt("booking_id"),
                rs.getString("customer_name"),
                email,
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

    private static class SeatInfo {
        final int id;
        final BigDecimal price;
        SeatInfo(int id, BigDecimal price) { this.id = id; this.price = price; }
    }

    private static class BookingStatusInfo {
        final String seatCodes;
        final String status;
        BookingStatusInfo(String seatCodes, String status) { this.seatCodes = seatCodes; this.status = status; }
    }
}
