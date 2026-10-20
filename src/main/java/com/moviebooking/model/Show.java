
package com.moviebooking.model;

import java.time.LocalDate;
import java.time.LocalTime;

public class Show {
    private final int showId;
    private final int movieId;
    private final String movieName;
    private final LocalDate showDate;
    private final LocalTime showTime;
    private final int theatreId;
    private final String theatreName;
    private final String theatreLocation;

    public Show(int showId, int movieId, String movieName,
                LocalDate showDate, LocalTime showTime,
                int theatreId, String theatreName, String theatreLocation) {
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
    public int getMovieId() { return movieId; }
    public String getMovieName() { return movieName; }
    public LocalDate getShowDate() { return showDate; }
    public LocalTime getShowTime() { return showTime; }
    public int getTheatreId() { return theatreId; }
    public String getTheatreName() { return theatreName; }
    public String getTheatreLocation() { return theatreLocation; }

    @Override
    public String toString() {
        return String.format("%-4d | %-20s | %s | %s | %s | %s",
                showId, movieName, showDate, showTime,
                theatreName, theatreLocation);
    }
}
