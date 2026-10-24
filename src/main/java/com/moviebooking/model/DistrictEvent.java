package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class DistrictEvent {
    private final int eventId;
    private final String title;
    private final String category; // WORKSHOP, FOOD_FEST, SPORTS, CULTURAL
    private final String venue;
    private final String location;
    private final LocalDate eventDate;
    private final LocalTime eventTime;
    private final BigDecimal entryFee;
    private final int maxCapacity;
    private final int registeredCount;
    private final String description;

    public DistrictEvent(int eventId, String title, String category, String venue,
                         String location, LocalDate eventDate, LocalTime eventTime,
                         BigDecimal entryFee, int maxCapacity, int registeredCount,
                         String description) {
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
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getVenue() { return venue; }
    public String getLocation() { return location; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public BigDecimal getEntryFee() { return entryFee; }
    public int getMaxCapacity() { return maxCapacity; }
    public int getRegisteredCount() { return registeredCount; }
    public String getDescription() { return description; }
    public int getAvailableSlots() { return Math.max(0, maxCapacity - registeredCount); }
}
