package com.towntrek.dto;

public class AuthResponse {
    private boolean success;
    private String message;
    private String token;
    private Integer userId;
    private String fullName;
    private String email;

    public AuthResponse(boolean success, String message, String token, Integer userId, String fullName, String email) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
    }

    public static AuthResponse success(String token, Integer userId, String fullName, String email) {
        return new AuthResponse(true, "Authentication successful", token, userId, fullName, email);
    }

    public static AuthResponse error(String message) {
        return new AuthResponse(false, message, null, null, null, null);
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getToken() { return token; }
    public Integer getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
}

