
package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.Show;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class ShowDAO {

    public List<Show> findAll() throws SQLException {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            ORDER BY s.show_id
            """;

        List<Show> shows = new ArrayList<>();

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                shows.add(mapShow(rs));
            }
        }
        return shows;
    }

    public Show findById(int showId) throws SQLException {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE s.show_id = ?
            """;

        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, showId);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return mapShow(rs);
            }
        }
        return null;
    }

    public List<String> findMovieNames() throws SQLException {
        String sql = """
            SELECT DISTINCT m.movie_name
            FROM movies m
            JOIN shows s ON s.movie_id = m.movie_id
            WHERE s.theatre_id IS NOT NULL
            ORDER BY m.movie_name
            """;

        List<String> names = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) names.add(rs.getString("movie_name"));
        }
        return names;
    }

    public List<LocalDate> findDatesByMovie(String movieName)
            throws SQLException {
        String sql = """
            SELECT DISTINCT s.show_date
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            WHERE m.movie_name = ?
            ORDER BY s.show_date
            """;

        List<LocalDate> dates = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, movieName);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) dates.add(rs.getDate(1).toLocalDate());
            }
        }
        return dates;
    }

    public List<String> findTheatresByMovieAndDate(
            String movieName, LocalDate date) throws SQLException {
        String sql = """
            SELECT DISTINCT t.theatre_name
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE m.movie_name = ? AND s.show_date = ?
            ORDER BY t.theatre_name
            """;

        List<String> theatres = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, movieName);
            ps.setDate(2, Date.valueOf(date));
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) theatres.add(rs.getString("theatre_name"));
            }
        }
        return theatres;
    }

    public List<Show> findShowsByMovieDateAndTheatre(
            String movieName, LocalDate date, String theatreName)
            throws SQLException {
        String sql = """
            SELECT s.show_id, s.movie_id, m.movie_name,
                   s.show_date, s.show_time,
                   t.theatre_id, t.theatre_name, t.location
            FROM shows s
            JOIN movies m ON m.movie_id = s.movie_id
            JOIN theatres t ON t.theatre_id = s.theatre_id
            WHERE m.movie_name = ?
              AND s.show_date = ?
              AND t.theatre_name = ?
            ORDER BY s.show_time
            """;

        List<Show> shows = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, movieName);
            ps.setDate(2, Date.valueOf(date));
            ps.setString(3, theatreName);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) shows.add(mapShow(rs));
            }
        }
        return shows;
    }

    private Show mapShow(ResultSet rs) throws SQLException {
        return new Show(
                rs.getInt("show_id"),
                rs.getInt("movie_id"),
                rs.getString("movie_name"),
                rs.getDate("show_date").toLocalDate(),
                rs.getTime("show_time").toLocalTime(),
                rs.getInt("theatre_id"),
                rs.getString("theatre_name"),
                rs.getString("location")
        );
    }
}
