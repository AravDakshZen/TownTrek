package com.towntrek.model;

public class UserAccount {
    private int userId;
    private String fullName;
    private String email;
    private String city;

    public UserAccount() {}

    public UserAccount(int userId, String fullName, String email) {
        this(userId, fullName, email, "Chennai");
    }

    public UserAccount(int userId, String fullName, String email, String city) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.city = city != null && !city.isBlank() ? city : "Chennai";
    }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}
