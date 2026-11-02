package com.towntrek.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.io.File;
import java.io.FileInputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.Properties;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean
    @Primary
    public DataSource dataSource() {
        Properties props = new Properties();
        File[] candidateFiles = new File[]{
                new File("db.properties"),
                new File("../db.properties"),
                new File("backend/db.properties")
        };

        for (File f : candidateFiles) {
            if (f.exists()) {
                try (FileInputStream fis = new FileInputStream(f)) {
                    props.load(fis);
                    log.info("Loaded database configuration from: {}", f.getAbsolutePath());
                    break;
                } catch (Exception ignored) {}
            }
        }

        String envUrl = System.getenv("DB_URL");
        String envUser = System.getenv("DB_USER");
        String envPass = System.getenv("DB_PASSWORD");

        String url = envUrl != null && !envUrl.isBlank() ? envUrl
                : props.getProperty("db.url", "jdbc:mysql://localhost:3306/movie_booking_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&allowMultiQueries=true");

        String user = envUser != null && !envUser.isBlank() ? envUser
                : props.getProperty("db.user", "root");

        String password = envPass != null ? envPass
                : props.getProperty("db.password", "Aravintth@10");

        // 1. Ensure movie_booking_db exists in MySQL
        ensureDatabaseExists(user, password);

        // 2. Configure HikariCP
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(url);
        config.setUsername(user);
        config.setPassword(password);
        config.setDriverClassName("com.mysql.cj.jdbc.Driver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(15000);

        try {
            HikariDataSource ds = new HikariDataSource(config);
            try (Connection conn = ds.getConnection()) {
                log.info("--> [SUCCESS] Connected to MySQL database '{}' as user '{}'", conn.getCatalog(), user);
            }
            return ds;
        } catch (Exception ex) {
            log.warn("Primary connection with password '{}' failed: {}. Trying fallback with blank password...", password, ex.getMessage());
            if (!password.isEmpty()) {
                try {
                    config.setPassword("");
                    HikariDataSource dsFallback = new HikariDataSource(config);
                    try (Connection conn = dsFallback.getConnection()) {
                        log.info("--> [SUCCESS] Connected to MySQL database with blank password!");
                    }
                    return dsFallback;
                } catch (Exception ex2) {
                    log.error("Fallback connection also failed: {}", ex2.getMessage());
                }
            }
            throw new RuntimeException("Failed to establish MySQL connection. Please ensure MySQL service is running on port 3306: " + ex.getMessage(), ex);
        }
    }

    private void ensureDatabaseExists(String user, String password) {
        String serverUrl = "jdbc:mysql://localhost:3306/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        try (Connection conn = DriverManager.getConnection(serverUrl, user, password);
             Statement stmt = conn.createStatement()) {
            stmt.executeUpdate("CREATE DATABASE IF NOT EXISTS movie_booking_db");
            log.info("Verified/Created database 'movie_booking_db' in MySQL.");
        } catch (Exception e) {
            log.debug("ensureDatabaseExists notice: {}", e.getMessage());
        }
    }
}

