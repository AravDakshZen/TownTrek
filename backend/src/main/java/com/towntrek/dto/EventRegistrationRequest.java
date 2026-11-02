package com.towntrek.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class EventRegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Integer eventId;

    @NotNull(message = "Attendee count is required")
    @Min(value = 1, message = "At least 1 attendee must be registered")
    private Integer attendeeCount;

    private String customerName;
    private String userEmail;

    public EventRegistrationRequest() {}

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public Integer getAttendeeCount() { return attendeeCount; }
    public void setAttendeeCount(Integer attendeeCount) { this.attendeeCount = attendeeCount; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

