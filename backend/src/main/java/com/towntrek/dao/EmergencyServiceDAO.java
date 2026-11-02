package com.towntrek.dao;

import com.towntrek.model.EmergencyService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class EmergencyServiceDAO {

    private final JdbcTemplate jdbcTemplate;

    public EmergencyServiceDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<EmergencyService> findAll() {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes
            FROM emergency_services
            ORDER BY service_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new EmergencyService(
                rs.getInt("service_id"),
                rs.getString("service_name"),
                rs.getString("category"),
                rs.getString("phone_number"),
                rs.getString("alternate_number"),
                rs.getString("address"),
                rs.getBoolean("is_24_7"),
                rs.getString("notes")
        ));
    }

    public List<EmergencyService> findByCategory(String category) {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes
            FROM emergency_services
            WHERE category = ?
            ORDER BY service_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new EmergencyService(
                rs.getInt("service_id"),
                rs.getString("service_name"),
                rs.getString("category"),
                rs.getString("phone_number"),
                rs.getString("alternate_number"),
                rs.getString("address"),
                rs.getBoolean("is_24_7"),
                rs.getString("notes")
        ), category);
    }

    public List<EmergencyService> findRapidHelplines() {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes
            FROM emergency_services
            WHERE category IN ('EMERGENCY_HELPLINE', 'POLICE', 'HOSPITAL') AND is_24_7 = TRUE
            ORDER BY service_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new EmergencyService(
                rs.getInt("service_id"),
                rs.getString("service_name"),
                rs.getString("category"),
                rs.getString("phone_number"),
                rs.getString("alternate_number"),
                rs.getString("address"),
                rs.getBoolean("is_24_7"),
                rs.getString("notes")
        ));
    }
}

