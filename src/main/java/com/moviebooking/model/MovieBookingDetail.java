package com.moviebooking.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class MovieBookingDetail {
    private final int bookingId;
    private final String customerName;
    private final String movieName;
    private final String theatreName;
    private final LocalDate showDate;
    private final LocalTime showTime;
    private final String seatCodes;
    private final BigDecimal totalAmount;
    private final String bookingStatus;
    private final LocalDateTime bookingDate;

    public MovieBookingDetail(int bookingId, String customerName, String movieName,
                              String theatreName, LocalDate showDate, LocalTime showTime,
                              String seatCodes, BigDecimal totalAmount, String bookingStatus,
                              LocalDateTime bookingDate) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.movieName = movieName;
        this.theatreName = theatreName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.seatCodes = seatCodes;
        this.totalAmount = totalAmount;
        this.bookingStatus = bookingStatus;
        this.bookingDate = bookingDate;
    }

    public int getBookingId() { return bookingId; }
    public String getCustomerName() { return customerName; }
    public String getMovieName() { return movieName; }
    public String getTheatreName() { return theatreName; }
    public LocalDate getShowDate() { return showDate; }
    public LocalTime getShowTime() { return showTime; }
    public String getSeatCodes() { return seatCodes; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getBookingStatus() { return bookingStatus; }
    public LocalDateTime getBookingDate() { return bookingDate; }
}
