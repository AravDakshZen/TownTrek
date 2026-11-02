package com.towntrek.dao;

import com.towntrek.model.Seat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SeatDAO {

    private final JdbcTemplate jdbcTemplate;

    public SeatDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Seat> findByShow(int showId) {
        String sql = """
            SELECT seat_id, show_id, seat_code, seat_type, price, seat_status
            FROM seats WHERE show_id = ? ORDER BY seat_code ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Seat(
                rs.getInt("seat_id"),
                rs.getInt("show_id"),
                rs.getString("seat_code"),
                rs.getString("seat_type"),
                rs.getBigDecimal("price"),
                rs.getString("seat_status")
        ), showId);
    }
}

