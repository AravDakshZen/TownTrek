package com.towntrek.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class DistrictEvent {
    private int eventId;
    private String title;
    private String category;
    private String venue;
    private String location;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private BigDecimal entryFee;
    private int maxCapacity;
    private int registeredCount;
    private String description;

    public DistrictEvent() {}

    public DistrictEvent(int eventId, String title, String category, String venue, String location, LocalDate eventDate, LocalTime eventTime, BigDecimal entryFee, int maxCapacity, int registeredCount, String description) {
        this.eventId = eventId;
        this.title = title;
        this.category = category;
        this.venue = venue;
        this.location = location;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.entryFee = entryFee;
        this.maxCapacity = maxCapacity;
        this.registeredCount = registeredCount;
        this.description = description;
    }

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }

    public BigDecimal getEntryFee() { return entryFee; }
    public void setEntryFee(BigDecimal entryFee) { this.entryFee = entryFee; }

    public int getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(int maxCapacity) { this.maxCapacity = maxCapacity; }

    public int getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(int registeredCount) { this.registeredCount = registeredCount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getAvailableSlots() { return Math.max(0, maxCapacity - registeredCount); }
}

