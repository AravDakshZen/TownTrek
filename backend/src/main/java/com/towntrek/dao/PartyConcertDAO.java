package com.towntrek.dao;

import com.towntrek.model.PartyBooking;
import com.towntrek.model.PartyConcert;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;

@Repository
public class PartyConcertDAO {

    private final JdbcTemplate jdbcTemplate;

    public PartyConcertDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<PartyConcert> findAll() {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description
            FROM parties_concerts
            ORDER BY event_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new PartyConcert(
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
                rs.getString("description")
        ));
    }

    public List<PartyConcert> findByCategory(String category) {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description
            FROM parties_concerts
            WHERE category = ?
            ORDER BY event_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new PartyConcert(
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
                rs.getString("description")
        ), category);
    }

    public PartyConcert findById(int eventId) {
        String sql = """
            SELECT event_id, title, category, artist_performer, venue, location,
                   event_date, event_time, ticket_price, total_capacity, available_slots, description
            FROM parties_concerts
            WHERE event_id = ?
            """;
        List<PartyConcert> list = jdbcTemplate.query(sql, (rs, rowNum) -> new PartyConcert(
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
                rs.getString("description")
        ), eventId);
        return list.isEmpty() ? null : list.get(0);
    }

    @Transactional(rollbackFor = Exception.class)
    public int bookTickets(String customerName, String userEmail, int eventId, int count) {
        if (count <= 0) throw new IllegalArgumentException("Tickets count must be greater than zero.");

        String checkSql = "SELECT ticket_price, available_slots FROM parties_concerts WHERE event_id = ? FOR UPDATE";
        List<PartyPriceSlot> eventList = jdbcTemplate.query(checkSql, (rs, rowNum) ->
                new PartyPriceSlot(rs.getBigDecimal("ticket_price"), rs.getInt("available_slots")), eventId);

        if (eventList.isEmpty()) {
            throw new IllegalArgumentException("Event not found with ID: " + eventId);
        }

        PartyPriceSlot slot = eventList.get(0);
        if (slot.available < count) {
            throw new IllegalStateException("Only " + slot.available + " tickets currently available.");
        }

        BigDecimal total = slot.price.multiply(BigDecimal.valueOf(count));

        String insertSql = """
            INSERT INTO party_bookings
            (customer_name, user_email, event_id, tickets_count, total_amount, booking_status)
            VALUES (?, ?, ?, ?, ?, 'CONFIRMED')
            """;

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, customerName);
            ps.setString(2, userEmail);
            ps.setInt(3, eventId);
            ps.setInt(4, count);
            ps.setBigDecimal(5, total);
            return ps;
        }, keyHolder);

        int bookingId = keyHolder.getKey().intValue();

        jdbcTemplate.update("UPDATE parties_concerts SET available_slots = available_slots - ? WHERE event_id = ?", count, eventId);

        return bookingId;
    }

    public List<PartyBooking> findAllBookings() {
        String sql = """
            SELECT b.booking_id, b.customer_name, b.user_email, b.event_id,
                   e.title, e.artist_performer, e.venue, e.event_date, e.event_time,
                   b.tickets_count, b.total_amount, b.booking_status, b.booking_date
            FROM party_bookings b
            JOIN parties_concerts e ON e.event_id = b.event_id
            ORDER BY b.booking_id DESC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
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
        });
    }

    public List<PartyBooking> findBookingsByUserOrName(String userEmail, String customerName) {
        String sql = """
            SELECT b.booking_id, b.customer_name, b.user_email, b.event_id,
                   e.title, e.artist_performer, e.venue, e.event_date, e.event_time,
                   b.tickets_count, b.total_amount, b.booking_status, b.booking_date
            FROM party_bookings b
            JOIN parties_concerts e ON e.event_id = b.event_id
            WHERE LOWER(TRIM(b.user_email)) = LOWER(TRIM(?))
               OR LOWER(TRIM(b.customer_name)) = LOWER(TRIM(?))
               OR LOWER(b.customer_name) LIKE LOWER(?)
            ORDER BY b.booking_id DESC
            """;
        String emailQuery = userEmail != null ? userEmail.trim() : "";
        String nameQuery = customerName != null ? customerName.trim() : "";
        String wildcardName = "%" + (nameQuery.isEmpty() ? emailQuery : nameQuery) + "%";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
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
        }, emailQuery, nameQuery, wildcardName);
    }

    public List<PartyBooking> findBookingsByUser(String userEmail) {
        return findBookingsByUserOrName(userEmail, "");
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean cancelBooking(int bookingId) {
        String selectSql = "SELECT event_id, tickets_count, booking_status FROM party_bookings WHERE booking_id = ? FOR UPDATE";
        List<PartyCancelInfo> list = jdbcTemplate.query(selectSql, (rs, rowNum) ->
                new PartyCancelInfo(rs.getInt("event_id"), rs.getInt("tickets_count"), rs.getString("booking_status")), bookingId);

        if (list.isEmpty() || !"CONFIRMED".equalsIgnoreCase(list.get(0).status)) {
            return false;
        }

        PartyCancelInfo info = list.get(0);
        jdbcTemplate.update("UPDATE party_bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?", bookingId);
        jdbcTemplate.update("UPDATE parties_concerts SET available_slots = available_slots + ? WHERE event_id = ?", info.tickets, info.eventId);

        return true;
    }

    private static class PartyPriceSlot {
        final BigDecimal price;
        final int available;
        PartyPriceSlot(BigDecimal price, int available) { this.price = price; this.available = available; }
    }

    private static class PartyCancelInfo {
        final int eventId;
        final int tickets;
        final String status;
        PartyCancelInfo(int eventId, int tickets, String status) { this.eventId = eventId; this.tickets = tickets; this.status = status; }
    }
}
