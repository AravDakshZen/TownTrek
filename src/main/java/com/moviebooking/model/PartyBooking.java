package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class PartyBooking {
    private final int bookingId;
    private final String customerName;
    private final String userEmail;
    private final int eventId;
    private final String eventTitle;
    private final String artistPerformer;
    private final String venue;
    private final LocalDate eventDate;
    private final LocalTime eventTime;
    private final int ticketsCount;
    private final BigDecimal totalAmount;
    private final String bookingStatus;
    private final LocalDateTime bookingDate;

    public PartyBooking(int bookingId, String customerName, String userEmail, int eventId,
                        String eventTitle, String artistPerformer, String venue,
                        LocalDate eventDate, LocalTime eventTime, int ticketsCount,
                        BigDecimal totalAmount, String bookingStatus, LocalDateTime bookingDate) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.userEmail = userEmail;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.artistPerformer = artistPerformer;
        this.venue = venue;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.ticketsCount = ticketsCount;
        this.totalAmount = totalAmount;
        this.bookingStatus = bookingStatus;
        this.bookingDate = bookingDate;
    }

    public int getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getUserEmail() { return userEmail; }
    public int getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public String getArtistPerformer() { return artistPerformer; }
    public String getVenue() { return venue; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public int getTicketsCount() { return ticketsCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getBookingStatus() { return bookingStatus; }
    public LocalDateTime getBookingDate() { return bookingDate; }
}
