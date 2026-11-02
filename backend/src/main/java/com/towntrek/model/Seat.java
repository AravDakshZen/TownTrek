package com.towntrek.model;

import java.math.BigDecimal;

public class Seat {
    private int seatId;
    private int showId;
    private String seatCode;
    private String seatType;
    private BigDecimal price;
    private String status;

    public Seat() {}

    public Seat(int seatId, int showId, String seatCode, String seatType, BigDecimal price, String status) {
        this.seatId = seatId;
        this.showId = showId;
        this.seatCode = seatCode;
        this.seatType = seatType;
        this.price = price;
        this.status = status;
    }

    public int getSeatId() { return seatId; }
    public void setSeatId(int seatId) { this.seatId = seatId; }

    public int getShowId() { return showId; }
    public void setShowId(int showId) { this.showId = showId; }

    public String getSeatCode() { return seatCode; }
    public void setSeatCode(String seatCode) { this.seatCode = seatCode; }

    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

