package com.towntrek.model;

import java.math.BigDecimal;

public class TouristAttraction {
    private int attractionId;
    private String name;
    private String category;
    private String location;
    private String openingHours;
    private BigDecimal entryFee;
    private String highlights;
    private String bestTimeToVisit;

    public TouristAttraction() {}

    public TouristAttraction(int attractionId, String name, String category, String location, String openingHours, BigDecimal entryFee, String highlights, String bestTimeToVisit) {
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
    public void setAttractionId(int attractionId) { this.attractionId = attractionId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public BigDecimal getEntryFee() { return entryFee; }
    public void setEntryFee(BigDecimal entryFee) { this.entryFee = entryFee; }

    public String getHighlights() { return highlights; }
    public void setHighlights(String highlights) { this.highlights = highlights; }

    public String getBestTimeToVisit() { return bestTimeToVisit; }
    public void setBestTimeToVisit(String bestTimeToVisit) { this.bestTimeToVisit = bestTimeToVisit; }
}

