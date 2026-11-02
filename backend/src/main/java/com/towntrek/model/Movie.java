package com.towntrek.model;

public class Movie {
    private int movieId;
    private String movieName;
    private String genre;
    private int durationMinutes;
    private String language;
    private String posterUrl;

    public Movie() {}

    public Movie(int movieId, String movieName, String genre, int durationMinutes, String language) {
        this.movieId = movieId;
        this.movieName = movieName;
        this.genre = genre;
        this.durationMinutes = durationMinutes;
        this.language = language;
    }

    public int getMovieId() { return movieId; }
    public void setMovieId(int movieId) { this.movieId = movieId; }

    public String getMovieName() { return movieName; }
    public void setMovieName(String movieName) { this.movieName = movieName; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
}

