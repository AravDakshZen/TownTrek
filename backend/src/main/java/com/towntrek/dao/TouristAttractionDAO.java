package com.towntrek.dao;

import com.towntrek.model.TouristAttraction;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TouristAttractionDAO {

    private final JdbcTemplate jdbcTemplate;

    public TouristAttractionDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<TouristAttraction> findAll() {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            ORDER BY attraction_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TouristAttraction(
                rs.getInt("attraction_id"),
                rs.getString("name"),
                rs.getString("category"),
                rs.getString("location"),
                rs.getString("opening_hours"),
                rs.getBigDecimal("entry_fee"),
                rs.getString("highlights"),
                rs.getString("best_time_to_visit")
        ));
    }

    public List<TouristAttraction> findByCategory(String category) {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE category = ?
            ORDER BY attraction_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TouristAttraction(
                rs.getInt("attraction_id"),
                rs.getString("name"),
                rs.getString("category"),
                rs.getString("location"),
                rs.getString("opening_hours"),
                rs.getBigDecimal("entry_fee"),
                rs.getString("highlights"),
                rs.getString("best_time_to_visit")
        ), category);
    }

    public TouristAttraction findById(int id) {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE attraction_id = ?
            """;
        List<TouristAttraction> list = jdbcTemplate.query(sql, (rs, rowNum) -> new TouristAttraction(
                rs.getInt("attraction_id"),
                rs.getString("name"),
                rs.getString("category"),
                rs.getString("location"),
                rs.getString("opening_hours"),
                rs.getBigDecimal("entry_fee"),
                rs.getString("highlights"),
                rs.getString("best_time_to_visit")
        ), id);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<TouristAttraction> search(String keyword) {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE name LIKE ? OR location LIKE ? OR highlights LIKE ?
            ORDER BY attraction_id ASC
            """;
        String pattern = "%" + keyword + "%";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new TouristAttraction(
                rs.getInt("attraction_id"),
                rs.getString("name"),
                rs.getString("category"),
                rs.getString("location"),
                rs.getString("opening_hours"),
                rs.getBigDecimal("entry_fee"),
                rs.getString("highlights"),
                rs.getString("best_time_to_visit")
        ), pattern, pattern, pattern);
    }
}

