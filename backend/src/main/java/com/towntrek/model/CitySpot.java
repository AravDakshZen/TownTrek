package com.towntrek.model;

import java.math.BigDecimal;

public class CitySpot {
    private int spotId;
    private String name;
    private String spotType;
    private String cuisineOrSpecialty;
    private String priceRange;
    private String address;
    private BigDecimal rating;
    private String contactNumber;
    private String timings;
    private String city;

    public CitySpot() {}

    public CitySpot(int spotId, String name, String spotType, String cuisineOrSpecialty, String priceRange, String address, BigDecimal rating, String contactNumber, String timings) {
        this(spotId, name, spotType, cuisineOrSpecialty, priceRange, address, rating, contactNumber, timings, "Chennai");
    }

    public CitySpot(int spotId, String name, String spotType, String cuisineOrSpecialty, String priceRange, String address, BigDecimal rating, String contactNumber, String timings, String city) {
        this.spotId = spotId;
        this.name = name;
        this.spotType = spotType;
        this.cuisineOrSpecialty = cuisineOrSpecialty;
        this.priceRange = priceRange;
        this.address = address;
        this.rating = rating;
        this.contactNumber = contactNumber;
        this.timings = timings;
        this.city = city != null && !city.isBlank() ? city : "Chennai";
    }

    public int getSpotId() { return spotId; }
    public void setSpotId(int spotId) { this.spotId = spotId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpotType() { return spotType; }
    public void setSpotType(String spotType) { this.spotType = spotType; }

    public String getCuisineOrSpecialty() { return cuisineOrSpecialty; }
    public void setCuisineOrSpecialty(String cuisineOrSpecialty) { this.cuisineOrSpecialty = cuisineOrSpecialty; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public String getTimings() { return timings; }
    public void setTimings(String timings) { this.timings = timings; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
