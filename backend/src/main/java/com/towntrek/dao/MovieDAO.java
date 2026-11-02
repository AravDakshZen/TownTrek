package com.towntrek.dao;

import com.towntrek.model.Movie;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MovieDAO {

    private final JdbcTemplate jdbcTemplate;

    public MovieDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Movie> findAll() {
        String sql = "SELECT movie_id, movie_name, genre, duration_minutes, language FROM movies ORDER BY movie_id ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Movie(
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getString("genre"),
                rs.getInt("duration_minutes"),
                rs.getString("language")
        ));
    }

    public Movie findById(int movieId) {
        String sql = "SELECT movie_id, movie_name, genre, duration_minutes, language FROM movies WHERE movie_id = ?";
        List<Movie> list = jdbcTemplate.query(sql, (rs, rowNum) -> new Movie(
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getString("genre"),
                rs.getInt("duration_minutes"),
                rs.getString("language")
        ), movieId);
        return list.isEmpty() ? null : list.get(0);
    }
}

