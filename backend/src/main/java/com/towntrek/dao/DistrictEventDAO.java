package com.towntrek.dao;

import com.towntrek.model.DistrictEvent;
import com.towntrek.model.EventRegistration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.*;

@Repository
public class DistrictEventDAO {

    private final JdbcTemplate jdbcTemplate;

    public DistrictEventDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<DistrictEvent> findAll() {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            ORDER BY event_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new DistrictEvent(
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
        ));
    }

    public List<DistrictEvent> findByCategory(String category) {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE category = ?
            ORDER BY event_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new DistrictEvent(
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
        ), category);
    }

    public DistrictEvent findById(int eventId) {
        String sql = """
            SELECT event_id, title, category, venue, location,
                   event_date, event_time, entry_fee, max_capacity, registered_count, description,
                   COALESCE(city, 'Chennai') AS city
            FROM towntrek_events
            WHERE event_id = ?
            """;
        List<DistrictEvent> list = jdbcTemplate.query(sql, (rs, rowNum) -> new DistrictEvent(
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
        ), eventId);
        return list.isEmpty() ? null : list.get(0);
    }

    @Transactional(rollbackFor = Exception.class)
    public int register(String customerName, String userEmail, int eventId, int attendees) {
        if (attendees <= 0) throw new IllegalArgumentException("Attendees count must be greater than zero.");

        String checkSql = "SELECT entry_fee, max_capacity, registered_count FROM towntrek_events WHERE event_id = ? FOR UPDATE";
        List<EventCapCheck> list = jdbcTemplate.query(checkSql, (rs, rowNum) ->
                new EventCapCheck(rs.getBigDecimal("entry_fee"), rs.getInt("max_capacity"), rs.getInt("registered_count")), eventId);

        if (list.isEmpty()) {
            throw new IllegalArgumentException("Event not found with ID: " + eventId);
        }

        EventCapCheck cap = list.get(0);
        if (cap.registeredCount + attendees > cap.maxCapacity) {
            int remaining = Math.max(0, cap.maxCapacity - cap.registeredCount);
            throw new IllegalStateException("Cannot register " + attendees + " attendee(s). Only " + remaining + " spot(s) remaining.");
        }

        BigDecimal total = cap.fee.multiply(BigDecimal.valueOf(attendees));

        String insertSql = """
            INSERT INTO event_registrations
            (customer_name, user_email, event_id, attendee_count, total_fee, status)
            VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, customerName);
            ps.setString(2, userEmail);
            ps.setInt(3, eventId);
            ps.setInt(4, attendees);
            ps.setBigDecimal(5, total);
            return ps;
        }, keyHolder);

        int regId = keyHolder.getKey().intValue();
        jdbcTemplate.update("UPDATE towntrek_events SET registered_count = registered_count + ? WHERE event_id = ?", attendees, eventId);

        return regId;
    }

    public List<EventRegistration> findAllRegistrations() {
        String sql = """
            SELECT r.reg_id, r.customer_name, r.user_email, r.event_id,
                   e.title, e.venue, e.event_date, e.event_time,
                   r.attendee_count, r.total_fee, r.status,
                   COALESCE(r.registration_date, CURRENT_TIMESTAMP) AS reg_date
            FROM event_registrations r
            JOIN towntrek_events e ON e.event_id = r.event_id
            ORDER BY r.reg_id DESC
            """;
        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
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
            });
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    public List<EventRegistration> findRegistrationsByUserOrName(String userEmail, String customerName) {
        String sql = """
            SELECT r.reg_id, r.customer_name, r.user_email, r.event_id,
                   e.title, e.venue, e.event_date, e.event_time,
                   r.attendee_count, r.total_fee, r.status,
                   COALESCE(r.registration_date, CURRENT_TIMESTAMP) AS reg_date
            FROM event_registrations r
            JOIN towntrek_events e ON e.event_id = r.event_id
            WHERE LOWER(TRIM(r.user_email)) = LOWER(TRIM(?))
               OR LOWER(TRIM(r.customer_name)) = LOWER(TRIM(?))
               OR LOWER(r.customer_name) LIKE LOWER(?)
            ORDER BY r.reg_id DESC
            """;
        String emailQuery = userEmail != null ? userEmail.trim() : "";
        String nameQuery = customerName != null ? customerName.trim() : "";
        String wildcardName = "%" + (nameQuery.isEmpty() ? emailQuery : nameQuery) + "%";

        try {
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
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
            }, emailQuery, nameQuery, wildcardName);
        } catch (Exception ex) {
            return Collections.emptyList();
        }
    }

    public List<EventRegistration> findRegistrationsByUser(String userEmail) {
        return findRegistrationsByUserOrName(userEmail, "");
    }

    public List<EventRegistration> findRegistrationsForUser(List<String> names, List<String> emails, List<Integer> specificIds) {
        List<EventRegistration> all = findAllRegistrations();
        if (all.isEmpty()) return all;

        Set<Integer> targetIds = new HashSet<>(specificIds != null ? specificIds : Collections.emptyList());

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
                    String[] tokens = clean.split("[\\s_.-]+");
                    for (String token : tokens) {
                        if (token.length() >= 3) {
                            cleanNames.add(token);
                        }
                    }
                }
            }
        }

        List<EventRegistration> matched = new ArrayList<>();
        for (EventRegistration r : all) {
            boolean isMatch = false;

            // 1. Direct ID match from registration receipt or local storage
            if (targetIds.contains(r.getRegId())) {
                isMatch = true;
            }

            // 2. Email match
            if (!isMatch && r.getUserEmail() != null && !r.getUserEmail().isBlank()) {
                String rEmail = r.getUserEmail().trim().toLowerCase();
                if (cleanEmails.contains(rEmail)) {
                    isMatch = true;
                }
            }

            // 3. Name or Email substring match
            if (!isMatch && r.getCustomerName() != null && !r.getCustomerName().isBlank()) {
                String rName = r.getCustomerName().trim().toLowerCase();

                if (cleanNames.contains(rName) || cleanEmails.contains(rName)) {
                    isMatch = true;
                }

                if (!isMatch) {
                    for (String queryName : cleanNames) {
                        if (rName.contains(queryName) || queryName.contains(rName)) {
                            isMatch = true;
                            break;
                        }
                    }
                }

                if (!isMatch) {
                    for (String email : cleanEmails) {
                        String prefix = email.split("@")[0];
                        if (prefix.length() >= 3 && (rName.contains(prefix) || prefix.contains(rName))) {
                            isMatch = true;
                            break;
                        }
                    }
                }
            }

            if (isMatch) {
                matched.add(r);
            }
        }

        return matched;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean cancelRegistration(int regId) {
        String selectSql = "SELECT event_id, attendee_count, status FROM event_registrations WHERE reg_id = ? FOR UPDATE";
        List<RegCancelInfo> list = jdbcTemplate.query(selectSql, (rs, rowNum) ->
                new RegCancelInfo(rs.getInt("event_id"), rs.getInt("attendee_count"), rs.getString("status")), regId);

        if (list.isEmpty()) {
            return false;
        }

        RegCancelInfo info = list.get(0);
        if ("CANCELLED".equalsIgnoreCase(info.status)) {
            return true;
        }

        jdbcTemplate.update("UPDATE event_registrations SET status = 'CANCELLED' WHERE reg_id = ?", regId);
        jdbcTemplate.update("UPDATE towntrek_events SET registered_count = GREATEST(0, registered_count - ?) WHERE event_id = ?", info.attendees, info.eventId);

        return true;
    }

    private static class EventCapCheck {
        final BigDecimal fee;
        final int maxCapacity;
        final int registeredCount;
        EventCapCheck(BigDecimal fee, int maxCapacity, int registeredCount) {
            this.fee = fee;
            this.maxCapacity = maxCapacity;
            this.registeredCount = registeredCount;
        }
    }

    private static class RegCancelInfo {
        final int eventId;
        final int attendees;
        final String status;
        RegCancelInfo(int eventId, int attendees, String status) {
            this.eventId = eventId;
            this.attendees = attendees;
            this.status = status;
        }
    }
}
