package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.Movie;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MovieDAO {
    public List<Movie> findAll() throws SQLException {
        String sql = "SELECT movie_id, movie_name, genre, duration_minutes, language FROM movies ORDER BY movie_id";
        List<Movie> movies = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                movies.add(new Movie(rs.getInt("movie_id"), rs.getString("movie_name"),
                        rs.getString("genre"), rs.getInt("duration_minutes"), rs.getString("language")));
            }
        }
        return movies;
    }
}
