package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class PartyConcert {
    private final int eventId;
    private final String title;
    private final String category; // CONCERT, CLUB_PARTY, COMEDY_NIGHT
    private final String artistPerformer;
    private final String venue;
    private final String location;
    private final LocalDate eventDate;
    private final LocalTime eventTime;
    private final BigDecimal ticketPrice;
    private final int totalCapacity;
    private final int availableSlots;
    private final String description;

    public PartyConcert(int eventId, String title, String category, String artistPerformer,
                        String venue, String location, LocalDate eventDate, LocalTime eventTime,
                        BigDecimal ticketPrice, int totalCapacity, int availableSlots, String description) {
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
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public String getArtistPerformer() { return artistPerformer; }
    public String getVenue() { return venue; }
    public String getLocation() { return location; }
    public LocalDate getEventDate() { return eventDate; }
    public LocalTime getEventTime() { return eventTime; }
    public BigDecimal getTicketPrice() { return ticketPrice; }
    public int getTotalCapacity() { return totalCapacity; }
    public int getAvailableSlots() { return availableSlots; }
    public String getDescription() { return description; }
}
