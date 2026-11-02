package com.towntrek.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MovieBookingRequest {
    @NotNull(message = "Show ID is required")
    private Integer showId;

    @NotNull(message = "Movie ID is required")
    private Integer movieId;

    private String customerName;
    private String customerEmail;

    @NotEmpty(message = "At least one seat code must be selected")
    private List<String> seatCodes;

    private String couponCode;

    public MovieBookingRequest() {}

    public Integer getShowId() { return showId; }
    public void setShowId(Integer showId) { this.showId = showId; }

    public Integer getMovieId() { return movieId; }
    public void setMovieId(Integer movieId) { this.movieId = movieId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public List<String> getSeatCodes() { return seatCodes; }
    public void setSeatCodes(List<String> seatCodes) { this.seatCodes = seatCodes; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}

