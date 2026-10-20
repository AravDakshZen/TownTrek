package com.moviebooking.model;

import java.math.BigDecimal;

public class Seat {
    private final int seatId;
    private final int showId;
    private final String seatCode;
    private final String seatType;
    private final BigDecimal price;
    private final String status;

    public Seat(int seatId, int showId, String seatCode, String seatType, BigDecimal price, String status) {
        this.seatId = seatId;
        this.showId = showId;
        this.seatCode = seatCode;
        this.seatType = seatType;
        this.price = price;
        this.status = status;
    }

    public int getSeatId() { return seatId; }
    public int getShowId() { return showId; }
    public String getSeatCode() { return seatCode; }
    public String getSeatType() { return seatType; }
    public BigDecimal getPrice() { return price; }
    public String getStatus() { return status; }
}
