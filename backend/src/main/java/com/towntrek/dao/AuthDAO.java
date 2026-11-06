package com.towntrek.dao;

import com.towntrek.model.UserAccount;
import com.towntrek.util.PasswordUtil;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuthDAO {

    private final JdbcTemplate jdbcTemplate;

    public AuthDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean register(String fullName, String email, String password) throws Exception {
        return register(fullName, email, password, "Chennai");
    }

    public boolean register(String fullName, String email, String password, String city) throws Exception {
        String salt = PasswordUtil.generateSalt();
        String hash = PasswordUtil.hashPassword(password, salt);
        String finalCity = (city != null && !city.isBlank()) ? city.trim() : "Chennai";

        String sqlWithCity = """
            INSERT INTO users (full_name, email, password_salt, password_hash, city)
            VALUES (?, ?, ?, ?, ?)
            """;

        try {
            int rows = jdbcTemplate.update(sqlWithCity, fullName, email.trim().toLowerCase(), salt, hash, finalCity);
            return rows > 0;
        } catch (DuplicateKeyException e) {
            return false;
        } catch (BadSqlGrammarException ex) {
            // In case column city does not exist yet in table users
            String fallbackSql = """
                INSERT INTO users (full_name, email, password_salt, password_hash)
                VALUES (?, ?, ?, ?)
                """;
            try {
                int rows = jdbcTemplate.update(fallbackSql, fullName, email.trim().toLowerCase(), salt, hash);
                return rows > 0;
            } catch (DuplicateKeyException e) {
                return false;
            }
        }
    }

    public UserAccount authenticate(String email, String password) throws Exception {
        String sqlWithCity = "SELECT user_id, full_name, email, password_salt, password_hash, city FROM users WHERE email = ?";
        String sqlWithoutCity = "SELECT user_id, full_name, email, password_salt, password_hash FROM users WHERE email = ?";

        try {
            return queryUser(sqlWithCity, email, password, true);
        } catch (BadSqlGrammarException ex) {
            // Fallback when city column is not in users table
            return queryUser(sqlWithoutCity, email, password, false);
        }
    }

    private UserAccount queryUser(String sql, String email, String password, boolean hasCityColumn) {
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                String salt = rs.getString("password_salt");
                String storedHash = rs.getString("password_hash");

                try {
                    boolean valid = PasswordUtil.verifyPassword(password, salt, storedHash);
                    if (valid) {
                        String userCity = "Chennai";
                        if (hasCityColumn) {
                            try {
                                String dbCity = rs.getString("city");
                                if (dbCity != null && !dbCity.isBlank()) {
                                    userCity = dbCity;
                                }
                            } catch (Exception ignored) {}
                        }
                        return new UserAccount(
                                rs.getInt("user_id"),
                                rs.getString("full_name"),
                                rs.getString("email"),
                                userCity
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
        String sqlWithCity = "SELECT user_id, full_name, email, city FROM users WHERE email = ?";
        String sqlWithoutCity = "SELECT user_id, full_name, email FROM users WHERE email = ?";
        try {
            return jdbcTemplate.queryForObject(sqlWithCity, (rs, rowNum) -> new UserAccount(
                    rs.getInt("user_id"),
                    rs.getString("full_name"),
                    rs.getString("email"),
                    rs.getString("city")
            ), email.trim().toLowerCase());
        } catch (BadSqlGrammarException ex) {
            try {
                return jdbcTemplate.queryForObject(sqlWithoutCity, (rs, rowNum) -> new UserAccount(
                        rs.getInt("user_id"),
                        rs.getString("full_name"),
                        rs.getString("email"),
                        "Chennai"
                ), email.trim().toLowerCase());
            } catch (EmptyResultDataAccessException e) {
                return null;
            }
        } catch (EmptyResultDataAccessException e) {
            return null;
        }
    }

    public boolean updateCity(int userId, String city) {
        String finalCity = (city != null && !city.isBlank()) ? city.trim() : "Chennai";
        try {
            return jdbcTemplate.update("UPDATE users SET city = ? WHERE user_id = ?", finalCity, userId) > 0;
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean updateCityByEmail(String email, String city) {
        String finalCity = (city != null && !city.isBlank()) ? city.trim() : "Chennai";
        try {
            return jdbcTemplate.update("UPDATE users SET city = ? WHERE email = ?", finalCity, email.trim().toLowerCase()) > 0;
        } catch (Exception ex) {
            return false;
        }
    }

    public boolean updateUserProfile(String currentEmail, String newFullName, String newEmail, String newCity) {
        String finalName = (newFullName != null && !newFullName.isBlank()) ? newFullName.trim() : "TownTrek User";
        String finalEmail = (newEmail != null && !newEmail.isBlank()) ? newEmail.trim().toLowerCase() : currentEmail.trim().toLowerCase();
        String finalCity = (newCity != null && !newCity.isBlank()) ? newCity.trim() : "Chennai";
        try {
            return jdbcTemplate.update(
                    "UPDATE users SET full_name = ?, email = ?, city = ? WHERE email = ?",
                    finalName, finalEmail, finalCity, currentEmail.trim().toLowerCase()
            ) > 0;
        } catch (Exception ex) {
            try {
                return jdbcTemplate.update(
                        "UPDATE users SET full_name = ? WHERE email = ?",
                        finalName, currentEmail.trim().toLowerCase()
                ) > 0;
            } catch (Exception ignored) {
                return false;
            }
        }
    }
}
