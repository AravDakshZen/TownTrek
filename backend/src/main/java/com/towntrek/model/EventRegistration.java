package com.towntrek.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class EventRegistration {
    private int regId;
    private String customerName;
    private String userEmail;
    private int eventId;
    private String eventTitle;
    private String venue;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private int attendeeCount;
    private BigDecimal totalFee;
    private String status;
    private LocalDateTime regDate;

    public EventRegistration() {}

    public EventRegistration(int regId, String customerName, String userEmail, int eventId, String eventTitle, String venue, LocalDate eventDate, LocalTime eventTime, int attendeeCount, BigDecimal totalFee, String status, LocalDateTime regDate) {
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
    public void setRegId(int regId) { this.regId = regId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }

    public int getAttendeeCount() { return attendeeCount; }
    public void setAttendeeCount(int attendeeCount) { this.attendeeCount = attendeeCount; }

    public BigDecimal getTotalFee() { return totalFee; }
    public void setTotalFee(BigDecimal totalFee) { this.totalFee = totalFee; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegDate() { return regDate; }
    public void setRegDate(LocalDateTime regDate) { this.regDate = regDate; }
}

