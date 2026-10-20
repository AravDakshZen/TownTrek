package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Booking {
    private final int bookingId;
    private final String customerName;
    private final int movieId;
    private final int showId;
    private final String seatCodes;
    private final String couponCode;
    private final BigDecimal totalAmount;
    private final String bookingStatus;
    private final LocalDateTime bookingDate;

    public Booking(int bookingId, String customerName, int movieId, int showId,
                   String seatCodes, String couponCode, BigDecimal totalAmount,
                   String bookingStatus, LocalDateTime bookingDate) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.movieId = movieId;
        this.showId = showId;
        this.seatCodes = seatCodes;
        this.couponCode = couponCode;
        this.totalAmount = totalAmount;
        this.bookingStatus = bookingStatus;
        this.bookingDate = bookingDate;
    }

    public int getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public int getMovieId() { return movieId; }
    public int getShowId() { return showId; }
    public String getSeatCodes() { return seatCodes; }
    public String getCouponCode() { return couponCode; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getBookingStatus() { return bookingStatus; }
    public LocalDateTime getBookingDate() { return bookingDate; }
}
