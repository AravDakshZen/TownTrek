package com.towntrek.dao;

import com.towntrek.model.UserAccount;
import com.towntrek.util.PasswordUtil;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;

@Repository
public class AuthDAO {

    private final JdbcTemplate jdbcTemplate;

    public AuthDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean register(String fullName, String email, String password) throws Exception {
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);

        String sql = """
            INSERT INTO users (full_name, email, password_salt, password_hash)
            VALUES (?, ?, ?, ?)
            """;

        try {
            int rows = jdbcTemplate.update(sql, fullName, email.trim().toLowerCase(), salt, hash);
            return rows > 0;
        } catch (DuplicateKeyException e) {
            return false;
        }
    }

    public UserAccount authenticate(String email, String password) throws Exception {
        String sql = """
            SELECT user_id, full_name, email, password_salt, password_hash
            FROM users
            WHERE email = ?
            """;

        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String salt = rs.getString("password_salt");
                String storedHash = rs.getString("password_hash");

                try {
                    boolean valid = PasswordUtil.verifyPassword(password, salt, storedHash);
                    if (valid) {
                        return new UserAccount(
                                rs.getInt("user_id"),
                                rs.getString("full_name"),
                                rs.getString("email")
                        );
                    }
                } catch (Exception e) {
                    throw new RuntimeException("Password verification failure", e);
                }
                return null;
            }, email.trim().toLowerCase());
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public UserAccount findByEmail(String email) {
        String sql = "SELECT user_id, full_name, email FROM users WHERE email = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new UserAccount(
                    rs.getInt("user_id"),
                    rs.getString("full_name"),
                    rs.getString("email")
            ), email.trim().toLowerCase());
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }
}

