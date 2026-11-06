package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.PartyBooking;
import com.moviebooking.model.PartyConcert;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PartyConcertDAO {

    public List<PartyConcert> findAll() throws SQLException {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description,
                   COALESCE(city, 'Chennai') AS city
            FROM parties_concerts
            ORDER BY event_id ASC
            """;
        List<PartyConcert> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapPartyConcert(rs));
            }
        }
        return list;
    }

    public List<PartyConcert> findByCity(String city) throws SQLException {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description,
                   COALESCE(city, 'Chennai') AS city
            FROM parties_concerts
            WHERE LOWER(city) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?)
            ORDER BY event_id ASC
            """;
        List<PartyConcert> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, "%" + city + "%");
            ps.setString(2, "%" + city + "%");
            ps.setString(3, "%" + city + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPartyConcert(rs));
                }
            }
        }
        return list;
    }

    public List<PartyConcert> findByCategory(String category) throws SQLException {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description,
                   COALESCE(city, 'Chennai') AS city
            FROM parties_concerts
            WHERE category = ?
            ORDER BY event_id ASC
            """;
        List<PartyConcert> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPartyConcert(rs));
                }
            }
        }
        return list;
    }

    public PartyConcert findById(int eventId) throws SQLException {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description,
                   COALESCE(city, 'Chennai') AS city
            FROM parties_concerts
            WHERE event_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapPartyConcert(rs);
            }
        }
        return null;
    }

    public int bookTickets(String customerName, String userEmail, int eventId, int count) throws SQLException {
        if (count <= 0) throw new IllegalArgumentException("Tickets count must be greater than zero.");

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String checkSql = "SELECT ticket_price, available_slots FROM parties_concerts WHERE event_id = ? FOR UPDATE";
                BigDecimal price;
                int available;
                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, eventId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new IllegalArgumentException("Party / concert event ID " + eventId + " not found.");
                        price = rs.getBigDecimal("ticket_price");
                        available = rs.getInt("available_slots");
                    }
                }

                if (available < count) {
                    throw new IllegalStateException("Only " + available + " tickets left for this event.");
                }

                String deductSql = "UPDATE parties_concerts SET available_slots = available_slots - ? WHERE event_id = ?";
                try (PreparedStatement ps = con.prepareStatement(deductSql)) {
                    ps.setInt(1, count);
                    ps.setInt(2, eventId);
                    ps.executeUpdate();
                }

                BigDecimal total = price.multiply(BigDecimal.valueOf(count));
                String insertSql = """
                    INSERT INTO party_bookings (customer_name, user_email, event_id, tickets_count, total_amount, booking_status)
                    VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
                    """;
                int bookingId;
                try (PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, customerName);
                    ps.setString(2, userEmail);
                    ps.setInt(3, eventId);
                    ps.setInt(4, count);
                    ps.setBigDecimal(5, total);
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) bookingId = rs.getInt(1);
                        else throw new SQLException("Failed to retrieve generated booking ID.");
                    }
                }

                con.commit();
                return bookingId;
            } catch (Exception ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public boolean cancelPartyBooking(int bookingId) throws SQLException {
        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String checkSql = "SELECT event_id, tickets_count, booking_status FROM party_bookings WHERE booking_id = ? FOR UPDATE";
                int eventId;
                int count;
                String status;
                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, bookingId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) return false;
                        eventId = rs.getInt("event_id");
                        count = rs.getInt("tickets_count");
                        status = rs.getString("booking_status");
                    }
                }

                if ("CANCELLED".equalsIgnoreCase(status)) {
                    con.rollback();
                    return false;
                }

                String updateSql = "UPDATE party_bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateSql)) {
                    ps.setInt(1, bookingId);
                    ps.executeUpdate();
                }

                String restoreSql = "UPDATE parties_concerts SET available_slots = available_slots + ? WHERE event_id = ?";
                try (PreparedStatement ps = con.prepareStatement(restoreSql)) {
                    ps.setInt(1, count);
                    ps.setInt(2, eventId);
                    ps.executeUpdate();
                }

                con.commit();
                return true;
            } catch (Exception ex) {
                con.rollback();
                throw ex;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public boolean cancelBooking(int bookingId) throws SQLException {
        return cancelPartyBooking(bookingId);
    }

    public List<PartyBooking> findBookingsByUser(String userEmail) throws SQLException {
        String sql = """
            SELECT b.booking_id, b.customer_name, b.user_email, b.event_id,
                   e.title, e.artist_performer, e.venue, e.event_date, e.event_time,
                   b.tickets_count, b.total_amount, b.booking_status, b.booking_date
            FROM party_bookings b
            JOIN parties_concerts e ON e.event_id = b.event_id
            WHERE LOWER(b.user_email) = LOWER(?)
            ORDER BY b.booking_id DESC
            """;
        List<PartyBooking> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPartyBooking(rs));
                }
            }
        }
        return list;
    }

    public PartyBooking findBookingById(int bookingId) throws SQLException {
        String sql = """
            SELECT b.booking_id, b.customer_name, b.user_email, b.event_id,
                   e.title, e.artist_performer, e.venue, e.event_date, e.event_time,
                   b.tickets_count, b.total_amount, b.booking_status, b.booking_date
            FROM party_bookings b
            JOIN parties_concerts e ON e.event_id = b.event_id
            WHERE b.booking_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapPartyBooking(rs);
            }
        }
        return null;
    }

    public List<PartyConcert> search(String keyword) throws SQLException {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description,
                   COALESCE(city, 'Chennai') AS city
            FROM parties_concerts
            WHERE LOWER(title) LIKE LOWER(?) OR LOWER(artist_performer) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?)
            ORDER BY event_id ASC
            """;
        String pattern = "%" + keyword + "%";
        List<PartyConcert> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            ps.setString(4, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPartyConcert(rs));
                }
            }
        }
        return list;
    }

    private PartyConcert mapPartyConcert(ResultSet rs) throws SQLException {
        return new PartyConcert(
                rs.getInt("event_id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("artist_performer"),
                rs.getString("venue"),
                rs.getString("location"),
                rs.getDate("event_date").toLocalDate(),
                rs.getTime("event_time").toLocalTime(),
                rs.getBigDecimal("ticket_price"),
                rs.getInt("total_capacity"),
                rs.getInt("available_slots"),
                rs.getString("description"),
                rs.getString("city")
        );
    }

    private PartyBooking mapPartyBooking(ResultSet rs) throws SQLException {
        Timestamp ts = rs.getTimestamp("booking_date");
        return new PartyBooking(
                rs.getInt("booking_id"),
                rs.getString("customer_name"),
                rs.getString("user_email"),
                rs.getInt("event_id"),
                rs.getString("title"),
                rs.getString("artist_performer"),
                rs.getString("venue"),
                rs.getDate("event_date").toLocalDate(),
                rs.getTime("event_time").toLocalTime(),
                rs.getInt("tickets_count"),
                rs.getBigDecimal("total_amount"),
                rs.getString("booking_status"),
                ts != null ? ts.toLocalDateTime() : null
        );
    }
}
