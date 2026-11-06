package com.towntrek.controller;

import com.towntrek.dao.BookingDAO;
import com.towntrek.dao.MovieDAO;
import com.towntrek.dao.SeatDAO;
import com.towntrek.dao.ShowDAO;
import com.towntrek.dto.MovieBookingRequest;
import com.towntrek.model.Movie;
import com.towntrek.model.MovieBookingDetail;
import com.towntrek.model.Seat;
import com.towntrek.model.Show;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private static final Logger log = LoggerFactory.getLogger(MovieController.class);

    private final MovieDAO movieDAO;
    private final ShowDAO showDAO;
    private final SeatDAO seatDAO;
    private final BookingDAO bookingDAO;

    public MovieController(MovieDAO movieDAO, ShowDAO showDAO, SeatDAO seatDAO, BookingDAO bookingDAO) {
        this.movieDAO = movieDAO;
        this.showDAO = showDAO;
        this.seatDAO = seatDAO;
        this.bookingDAO = bookingDAO;
    }

    @GetMapping
    public ResponseEntity<?> getAllMovies() {
        try {
            List<Movie> movies = movieDAO.findAll();
            return ResponseEntity.ok(movies);
        } catch (Exception ex) {
            log.error("Failed to query movies from MySQL database: {}", ex.getMessage());
            Map<String, Object> err = new HashMap<>();
            err.put("error", "DatabaseQueryError");
            err.put("message", "Could not query movies table in MySQL: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable int id) {
        try {
            Movie movie = movieDAO.findById(id);
            if (movie == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Movie not found with ID: " + id));
            }
            return ResponseEntity.ok(movie);
        } catch (Exception ex) {
            log.error("Failed to query movie ID {}: {}", id, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/shows")
    public ResponseEntity<?> getAllShows() {
        try {
            return ResponseEntity.ok(showDAO.findAll());
        } catch (Exception ex) {
            log.error("Failed to query shows: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/{id}/shows")
    public ResponseEntity<?> getShowsForMovie(@PathVariable int id) {
        try {
            return ResponseEntity.ok(showDAO.findByMovie(id));
        } catch (Exception ex) {
            log.error("Failed to query shows for movie {}: {}", id, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/shows/{showId}")
    public ResponseEntity<?> getShowById(@PathVariable int showId) {
        try {
            Show show = showDAO.findById(showId);
            if (show == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Show not found"));
            }
            return ResponseEntity.ok(show);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/shows/{showId}/seats")
    public ResponseEntity<?> getSeatsForShow(@PathVariable int showId) {
        try {
            return ResponseEntity.ok(seatDAO.findByShow(showId));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/dates")
    public ResponseEntity<?> getDatesForMovie(@RequestParam String movieName) {
        try {
            return ResponseEntity.ok(showDAO.findDatesByMovie(movieName));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/theatres")
    public ResponseEntity<?> getTheatresForMovieAndDate(
            @RequestParam String movieName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            return ResponseEntity.ok(showDAO.findTheatresByMovieAndDate(movieName, date));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @GetMapping("/filter-shows")
    public ResponseEntity<?> getFilteredShows(
            @RequestParam String movieName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String theatreName) {
        try {
            return ResponseEntity.ok(showDAO.findShowsByMovieDateAndTheatre(movieName, date, theatreName));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "DatabaseQueryError", "message", ex.getMessage()));
        }
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookMovieTickets(@Valid @RequestBody MovieBookingRequest request) {
        try {
            int bookingId = bookingDAO.createBooking(
                    request.getCustomerName(),
                    request.getCustomerEmail(),
                    request.getMovieId(),
                    request.getShowId(),
                    request.getSeatCodes(),
                    request.getCouponCode()
            );
            MovieBookingDetail detail = bookingDAO.findDetailById(bookingId);
            return ResponseEntity.status(HttpStatus.CREATED).body(detail);
        } catch (IllegalStateException e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(err);
        } catch (Exception e) {
            Map<String, String> err = new HashMap<>();
            err.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
        }
    }

    @PostMapping({"/cancel/{id}", "/{id}/cancel"})
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable int id) {
        boolean ok = bookingDAO.cancelBooking(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Booking #" + id + " cancelled. Seats released." : "Failed to cancel movie booking.");
        return ResponseEntity.ok(res);
    }
}
