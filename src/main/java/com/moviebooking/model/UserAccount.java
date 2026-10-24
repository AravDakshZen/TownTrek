package com.moviebooking.model;

public class UserAccount {
    private final int userId;
    private final String fullName;
    private final String email;

    public UserAccount(int userId, String fullName, String email) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    public int getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
}
