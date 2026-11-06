package com.towntrek.dao;

import com.towntrek.model.Show;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Repository
public class ShowDAO {

    private final JdbcTemplate jdbcTemplate;

    public ShowDAO(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Show> findAll() {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location,
                   COALESCE(t.city, 'Chennai') AS city
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            ORDER BY s.show_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Show(
                rs.getInt("show_id"),
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getDate("show_date").toLocalDate(),
                rs.getTime("show_time").toLocalTime(),
                rs.getInt("theatre_id"),
                rs.getString("theatre_name"),
                rs.getString("location"),
                rs.getString("city")
        ));
    }

    public Show findById(int showId) {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location,
                   COALESCE(t.city, 'Chennai') AS city
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE s.show_id = ?
            """;
        List<Show> list = jdbcTemplate.query(sql, (rs, rowNum) -> new Show(
                rs.getInt("show_id"),
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getDate("show_date").toLocalDate(),
                rs.getTime("show_time").toLocalTime(),
                rs.getInt("theatre_id"),
                rs.getString("theatre_name"),
                rs.getString("location"),
                rs.getString("city")
        ), showId);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<Show> findByMovie(int movieId) {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location,
                   COALESCE(t.city, 'Chennai') AS city
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE s.movie_id = ?
            ORDER BY s.show_date ASC, s.show_time ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Show(
                rs.getInt("show_id"),
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getDate("show_date").toLocalDate(),
                rs.getTime("show_time").toLocalTime(),
                rs.getInt("theatre_id"),
                rs.getString("theatre_name"),
                rs.getString("location"),
                rs.getString("city")
        ), movieId);
    }

    public List<LocalDate> findDatesByMovie(String movieName) {
        String sql = """
            SELECT DISTINCT s.show_date
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            WHERE m.movie_name = ?
            ORDER BY s.show_date ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getDate(1).toLocalDate(), movieName);
    }

    public List<String> findTheatresByMovieAndDate(String movieName, LocalDate date) {
        String sql = """
            SELECT DISTINCT t.theatre_name
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE m.movie_name = ? AND s.show_date = ?
            ORDER BY t.theatre_name ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("theatre_name"), movieName, Date.valueOf(date));
    }

    public List<Show> findShowsByMovieDateAndTheatre(String movieName, LocalDate date, String theatreName) {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location,
                   COALESCE(t.city, 'Chennai') AS city
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE m.movie_name = ?
              AND s.show_date = ?
              AND t.theatre_name = ?
            ORDER BY s.show_id ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new Show(
                rs.getInt("show_id"),
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getDate("show_date").toLocalDate(),
                rs.getTime("show_time").toLocalTime(),
                rs.getInt("theatre_id"),
                rs.getString("theatre_name"),
                rs.getString("location"),
                rs.getString("city")
        ), movieName, Date.valueOf(date), theatreName);
    }
}
