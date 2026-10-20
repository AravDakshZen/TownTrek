package com.moviebooking.model;

public class Movie {
    private int movieId;
    private String movieName;
    private String genre;
    private int durationMinutes;
    private String language;

    public Movie(int movieId, String movieName, String genre, int durationMinutes, String language) {
        this.movieId = movieId;
        this.movieName = movieName;
        this.genre = genre;
        this.durationMinutes = durationMinutes;
        this.language = language;
    }

    public int getMovieId() { return movieId; }
    public String getMovieName() { return movieName; }
    public String getGenre() { return genre; }
    public int getDurationMinutes() { return durationMinutes; }
    public String getLanguage() { return language; }

    @Override
    public String toString() {
        return String.format("%-4d | %-22s | %-12s | %-5d min | %s",
                movieId, movieName, genre == null ? "-" : genre, durationMinutes,
                language == null ? "-" : language);
    }
}
