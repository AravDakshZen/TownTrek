package com.towntrek.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "TownTrek Full-Stack Backend");

        try {
            String db = jdbcTemplate.queryForObject("SELECT DATABASE()", String.class);
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM movies", Integer.class);
            status.put("database", "CONNECTED");
            status.put("databaseName", db != null ? db : "towntrek_db");
            status.put("moviesCount", count);
        } catch (Exception e) {
            status.put("database", "DISCONNECTED: " + e.getMessage());
        }

        return ResponseEntity.ok(status);
    }
}
