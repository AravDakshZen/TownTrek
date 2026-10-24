
package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.util.PasswordUtil;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class AuthDAO {

    public boolean register(
            String fullName, String email, String password)
            throws Exception {

        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);

        String sql = """
            INSERT INTO users
                (full_name, email, password_salt, password_hash)
            VALUES (?, ?, ?, ?)
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, fullName);
            ps.setString(2, email);
            ps.setString(3, salt);
            ps.setString(4, hash);

            ps.executeUpdate();
            return true;

        } catch (SQLException e) {
            if (e.getErrorCode() == 1062) {
                return false;
            }
            throw e;
        }
    }

    public String signIn(String email, String password)
            throws Exception {

        String sql = """
            SELECT full_name, password_salt, password_hash
            FROM users
            WHERE email = ?
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                String name = rs.getString("full_name");
                String salt = rs.getString("password_salt");
                String storedHash = rs.getString("password_hash");

                boolean valid = PasswordUtil.verifyPassword(
                        password, salt, storedHash);

                return valid ? name : null;
            }
        }
    }

    public com.moviebooking.model.UserAccount authenticate(String email, String password)
            throws Exception {

        String sql = """
            SELECT user_id, full_name, email, password_salt, password_hash
            FROM users
            WHERE email = ?
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, email);

            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                int userId = rs.getInt("user_id");
                String name = rs.getString("full_name");
                String userEmail = rs.getString("email");
                String salt = rs.getString("password_salt");
                String storedHash = rs.getString("password_hash");

                boolean valid = PasswordUtil.verifyPassword(
                        password, salt, storedHash);

                return valid ? new com.moviebooking.model.UserAccount(userId, name, userEmail) : null;
            }
        }
    }
}

