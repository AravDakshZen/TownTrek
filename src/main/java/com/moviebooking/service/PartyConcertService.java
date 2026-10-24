package com.moviebooking.service;

import com.moviebooking.dao.PartyConcertDAO;
import com.moviebooking.model.PartyBooking;
import com.moviebooking.model.PartyConcert;

import java.sql.SQLException;
import java.util.List;

public class PartyConcertService {
    private final PartyConcertDAO dao = new PartyConcertDAO();

    public List<PartyConcert> getAllEvents() throws SQLException {
        return dao.findAll();
    }

    public List<PartyConcert> getEventsByCategory(String category) throws SQLException {
        return dao.findByCategory(category);
    }

    public PartyConcert getEventById(int eventId) throws SQLException {
        return dao.findById(eventId);
    }

    public int bookTickets(String customerName, String userEmail, int eventId, int ticketsCount) throws Exception {
        if (customerName == null || customerName.isBlank()) {
            throw new IllegalArgumentException("Customer name is required.");
        }
        if (ticketsCount <= 0) {
            throw new IllegalArgumentException("Please select at least 1 ticket.");
        }
        return dao.bookTickets(customerName.trim(), userEmail.trim(), eventId, ticketsCount);
    }

    public List<PartyBooking> getBookingsByUser(String userEmail) throws SQLException {
        return dao.findBookingsByUser(userEmail);
    }

    public PartyBooking getBookingById(int bookingId) throws SQLException {
        return dao.findBookingById(bookingId);
    }

    public boolean cancelBooking(int bookingId) throws SQLException {
        return dao.cancelBooking(bookingId);
    }
}
