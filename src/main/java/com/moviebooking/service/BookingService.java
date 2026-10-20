package com.moviebooking.service;

import com.moviebooking.dao.BookingDAO;
import com.moviebooking.dao.SeatDAO;
import com.moviebooking.model.Seat;
import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Pattern;

public class BookingService {
    private final BookingDAO bookingDAO = new BookingDAO();
    private final SeatDAO seatDAO = new SeatDAO();
    private static final Pattern SEAT_PATTERN = Pattern.compile("[A-E][1-8]");

    public List<Seat> getSeats(int showId) throws Exception {
        return seatDAO.findByShow(showId);
    }

    public int book(int showId, int movieId, String customerName,
                    String seatInput, String couponCode) throws Exception {
        if (customerName == null || customerName.isBlank()) throw new IllegalArgumentException("Customer name is required.");
        List<String> codes = new ArrayList<>();
        Set<String> unique = new HashSet<>();
        for (String part : seatInput.split(",")) {
            String code = part.trim().toUpperCase(Locale.ROOT);
            if (!SEAT_PATTERN.matcher(code).matches()) throw new IllegalArgumentException("Invalid seat code: " + code);
            if (!unique.add(code)) throw new IllegalArgumentException("Duplicate seat code: " + code);
            codes.add(code);
        }
        return bookingDAO.createBooking(customerName.trim(), movieId, showId, codes, couponCode, BigDecimal.ZERO);
    }

    public boolean cancel(int bookingId) throws Exception {
        return bookingDAO.cancelBooking(bookingId);
    }
}
