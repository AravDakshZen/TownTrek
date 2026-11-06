package com.towntrek.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class MovieBookingDetail {
    private int bookingId;
    private String customerName;
    private String customerEmail;
    private String movieName;
    private String theatreName;
    private LocalDate showDate;
    private LocalTime showTime;
    private String seatCodes;
    private BigDecimal totalAmount;
    private String bookingStatus;
    private LocalDateTime bookingDate;

    public MovieBookingDetail() {}

    public MovieBookingDetail(int bookingId, String customerName, String movieName, String theatreName,
                              LocalDate showDate, LocalTime showTime, String seatCodes, BigDecimal totalAmount,
                              String bookingStatus, LocalDateTime bookingDate) {
        this(bookingId, customerName, "", movieName, theatreName, showDate, showTime, seatCodes, totalAmount, bookingStatus, bookingDate);
    }

    public MovieBookingDetail(int bookingId, String customerName, String customerEmail, String movieName, String theatreName,
                              LocalDate showDate, LocalTime showTime, String seatCodes, BigDecimal totalAmount,
                              String bookingStatus, LocalDateTime bookingDate) {
        this.bookingId = bookingId;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
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
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getMovieName() { return movieName; }
    public void setMovieName(String movieName) { this.movieName = movieName; }

    public String getTheatreName() { return theatreName; }
    public void setTheatreName(String theatreName) { this.theatreName = theatreName; }

    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }

    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }

    public String getSeatCodes() { return seatCodes; }
    public void setSeatCodes(String seatCodes) { this.seatCodes = seatCodes; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public LocalDateTime getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDateTime bookingDate) { this.bookingDate = bookingDate; }
}
