package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.TouristAttraction;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class TouristAttractionDAO {

    public List<TouristAttraction> findAll() throws SQLException {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            ORDER BY category, name
            """;
        List<TouristAttraction> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapAttraction(rs));
            }
        }
        return list;
    }

    public List<TouristAttraction> findByCategory(String category) throws SQLException {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE category = ?
            ORDER BY name
            """;
        List<TouristAttraction> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, category);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAttraction(rs));
                }
            }
        }
        return list;
    }

    public TouristAttraction findById(int id) throws SQLException {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE attraction_id = ?
            """;
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapAttraction(rs);
            }
        }
        return null;
    }

    public List<TouristAttraction> search(String keyword) throws SQLException {
        String sql = """
            SELECT attraction_id, name, category, location, opening_hours, entry_fee, highlights, best_time_to_visit
            FROM tourist_attractions
            WHERE name LIKE ? OR location LIKE ? OR highlights LIKE ?
            ORDER BY name
            """;
        List<TouristAttraction> list = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            String pattern = "%" + keyword + "%";
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            ps.setString(3, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapAttraction(rs));
                }
            }
        }
        return list;
    }

    private TouristAttraction mapAttraction(ResultSet rs) throws SQLException {
        return new TouristAttraction(
                rs.getInt("attraction_id"),
                rs.getString("name"),
                rs.getString("category"),
                rs.getString("location"),
                rs.getString("opening_hours"),
                rs.getBigDecimal("entry_fee"),
                rs.getString("highlights"),
                rs.getString("best_time_to_visit")
        );
    }
}
