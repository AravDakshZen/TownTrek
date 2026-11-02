package com.towntrek.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class PartyBookingRequest {
    @NotNull(message = "Event ID is required")
    private Integer eventId;

    @NotNull(message = "Tickets count is required")
    @Min(value = 1, message = "At least 1 ticket must be booked")
    private Integer ticketsCount;

    private String customerName;
    private String userEmail;

    public PartyBookingRequest() {}

    public Integer getEventId() { return eventId; }
    public void setEventId(Integer eventId) { this.eventId = eventId; }

    public Integer getTicketsCount() { return ticketsCount; }
    public void setTicketsCount(Integer ticketsCount) { this.ticketsCount = ticketsCount; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

