package com.moviebooking.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

public final class DBConnection {

    private static String url;
    private static String user;
    private static String password;

    static {
        Properties props = new Properties();
        File propFile = new File("db.properties");
        if (propFile.exists()) {
            try (FileInputStream fis = new FileInputStream(propFile)) {
                props.load(fis);
            } catch (IOException ignored) {}
        }

        String envUrl = System.getenv("DB_URL");
        String envUser = System.getenv("DB_USER");
        String envPass = System.getenv("DB_PASSWORD");

        url = envUrl != null && !envUrl.isBlank() ? envUrl
                : props.getProperty("db.url",
                "jdbc:mysql://localhost:3306/movie_booking_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC");

        user = envUser != null && !envUser.isBlank() ? envUser
                : props.getProperty("db.user", "root");

        password = envPass != null ? envPass
                : props.getProperty("db.password", "");
    }

    private DBConnection() {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public static void setCredentials(String newUrl, String newUser, String newPass) {
        if (newUrl != null && !newUrl.isBlank()) url = newUrl;
        if (newUser != null) user = newUser;
        if (newPass != null) password = newPass;
    }
}
