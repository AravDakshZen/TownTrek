package com.moviebooking.model;

public class UserAccount {
    private final int userId;
    private final String fullName;
    private final String email;
    private final String city;

    public UserAccount(int userId, String fullName, String email) {
        this(userId, fullName, email, "Chennai");
    }

    public UserAccount(int userId, String fullName, String email, String city) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.city = (city != null && !city.isBlank()) ? city : "Chennai";
    }

    public int getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getCity() { return city; }
}
