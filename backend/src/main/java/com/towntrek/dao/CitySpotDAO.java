package com.towntrek.dao;

import com.towntrek.model.CitySpot;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CitySpotDAO {

    private final JdbcTemplate jdbcTemplate;

    public CitySpotDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<CitySpot> findAll() {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings,
                   COALESCE(city, 'Chennai') AS city
            FROM city_spots
            ORDER BY spot_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new CitySpot(
                rs.getInt("spot_id"),
                rs.getString("name"),
                rs.getString("spot_type"),
                rs.getString("cuisine_or_specialty"),
                rs.getString("price_range"),
                rs.getString("address"),
                rs.getBigDecimal("rating"),
                rs.getString("contact_number"),
                rs.getString("timings"),
                rs.getString("city")
        ));
    }

    public List<CitySpot> findByType(String spotType) {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings,
                   COALESCE(city, 'Chennai') AS city
            FROM city_spots
            WHERE spot_type = ?
            ORDER BY spot_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new CitySpot(
                rs.getInt("spot_id"),
                rs.getString("name"),
                rs.getString("spot_type"),
                rs.getString("cuisine_or_specialty"),
                rs.getString("price_range"),
                rs.getString("address"),
                rs.getBigDecimal("rating"),
                rs.getString("contact_number"),
                rs.getString("timings"),
                rs.getString("city")
        ), spotType);
    }

    public CitySpot findById(int id) {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings,
                   COALESCE(city, 'Chennai') AS city
            FROM city_spots
            WHERE spot_id = ?
            """;
        List<CitySpot> list = jdbcTemplate.query(sql, (rs, rowNum) -> new CitySpot(
                rs.getInt("spot_id"),
                rs.getString("name"),
                rs.getString("spot_type"),
                rs.getString("cuisine_or_specialty"),
                rs.getString("price_range"),
                rs.getString("address"),
                rs.getBigDecimal("rating"),
                rs.getString("contact_number"),
                rs.getString("timings"),
                rs.getString("city")
        ), id);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<CitySpot> search(String keyword) {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings,
                   COALESCE(city, 'Chennai') AS city
            FROM city_spots
            WHERE name LIKE ? OR cuisine_or_specialty LIKE ? OR address LIKE ?
            ORDER BY spot_id ASC
            """;
        String pattern = "%" + keyword + "%";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new CitySpot(
                rs.getInt("spot_id"),
                rs.getString("name"),
                rs.getString("spot_type"),
                rs.getString("cuisine_or_specialty"),
                rs.getString("price_range"),
                rs.getString("address"),
                rs.getBigDecimal("rating"),
                rs.getString("contact_number"),
                rs.getString("timings"),
                rs.getString("city")
        ), pattern, pattern, pattern);
    }
}
