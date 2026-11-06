package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.TownTrekEvent;
import com.moviebooking.model.EventRegistration;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TownTrekEventDAO {

    public List<TownTrekEvent> findAll() throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            ORDER BY event_id ASC
            """;
        List<TownTrekEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapTownTrekEvent(rs));
            }
        }
        return list;
    }

    public List<TownTrekEvent> findByCity(String city) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE LOWER(city) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?)
            ORDER BY event_id ASC
            """;
        List<TownTrekEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, "%" + city + "%");
            ps.setString(2, "%" + city + "%");
            ps.setString(3, "%" + city + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapTownTrekEvent(rs));
                }
            }
        }
        return list;
    }

    public List<TownTrekEvent> findByCategory(String category) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE category = ?
            ORDER BY event_id ASC
            """;
        List<TownTrekEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapTownTrekEvent(rs));
                }
            }
        }
        return list;
    }

    public TownTrekEvent findById(int eventId) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE event_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapTownTrekEvent(rs);
            }
        }
        return null;
    }

    public int registerAttendees(String customerName, String userEmail, int eventId, int count) throws SQLException {
        if (count <= 0) throw new IllegalArgumentException("Attendee count must be greater than zero.");

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String lockSql = "SELECT entry_fee, max_capacity, registered_count FROM towntrek_events WHERE event_id = ? FOR UPDATE";
                BigDecimal fee;
                int maxCap;
                int registered;
                try (PreparedStatement ps = con.prepareStatement(lockSql)) {
                    ps.setInt(1, eventId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new IllegalArgumentException("Event / workshop ID " + eventId + " not found.");
                        fee = rs.getBigDecimal("entry_fee");
                        maxCap = rs.getInt("max_capacity");
                        registered = rs.getInt("registered_count");
                    }
                }

                if (registered + count > maxCap) {
                    int remaining = Math.max(0, maxCap - registered);
                    throw new IllegalStateException("Capacity exceeded. Only " + remaining + " seat(s) remaining for this workshop.");
                }

                String updateSql = "UPDATE towntrek_events SET registered_count = registered_count + ? WHERE event_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateSql)) {
                    ps.setInt(1, count);
                    ps.setInt(2, eventId);
                    ps.executeUpdate();
                }

                BigDecimal totalFee = fee.multiply(BigDecimal.valueOf(count));
                String insertSql = """
                    INSERT INTO event_registrations (customer_name, user_email, event_id, attendee_count, total_fee, status)
                    VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
                    """;
                int regId;
                try (PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, customerName);
                    ps.setString(2, userEmail);
                    ps.setInt(3, eventId);
                    ps.setInt(4, count);
                    ps.setBigDecimal(5, totalFee);
                    ps.executeUpdate();
                    try (ResultSet rs = ps.getGeneratedKeys()) {
                        if (rs.next()) regId = rs.getInt(1);
                        else throw new SQLException("Failed to retrieve generated registration ID.");
                    }
                }

                con.commit();
                return regId;
            } catch (SQLException | RuntimeException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    public int register(String customerName, String userEmail, int eventId, int attendees) throws SQLException {
        return registerAttendees(customerName, userEmail, eventId, attendees);
    }

    public List<EventRegistration> findRegistrationsByUser(String userEmail) throws SQLException {
        String sql = """
            SELECT r.reg_id, r.customer_name, r.user_email, r.event_id,
                   e.title, e.venue, e.event_date, e.event_time,
                   r.attendee_count, r.total_fee, r.status,
                   COALESCE(r.registration_date, CURRENT_TIMESTAMP) AS reg_date
            FROM event_registrations r
            JOIN towntrek_events e ON e.event_id = r.event_id
            WHERE LOWER(r.user_email) = LOWER(?)
            ORDER BY r.reg_id DESC
            """;
        List<EventRegistration> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, userEmail);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapRegistration(rs));
                }
            }
        }
        return list;
    }

    public EventRegistration findRegistrationById(int regId) throws SQLException {
        String sql = """
            SELECT r.reg_id, r.customer_name, r.user_email, r.event_id,
                   e.title, e.venue, e.event_date, e.event_time,
                   r.attendee_count, r.total_fee, r.status,
                   COALESCE(r.registration_date, CURRENT_TIMESTAMP) AS reg_date
            FROM event_registrations r
            JOIN towntrek_events e ON e.event_id = r.event_id
            WHERE r.reg_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, regId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapRegistration(rs);
            }
        }
        return null;
    }

    public List<TownTrekEvent> search(String keyword) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE LOWER(title) LIKE LOWER(?) OR LOWER(venue) LIKE LOWER(?) OR LOWER(location) LIKE LOWER(?) OR LOWER(city) LIKE LOWER(?)
            ORDER BY event_id ASC
            """;
        String pattern = "%" + keyword + "%";
        List<TownTrekEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            ps.setString(4, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapTownTrekEvent(rs));
                }
            }
        }
        return list;
    }

    public boolean cancelRegistration(int regId) throws SQLException {
        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String checkSql = "SELECT event_id, attendee_count, status FROM event_registrations WHERE reg_id = ? FOR UPDATE";
                int eventId;
                int attendees;
                String status;
                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, regId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) return false;
                        eventId = rs.getInt("event_id");
                        attendees = rs.getInt("attendee_count");
                        status = rs.getString("status");
                    }
                }

                if ("CANCELLED".equalsIgnoreCase(status)) {
                    con.rollback();
                    return false;
                }

                String updateReg = "UPDATE event_registrations SET status = 'CANCELLED' WHERE reg_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateReg)) {
                    ps.setInt(1, regId);
                    ps.executeUpdate();
                }

                String updateEvents = "UPDATE towntrek_events SET registered_count = GREATEST(0, registered_count - ?) WHERE event_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateEvents)) {
                    ps.setInt(1, attendees);
                    ps.setInt(2, eventId);
                    ps.executeUpdate();
                }

                con.commit();
                return true;
            } catch (SQLException | RuntimeException e) {
                con.rollback();
                throw e;
            } finally {
                con.setAutoCommit(true);
            }
        }
    }

    private TownTrekEvent mapTownTrekEvent(ResultSet rs) throws SQLException {
        return new TownTrekEvent(
                rs.getInt("event_id"),
                rs.getString("title"),
                rs.getString("category"),
                rs.getString("venue"),
                rs.getString("location"),
                rs.getDate("event_date").toLocalDate(),
                rs.getTime("event_time").toLocalTime(),
                rs.getBigDecimal("entry_fee"),
                rs.getInt("max_capacity"),
                rs.getInt("registered_count"),
                rs.getString("description"),
                rs.getString("city")
        );
    }

    private EventRegistration mapRegistration(ResultSet rs) throws SQLException {
        Timestamp ts = rs.getTimestamp("reg_date");
        return new EventRegistration(
                rs.getInt("reg_id"),
                rs.getString("customer_name"),
                rs.getString("user_email"),
                rs.getInt("event_id"),
                rs.getString("title"),
                rs.getString("venue"),
                rs.getDate("event_date").toLocalDate(),
                rs.getTime("event_time").toLocalTime(),
                rs.getInt("attendee_count"),
                rs.getBigDecimal("total_fee"),
                rs.getString("status"),
                ts != null ? ts.toLocalDateTime() : null
        );
    }
}
