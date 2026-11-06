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
        // Explicitly register MySQL JDBC driver
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException ignored) {}

        Properties props = new Properties();
        File propFile = new File("db.properties");
        if (propFile.exists()) {
            try (FileInputStream fis = new FileInputStream(propFile)) {
                props.load(fis);
            } catch (IOException ignored) {}
        } else {
            File backendProp = new File("backend/src/main/resources/application.properties");
            if (backendProp.exists()) {
                try (FileInputStream fis = new FileInputStream(backendProp)) {
                    props.load(fis);
                } catch (IOException ignored) {}
            }
        }

        String rawUrl = props.getProperty("spring.datasource.url", props.getProperty("db.url"));
        String rawUser = props.getProperty("spring.datasource.username", props.getProperty("db.user"));
        String rawPass = props.getProperty("spring.datasource.password", props.getProperty("db.password"));

        String defaultUrl = "jdbc:mysql://localhost:3306/towntrek_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8&allowMultiQueries=true";
        String defaultUser = "root";
        String defaultPass = "Aravdaksh2007.";

        url = resolvePlaceholder(rawUrl, defaultUrl);
        user = resolvePlaceholder(rawUser, defaultUser);
        password = resolvePlaceholder(rawPass, defaultPass);

        // Environment overrides
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.isBlank()) url = envUrl;

        String envUser = System.getenv("DB_USER");
        if (envUser != null && !envUser.isBlank()) user = envUser;

        String envPass = System.getenv("DB_PASSWORD");
        if (envPass != null) password = envPass;
    }

    private static String resolvePlaceholder(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        String val = value.trim();
        if (val.startsWith("${") && val.endsWith("}")) {
            String inner = val.substring(2, val.length() - 1);
            int colonIdx = inner.indexOf(':');
            if (colonIdx != -1) {
                String envKey = inner.substring(0, colonIdx).trim();
                String defaultVal = inner.substring(colonIdx + 1).trim();
                String envVal = System.getenv(envKey);
                if (envVal != null && !envVal.isBlank()) {
                    return envVal;
                }
                return defaultVal.isBlank() ? fallback : defaultVal;
            } else {
                String envVal = System.getenv(inner.trim());
                if (envVal != null && !envVal.isBlank()) {
                    return envVal;
                }
                return fallback;
            }
        }
        return val;
    }

    private DBConnection() {}

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, user, password);
    }

    public static String getUrl() {
        return url;
    }

    public static String getUser() {
        return user;
    }

    public static void setCredentials(String newUrl, String newUser, String newPass) {
        if (newUrl != null && !newUrl.isBlank()) url = newUrl;
        if (newUser != null) user = newUser;
        if (newPass != null) password = newPass;
    }
}
