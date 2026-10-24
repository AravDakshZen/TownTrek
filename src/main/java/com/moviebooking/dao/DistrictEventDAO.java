package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.DistrictEvent;
import com.moviebooking.model.EventRegistration;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class DistrictEventDAO {

    public List<DistrictEvent> findAll() throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description
            FROM district_events
            ORDER BY event_date, event_time
            """;
        List<DistrictEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapDistrictEvent(rs));
            }
        }
        return list;
    }

    public List<DistrictEvent> findByCategory(String category) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description
            FROM district_events
            WHERE category = ?
            ORDER BY event_date, event_time
            """;
        List<DistrictEvent> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapDistrictEvent(rs));
                }
            }
        }
        return list;
    }

    public DistrictEvent findById(int eventId) throws SQLException {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description
            FROM district_events
            WHERE event_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, eventId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapDistrictEvent(rs);
            }
        }
        return null;
    }

    public int register(String customerName, String userEmail, int eventId, int attendees) throws SQLException {
        if (attendees <= 0) throw new IllegalArgumentException("Attendees count must be greater than zero.");

        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String checkSql = "SELECT entry_fee, max_capacity, registered_count FROM district_events WHERE event_id = ? FOR UPDATE";
                BigDecimal fee;
                int maxCap;
                int regCount;
                try (PreparedStatement ps = con.prepareStatement(checkSql)) {
                    ps.setInt(1, eventId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new SQLException("Event not found with ID: " + eventId);
                        fee = rs.getBigDecimal("entry_fee");
                        maxCap = rs.getInt("max_capacity");
                        regCount = rs.getInt("registered_count");
                    }
                }

                if (regCount + attendees > maxCap) {
                    int remaining = Math.max(0, maxCap - regCount);
                    throw new SQLException("Cannot register " + attendees + " attendee(s). Only " + remaining + " spot(s) remaining.");
                }

                BigDecimal total = fee.multiply(BigDecimal.valueOf(attendees));

                String insertSql = """
                    INSERT INTO event_registrations
                    (customer_name, user_email, event_id, attendee_count, total_fee, status)
                    VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
                    """;
                int regId;
                try (PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
                    ps.setString(1, customerName);
                    ps.setString(2, userEmail);
                    ps.setInt(3, eventId);
                    ps.setInt(4, attendees);
                    ps.setBigDecimal(5, total);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) throw new SQLException("Could not retrieve registration ID.");
                        regId = keys.getInt(1);
                    }
                }

                String updateSql = "UPDATE district_events SET registered_count = registered_count + ? WHERE event_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateSql)) {
                    ps.setInt(1, attendees);
                    ps.setInt(2, eventId);
                    ps.executeUpdate();
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

    public List<EventRegistration> findRegistrationsByUser(String userEmail) throws SQLException {
        String sql = """
            SELECT r.reg_id, r.customer_name, r.user_email, r.event_id,
                   e.title, e.venue, e.event_date, e.event_time,
                   r.attendee_count, r.total_fee, r.status, r.reg_date
            FROM event_registrations r
            JOIN district_events e ON e.event_id = r.event_id
            WHERE r.user_email = ?
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
                   r.attendee_count, r.total_fee, r.status, r.reg_date
            FROM event_registrations r
            JOIN district_events e ON e.event_id = r.event_id
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

    public boolean cancelRegistration(int regId) throws SQLException {
        try (Connection con = DBConnection.getConnection()) {
            con.setAutoCommit(false);
            try {
                String selectSql = "SELECT event_id, attendee_count, status FROM event_registrations WHERE reg_id = ? FOR UPDATE";
                int eventId;
                int attendees;
                try (PreparedStatement ps = con.prepareStatement(selectSql)) {
                    ps.setInt(1, regId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next() || !"CONFIRMED".equalsIgnoreCase(rs.getString("status"))) {
                            con.rollback();
                            return false;
                        }
                        eventId = rs.getInt("event_id");
                        attendees = rs.getInt("attendee_count");
                    }
                }

                String updateReg = "UPDATE event_registrations SET status = 'CANCELLED' WHERE reg_id = ?";
                try (PreparedStatement ps = con.prepareStatement(updateReg)) {
                    ps.setInt(1, regId);
                    ps.executeUpdate();
                }

                String updateEvents = "UPDATE district_events SET registered_count = GREATEST(0, registered_count - ?) WHERE event_id = ?";
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

    private DistrictEvent mapDistrictEvent(ResultSet rs) throws SQLException {
        return new DistrictEvent(
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
                rs.getString("description")
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
