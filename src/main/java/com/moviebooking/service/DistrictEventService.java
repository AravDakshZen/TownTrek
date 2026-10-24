package com.moviebooking.service;

import com.moviebooking.dao.DistrictEventDAO;
import com.moviebooking.model.DistrictEvent;
import com.moviebooking.model.EventRegistration;

import java.sql.SQLException;
import java.util.List;

public class DistrictEventService {
    private final DistrictEventDAO dao = new DistrictEventDAO();

    public List<DistrictEvent> getAllEvents() throws SQLException {
        return dao.findAll();
    }

    public List<DistrictEvent> getEventsByCategory(String category) throws SQLException {
        return dao.findByCategory(category);
    }

    public DistrictEvent getEventById(int eventId) throws SQLException {
        return dao.findById(eventId);
    }

    public int register(String customerName, String userEmail, int eventId, int attendees) throws Exception {
        if (customerName == null || customerName.isBlank()) {
            throw new IllegalArgumentException("Customer name is required.");
        }
        if (attendees <= 0) {
            throw new IllegalArgumentException("Attendee count must be at least 1.");
        }
        return dao.register(customerName.trim(), userEmail.trim(), eventId, attendees);
    }

    public List<EventRegistration> getRegistrationsByUser(String userEmail) throws SQLException {
        return dao.findRegistrationsByUser(userEmail);
    }

    public EventRegistration getRegistrationById(int regId) throws SQLException {
        return dao.findRegistrationById(regId);
    }

    public boolean cancelRegistration(int regId) throws SQLException {
        return dao.cancelRegistration(regId);
    }
}
