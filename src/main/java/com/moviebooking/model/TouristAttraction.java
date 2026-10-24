package com.moviebooking.model;

import java.math.BigDecimal;

public class TouristAttraction {
    private final int attractionId;
    private final String name;
    private final String category; // HERITAGE, NATURE_BEACH, MUSEUM, PARK
    private final String location;
    private final String openingHours;
    private final BigDecimal entryFee;
    private final String highlights;
    private final String bestTimeToVisit;

    public TouristAttraction(int attractionId, String name, String category, String location,
                             String openingHours, BigDecimal entryFee, String highlights,
                             String bestTimeToVisit) {
        this.attractionId = attractionId;
        this.name = name;
        this.category = category;
        this.location = location;
        this.openingHours = openingHours;
        this.entryFee = entryFee;
        this.highlights = highlights;
        this.bestTimeToVisit = bestTimeToVisit;
    }

    public int getAttractionId() { return attractionId; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getLocation() { return location; }
    public String getOpeningHours() { return openingHours; }
    public BigDecimal getEntryFee() { return entryFee; }
    public String getHighlights() { return highlights; }
    public String getBestTimeToVisit() { return bestTimeToVisit; }
}
