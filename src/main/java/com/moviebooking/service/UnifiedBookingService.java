package com.moviebooking.service;

import com.moviebooking.dao.BookingDAO;
import com.moviebooking.dao.DistrictEventDAO;
import com.moviebooking.dao.PartyConcertDAO;
import com.moviebooking.model.EventRegistration;
import com.moviebooking.model.MovieBookingDetail;
import com.moviebooking.model.PartyBooking;

import java.sql.SQLException;
import java.util.List;

public class UnifiedBookingService {
    private final BookingDAO movieBookingDAO = new BookingDAO();
    private final PartyConcertDAO partyConcertDAO = new PartyConcertDAO();
    private final DistrictEventDAO districtEventDAO = new DistrictEventDAO();

    public List<MovieBookingDetail> getMovieBookings(String customerName) throws SQLException {
        return movieBookingDAO.findBookingsByCustomer(customerName);
    }

    public MovieBookingDetail getMovieBookingById(int bookingId) throws SQLException {
        return movieBookingDAO.findDetailById(bookingId);
    }

    public boolean cancelMovieBooking(int bookingId) throws SQLException {
        return movieBookingDAO.cancelBooking(bookingId);
    }

    public List<PartyBooking> getPartyBookings(String userEmail) throws SQLException {
        return partyConcertDAO.findBookingsByUser(userEmail);
    }

    public PartyBooking getPartyBookingById(int bookingId) throws SQLException {
        return partyConcertDAO.findBookingById(bookingId);
    }

    public boolean cancelPartyBooking(int bookingId) throws SQLException {
        return partyConcertDAO.cancelBooking(bookingId);
    }

    public List<EventRegistration> getEventRegistrations(String userEmail) throws SQLException {
        return districtEventDAO.findRegistrationsByUser(userEmail);
    }

    public EventRegistration getEventRegistrationById(int regId) throws SQLException {
        return districtEventDAO.findRegistrationById(regId);
    }

    public boolean cancelEventRegistration(int regId) throws SQLException {
        return districtEventDAO.cancelRegistration(regId);
    }
}
