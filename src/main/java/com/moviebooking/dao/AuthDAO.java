package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.UserAccount;
import com.moviebooking.util.PasswordUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AuthDAO {

    public boolean register(String fullName, String email, String password) throws Exception {
        return register(fullName, email, password, "Chennai");
    }

    public boolean register(String fullName, String email, String password, String city) throws Exception {
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);
        String finalCity = (city != null && !city.isBlank()) ? city.trim() : "Chennai";

        String sqlWithCity = """
            INSERT INTO users
                (full_name, email, password_salt, password_hash, city)
            VALUES (?, ?, ?, ?, ?)
            """;
        String sqlWithoutCity = """
            INSERT INTO users
                (full_name, email, password_salt, password_hash)
            VALUES (?, ?, ?, ?)
            """;

        try (Connection con = DBConnection.getConnection()) {
            try (PreparedStatement ps = con.prepareStatement(sqlWithCity)) {
                ps.setString(1, fullName);
                ps.setString(2, email);
                ps.setString(3, salt);
                ps.setString(4, hash);
                ps.setString(5, finalCity);
                ps.executeUpdate();
                return true;
            } catch (SQLException e) {
                if (e.getErrorCode() == 1062) {
                    return false;
                }
                // Fallback if city column doesn't exist
                if (e.getErrorCode() == 1054) {
                    try (PreparedStatement psFallback = con.prepareStatement(sqlWithoutCity)) {
                        psFallback.setString(1, fullName);
                        psFallback.setString(2, email);
                        psFallback.setString(3, salt);
                        psFallback.setString(4, hash);
                        psFallback.executeUpdate();
                        return true;
                    }
                }
                throw e;
            }
        }
    }

    public String signIn(String email, String password) throws Exception {
        UserAccount account = authenticate(email, password);
        return account != null ? account.getFullName() : null;
    }

    public UserAccount authenticate(String email, String password) throws Exception {
        String sqlWithCity = """
            SELECT user_id, full_name, email, password_salt, password_hash, COALESCE(city, 'Chennai') AS city
            FROM users
            WHERE email = ?
            """;
        String sqlWithoutCity = """
            SELECT user_id, full_name, email, password_salt, password_hash
            FROM users
            WHERE email = ?
            """;

        try (Connection con = DBConnection.getConnection()) {
            try (PreparedStatement ps = con.prepareStatement(sqlWithCity)) {
                ps.setString(1, email);
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        int userId = rs.getInt("user_id");
                        String name = rs.getString("full_name");
                        String userEmail = rs.getString("email");
                        String salt = rs.getString("password_salt");
                        String storedHash = rs.getString("password_hash");
                        String city = rs.getString("city");

                        boolean valid = PasswordUtil.verifyPassword(password, salt, storedHash);
                        return valid ? new UserAccount(userId, name, userEmail, city) : null;
                    }
                }
            } catch (SQLException ex) {
                if (ex.getErrorCode() == 1054) {
                    try (PreparedStatement ps = con.prepareStatement(sqlWithoutCity)) {
                        ps.setString(1, email);
                        try (ResultSet rs = ps.executeQuery()) {
                            if (rs.next()) {
                                int userId = rs.getInt("user_id");
                                String name = rs.getString("full_name");
                                String userEmail = rs.getString("email");
                                String salt = rs.getString("password_salt");
                                String storedHash = rs.getString("password_hash");

                                boolean valid = PasswordUtil.verifyPassword(password, salt, storedHash);
                                return valid ? new UserAccount(userId, name, userEmail, "Chennai") : null;
                            }
                        }
                    }
                } else {
                    throw ex;
                }
            }
        }
        return null;
    }

    public UserAccount findByEmail(String email) throws SQLException {
        String sql = "SELECT user_id, full_name, email, COALESCE(city, 'Chennai') AS city FROM users WHERE email = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, email.trim().toLowerCase());
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new UserAccount(
                            rs.getInt("user_id"),
                            rs.getString("full_name"),
                            rs.getString("email"),
                            rs.getString("city")
                    );
                }
            }
        }
        return null;
    }

    public boolean updateUserProfile(int userId, String newName, String newEmail, String newCity) throws SQLException {
        String finalCity = (newCity != null && !newCity.isBlank()) ? newCity.trim() : "Chennai";
        String sql = "UPDATE users SET full_name = ?, email = ?, city = ? WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newName.trim());
            ps.setString(2, newEmail.trim().toLowerCase());
            ps.setString(3, finalCity);
            ps.setInt(4, userId);
            return ps.executeUpdate() > 0;
        } catch (SQLException ex) {
            // Fallback if city column not present
            if (ex.getErrorCode() == 1054) {
                String sqlFallback = "UPDATE users SET full_name = ?, email = ? WHERE user_id = ?";
                try (Connection con = DBConnection.getConnection();
                     PreparedStatement ps = con.prepareStatement(sqlFallback)) {
                    ps.setString(1, newName.trim());
                    ps.setString(2, newEmail.trim().toLowerCase());
                    ps.setInt(3, userId);
                    return ps.executeUpdate() > 0;
                }
            }
            throw ex;
        }
    }

    public boolean updateCity(int userId, String newCity) throws SQLException {
        String finalCity = (newCity != null && !newCity.isBlank()) ? newCity.trim() : "Chennai";
        String sql = "UPDATE users SET city = ? WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, finalCity);
            ps.setInt(2, userId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateCityByEmail(String email, String newCity) throws SQLException {
        String finalCity = (newCity != null && !newCity.isBlank()) ? newCity.trim() : "Chennai";
        String sql = "UPDATE users SET city = ? WHERE LOWER(email) = LOWER(?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, finalCity);
            ps.setString(2, email.trim());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateEmail(String oldEmail, String newEmail) throws SQLException {
        String sql = "UPDATE users SET email = ? WHERE LOWER(email) = LOWER(?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newEmail.trim().toLowerCase());
            ps.setString(2, oldEmail.trim().toLowerCase());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateFullName(String email, String newName) throws SQLException {
        String sql = "UPDATE users SET full_name = ? WHERE LOWER(email) = LOWER(?)";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, newName.trim());
            ps.setString(2, email.trim().toLowerCase());
            return ps.executeUpdate() > 0;
        }
    }

    public boolean changePassword(int userId, String oldPassword, String newPassword) throws Exception {
        String sql = "SELECT password_salt, password_hash FROM users WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) return false;
                String salt = rs.getString("password_salt");
                String storedHash = rs.getString("password_hash");

                if (!PasswordUtil.verifyPassword(oldPassword, salt, storedHash)) {
                    return false;
                }
            }
        }

        String newSalt = PasswordUtil.generateSalt();
        String newHash = PasswordUtil.hashPassword(newPassword, newSalt);
        String updateSql = "UPDATE users SET password_salt = ?, password_hash = ? WHERE user_id = ?";
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(updateSql)) {
            ps.setString(1, newSalt);
            ps.setString(2, newHash);
            ps.setInt(3, userId);
            return ps.executeUpdate() > 0;
        }
    }
}
