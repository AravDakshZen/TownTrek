package com.towntrek.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class PartyBooking {
    private int bookingId;
    private String customerName;
    private String userEmail;
    private int eventId;
    private String eventTitle;
    private String artistPerformer;
    private String venue;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private int ticketsCount;
    private BigDecimal totalAmount;
    private String bookingStatus;
    private LocalDateTime bookingDate;

    public PartyBooking() {}

    public PartyBooking(int bookingId, String customerName, String userEmail, int eventId, String eventTitle, String artistPerformer, String venue, LocalDate eventDate, LocalTime eventTime, int ticketsCount, BigDecimal totalAmount, String bookingStatus, LocalDateTime bookingDate) {
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
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getArtistPerformer() { return artistPerformer; }
    public void setArtistPerformer(String artistPerformer) { this.artistPerformer = artistPerformer; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }

    public int getTicketsCount() { return ticketsCount; }
    public void setTicketsCount(int ticketsCount) { this.ticketsCount = ticketsCount; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}

