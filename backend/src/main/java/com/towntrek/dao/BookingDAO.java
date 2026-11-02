package com.towntrek.dao;

import com.towntrek.model.MovieBookingDetail;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Repository
public class BookingDAO {

    private final JdbcTemplate jdbcTemplate;

    public BookingDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(rollbackFor = Exception.class)
    public int createBooking(String customerName, int movieId, int showId,
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

        // Insert booking record
        String insertSql = """
            INSERT INTO bookings (customer_name, movie_id, show_id, seat_codes, coupon_code, total_amount, booking_status)
            VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
            """;

        String seatCodesJoined = String.join(", ", seatCodes);
        final BigDecimal finalTotal = calculated;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, customerName);
            ps.setInt(2, movieId);
            ps.setInt(3, showId);
            ps.setString(4, seatCodesJoined);
            ps.setString(5, couponCode != null && !couponCode.isBlank() ? couponCode.trim() : null);
            ps.setBigDecimal(6, finalTotal);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().intValue();
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean cancelBooking(int bookingId) {
        String selectSql = "SELECT seat_codes, booking_status FROM bookings WHERE booking_id = ? FOR UPDATE";
        List<BookingStatusInfo> list = jdbcTemplate.query(selectSql, (rs, rowNum) ->
                new BookingStatusInfo(rs.getString("seat_codes"), rs.getString("booking_status")), bookingId);

        if (list.isEmpty() || !"CONFIRMED".equalsIgnoreCase(list.get(0).status)) {
            return false;
        }

        String seatCodes = list.get(0).seatCodes;

        // Mark booking cancelled
        jdbcTemplate.update("UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?", bookingId);

        // Release seats
        String[] codes = seatCodes.split(",");
        String updateSeats = """
            UPDATE seats SET seat_status = 'AVAILABLE'
            WHERE seat_code = ? AND show_id = (SELECT show_id FROM bookings WHERE booking_id = ?)
            """;
        for (String code : codes) {
            jdbcTemplate.update(updateSeats, code.trim(), bookingId);
        }

        return true;
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
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("booking_date");
            return new MovieBookingDetail(
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
        });
    }

    public List<MovieBookingDetail> findBookingsByCustomer(String customerName) {
        if (customerName == null || customerName.isBlank()) {
            return findAllBookings();
        }
        String sql = """
            SELECT b.booking_id, b.customer_name, m.movie_name,
                   t.theatre_name, s.show_date, s.show_time,
                   b.seat_codes, b.total_amount, b.booking_status, b.booking_date
            FROM bookings b
            JOIN movies m ON b.movie_id = m.movie_id
            JOIN shows s ON b.show_id = s.show_id
            JOIN theatres t ON s.theatre_id = t.theatre_id
            WHERE LOWER(TRIM(b.customer_name)) = LOWER(TRIM(?))
               OR LOWER(b.customer_name) LIKE LOWER(?)
            ORDER BY b.booking_id DESC
            """;
        String trimmed = customerName.trim();
        String wildcard = "%" + trimmed + "%";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("booking_date");
            return new MovieBookingDetail(
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
        }, trimmed, wildcard);
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
        List<MovieBookingDetail> list = jdbcTemplate.query(sql, (rs, rowNum) -> {
            Timestamp ts = rs.getTimestamp("booking_date");
            return new MovieBookingDetail(
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
        }, bookingId);
        return list.isEmpty() ? null : list.get(0);
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
