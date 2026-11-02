package com.towntrek.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Show {
    private int showId;
    private int movieId;
    private String movieName;
    private LocalDate showDate;
    private LocalTime showTime;
    private int theatreId;
    private String theatreName;
    private String theatreLocation;

    public Show() {}

    public Show(int showId, int movieId, String movieName, LocalDate showDate, LocalTime showTime, int theatreId, String theatreName, String theatreLocation) {
        this.showId = showId;
        this.movieId = movieId;
        this.movieName = movieName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.theatreId = theatreId;
        this.theatreName = theatreName;
        this.theatreLocation = theatreLocation;
    }

    public int getShowId() { return showId; }
    public void setShowId(int showId) { this.showId = showId; }

    public int getMovieId() { return movieId; }
    public void setMovieId(int movieId) { this.movieId = movieId; }

    public String getMovieName() { return movieName; }
    public void setMovieName(String movieName) { this.movieName = movieName; }

    public LocalDate getShowDate() { return showDate; }
    public void setShowDate(LocalDate showDate) { this.showDate = showDate; }

    public LocalTime getShowTime() { return showTime; }
    public void setShowTime(LocalTime showTime) { this.showTime = showTime; }

    public int getTheatreId() { return theatreId; }
    public void setTheatreId(int theatreId) { this.theatreId = theatreId; }

    public String getTheatreName() { return theatreName; }
    public void setTheatreName(String theatreName) { this.theatreName = theatreName; }

    public String getTheatreLocation() { return theatreLocation; }
    public void setTheatreLocation(String theatreLocation) { this.theatreLocation = theatreLocation; }
}

