package com.moviebooking.dao;

import com.moviebooking.config.DBConnection;
import com.moviebooking.model.Seat;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SeatDAO {
    public List<Seat> findByShow(int showId) throws SQLException {
        String sql = """
            SELECT seat_id, show_id, seat_code, seat_type, price, seat_status
            FROM seats WHERE show_id = ? ORDER BY seat_code
            """;
        List<Seat> seats = new ArrayList<>();
        try (Connection con = DBConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, showId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    seats.add(new Seat(rs.getInt("seat_id"), rs.getInt("show_id"),
                            rs.getString("seat_code"), rs.getString("seat_type"),
                            rs.getBigDecimal("price"), rs.getString("seat_status")));
                }
            }
        }
        return seats;
    }
}
