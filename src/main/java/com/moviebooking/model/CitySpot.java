package com.moviebooking.model;

import java.math.BigDecimal;

public class CitySpot {
    private final int spotId;
    private final String name;
    private final String spotType; // RESTAURANT, CAFE, SHOPPING_MALL, STREET_FOOD_HUB, LOCAL_BAZAAR
    private final String cuisineOrSpecialty;
    private final String priceRange; // ₹, ₹₹, ₹₹₹, ₹₹₹₹
    private final String address;
    private final BigDecimal rating;
    private final String contactNumber;
    private final String timings;

    public CitySpot(int spotId, String name, String spotType, String cuisineOrSpecialty,
                    String priceRange, String address, BigDecimal rating,
                    String contactNumber, String timings) {
        this.spotId = spotId;
        this.name = name;
        this.spotType = spotType;
        this.cuisineOrSpecialty = cuisineOrSpecialty;
        this.priceRange = priceRange;
        this.address = address;
        this.rating = rating;
        this.contactNumber = contactNumber;
        this.timings = timings;
    }

    public int getSpotId() { return spotId; }
    public String getName() { return name; }
    public String getSpotType() { return spotType; }
    public String getCuisineOrSpecialty() { return cuisineOrSpecialty; }
    public String getPriceRange() { return priceRange; }
    public String getAddress() { return address; }
    public BigDecimal getRating() { return rating; }
    public String getContactNumber() { return contactNumber; }
    public String getTimings() { return timings; }
}
