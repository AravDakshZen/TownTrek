package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.CitySpot;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class CitySpotDAO {

    public List<CitySpot> findAll() throws SQLException {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings
            FROM city_spots
            ORDER BY rating DESC, name
            """;
        List<CitySpot> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapSpot(rs));
            }
        }
        return list;
    }

    public List<CitySpot> findByType(String spotType) throws SQLException {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings
            FROM city_spots
            WHERE spot_type = ?
            ORDER BY rating DESC, name
            """;
        List<CitySpot> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, spotType);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapSpot(rs));
                }
            }
        }
        return list;
    }

    public CitySpot findById(int id) throws SQLException {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings
            FROM city_spots
            WHERE spot_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapSpot(rs);
            }
        }
        return null;
    }

    public List<CitySpot> search(String keyword) throws SQLException {
        String sql = """
            SELECT spot_id, name, spot_type, cuisine_or_specialty, price_range, address, rating, contact_number, timings
            FROM city_spots
            WHERE name LIKE ? OR cuisine_or_specialty LIKE ? OR address LIKE ?
            ORDER BY rating DESC
            """;
        List<CitySpot> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            String pattern = "%" + keyword + "%";
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapSpot(rs));
                }
            }
        }
        return list;
    }

    private CitySpot mapSpot(ResultSet rs) throws SQLException {
        return new CitySpot(
                rs.getInt("spot_id"),
                rs.getString("name"),
                rs.getString("spot_type"),
                rs.getString("cuisine_or_specialty"),
                rs.getString("price_range"),
                rs.getString("address"),
                rs.getBigDecimal("rating"),
                rs.getString("contact_number"),
                rs.getString("timings")
        );
    }
}
