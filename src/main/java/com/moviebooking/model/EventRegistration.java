package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class EventRegistration {
    private final int regId;
    private final String customerName;
    private final String userEmail;
    private final int eventId;
    private final String eventTitle;
    private final String venue;
    private final LocalDate eventDate;
    private final LocalTime eventTime;
    private final int attendeeCount;
    private final BigDecimal totalFee;
    private final String status;
    private final LocalDateTime regDate;

    public EventRegistration(int regId, String customerName, String userEmail, int eventId,
                             String eventTitle, String venue, LocalDate eventDate,
                             LocalTime eventTime, int attendeeCount, BigDecimal totalFee,
                             String status, LocalDateTime regDate) {
        this.regId = regId;
        this.customerName = customerName;
        this.userEmail = userEmail;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.venue = venue;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.attendeeCount = attendeeCount;
        this.totalFee = totalFee;
        this.status = status;
        this.regDate = regDate;
    }

    public int getRegId() { return regId; }
    public String getCustomerName() { return customerName; }
    public String getUserEmail() { return userEmail; }
    public int getEventId() { return eventId; }
    public String getEventTitle() { return eventTitle; }
    public String getVenue() { return venue; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public int getAttendeeCount() { return attendeeCount; }
    public BigDecimal getTotalFee() { return totalFee; }
    public String getStatus() { return status; }
    public LocalDateTime getRegDate() { return regDate; }
}
