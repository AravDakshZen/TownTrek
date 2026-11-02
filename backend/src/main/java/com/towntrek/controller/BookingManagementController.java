package com.towntrek.controller;

import com.towntrek.dao.BookingDAO;
import com.towntrek.dao.DistrictEventDAO;
import com.towntrek.dao.PartyConcertDAO;
import com.towntrek.model.EventRegistration;
import com.towntrek.model.MovieBookingDetail;
import com.towntrek.model.PartyBooking;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/passes")
public class BookingManagementController {

    private final BookingDAO movieBookingDAO;
    private final PartyConcertDAO partyConcertDAO;
    private final DistrictEventDAO eventDAO;

    public BookingManagementController(BookingDAO movieBookingDAO, PartyConcertDAO partyConcertDAO, DistrictEventDAO eventDAO) {
        this.movieBookingDAO = movieBookingDAO;
        this.partyConcertDAO = partyConcertDAO;
        this.eventDAO = eventDAO;
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllUserPasses(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false, defaultValue = "false") boolean all) {

        Map<String, Object> result = new HashMap<>();

        boolean showAll = all || ((email == null || email.isBlank()) && (name == null || name.isBlank()));

        if (showAll) {
            // Return all active and confirmed passes across the system
            result.put("movieBookings", movieBookingDAO.findAllBookings());
            result.put("partyBookings", partyConcertDAO.findAllBookings());
            result.put("eventRegistrations", eventDAO.findAllRegistrations());
        } else {
            // Search movies by customer name
            String searchName = (name != null && !name.isBlank()) ? name : email;
            List<MovieBookingDetail> movies = movieBookingDAO.findBookingsByCustomer(searchName);
            result.put("movieBookings", movies);

            // Search parties and events by email OR name
            List<PartyBooking> parties = partyConcertDAO.findBookingsByUserOrName(email, name);
            List<EventRegistration> events = eventDAO.findRegistrationsByUserOrName(email, name);
            result.put("partyBookings", parties);
            result.put("eventRegistrations", events);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<?> getMovieTicket(@PathVariable int id) {
        MovieBookingDetail detail = movieBookingDAO.findDetailById(id);
        if (detail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(detail);
    }

    @PostMapping("/movies/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelMovieBooking(@PathVariable int id) {
        boolean ok = movieBookingDAO.cancelBooking(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Booking #" + id + " cancelled. Seats released." : "Failed to cancel movie booking.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/parties/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelPartyBooking(@PathVariable int id) {
        boolean ok = partyConcertDAO.cancelBooking(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Party pass #" + id + " cancelled. Capacity updated." : "Failed to cancel party pass.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/events/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelEventRegistration(@PathVariable int id) {
        boolean ok = eventDAO.cancelRegistration(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Event registration #" + id + " cancelled. Spots released." : "Failed to cancel registration.");
        return ResponseEntity.ok(res);
    }
}
