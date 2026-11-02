package com.towntrek.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class PartyConcert {
    private int eventId;
    private String title;
    private String category;
    private String artistPerformer;
    private String venue;
    private String location;
    private LocalDate eventDate;
    private LocalTime eventTime;
    private BigDecimal ticketPrice;
    private int totalCapacity;
    private int availableSlots;
    private String description;

    public PartyConcert() {}

    public PartyConcert(int eventId, String title, String category, String artistPerformer, String venue, String location, LocalDate eventDate, LocalTime eventTime, BigDecimal ticketPrice, int totalCapacity, int availableSlots, String description) {
        this.eventId = eventId;
        this.title = title;
        this.category = category;
        this.artistPerformer = artistPerformer;
        this.venue = venue;
        this.location = location;
        this.eventDate = eventDate;
        this.eventTime = eventTime;
        this.ticketPrice = ticketPrice;
        this.totalCapacity = totalCapacity;
        this.availableSlots = availableSlots;
        this.description = description;
    }

    public int getEventId() { return eventId; }
    public void setEventId(int eventId) { this.eventId = eventId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getArtistPerformer() { return artistPerformer; }
    public void setArtistPerformer(String artistPerformer) { this.artistPerformer = artistPerformer; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getEventDate() { return eventDate; }
    public void setEventDate(LocalDate eventDate) { this.eventDate = eventDate; }

    public LocalTime getEventTime() { return eventTime; }
    public void setEventTime(LocalTime eventTime) { this.eventTime = eventTime; }

    public BigDecimal getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }

    public int getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(int availableSlots) { this.availableSlots = availableSlots; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}

