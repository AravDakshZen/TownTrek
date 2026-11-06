package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.EmergencyService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class EmergencyServiceDAO {

    public List<EmergencyService> findAll() throws SQLException {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes,
                   COALESCE(city, 'Chennai') AS city
            FROM emergency_services
            ORDER BY service_id ASC
            """;
        List<EmergencyService> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapService(rs));
            }
        }
        return list;
    }

    public List<EmergencyService> findByCity(String city) throws SQLException {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes,
                   COALESCE(city, 'Chennai') AS city
            FROM emergency_services
            WHERE LOWER(city) LIKE LOWER(?) OR LOWER(address) LIKE LOWER(?)
            ORDER BY service_id ASC
            """;
        List<EmergencyService> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, "%" + city + "%");
            ps.setString(2, "%" + city + "%");
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapService(rs));
                }
            }
        }
        return list;
    }

    public List<EmergencyService> findByCategory(String category) throws SQLException {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes,
                   COALESCE(city, 'Chennai') AS city
            FROM emergency_services
            WHERE category = ?
            ORDER BY service_id ASC
            """;
        List<EmergencyService> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapService(rs));
                }
            }
        }
        return list;
    }

    public List<EmergencyService> findRapidHelplines() throws SQLException {
        String sql = """
            SELECT service_id, service_name, category, phone_number, alternate_number, address, is_24_7, notes,
                   COALESCE(city, 'Chennai') AS city
            FROM emergency_services
            WHERE category IN ('EMERGENCY_HELPLINE', 'POLICE', 'HOSPITAL') AND is_24_7 = TRUE
            ORDER BY service_id
            """;
        List<EmergencyService> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapService(rs));
            }
        }
        return list;
    }

    private EmergencyService mapService(ResultSet rs) throws SQLException {
        return new EmergencyService(
                rs.getInt("service_id"),
                rs.getString("service_name"),
                rs.getString("category"),
                rs.getString("phone_number"),
                rs.getString("alternate_number"),
                rs.getString("address"),
                rs.getBoolean("is_24_7"),
                rs.getString("notes"),
                rs.getString("city")
        );
    }
}
