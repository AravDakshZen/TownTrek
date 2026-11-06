package com.towntrek.controller;

import com.towntrek.dao.BookingDAO;
import com.towntrek.dao.DistrictEventDAO;
import com.towntrek.dao.PartyConcertDAO;
import com.towntrek.model.EventRegistration;
import com.towntrek.model.MovieBookingDetail;
import com.towntrek.model.PartyBooking;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
            @RequestParam(required = false) String altName,
            @RequestParam(required = false) String altEmail,
            @RequestParam(required = false) String movieIds,
            @RequestParam(required = false) String partyIds,
            @RequestParam(required = false) String eventIds,
            @RequestParam(required = false, defaultValue = "false") boolean all) {

        Map<String, Object> result = new HashMap<>();

        boolean showAll = all || ((email == null || email.isBlank()) && (name == null || name.isBlank()) &&
                (altName == null || altName.isBlank()) && (altEmail == null || altEmail.isBlank()) &&
                (movieIds == null || movieIds.isBlank()));

        if (showAll) {
            // Return all passes across the system safely
            try {
                result.put("movieBookings", movieBookingDAO.findAllBookings());
            } catch (Exception e) {
                result.put("movieBookings", Collections.emptyList());
            }
            try {
                result.put("partyBookings", partyConcertDAO.findAllBookings());
            } catch (Exception e) {
                result.put("partyBookings", Collections.emptyList());
            }
            try {
                result.put("eventRegistrations", eventDAO.findAllRegistrations());
            } catch (Exception e) {
                result.put("eventRegistrations", Collections.emptyList());
            }
        } else {
            List<String> names = new ArrayList<>();
            if (name != null && !name.isBlank()) names.add(name.trim());
            if (altName != null && !altName.isBlank() && !names.contains(altName.trim())) names.add(altName.trim());

            List<String> emails = new ArrayList<>();
            if (email != null && !email.isBlank()) emails.add(email.trim());
            if (altEmail != null && !altEmail.isBlank() && !emails.contains(altEmail.trim())) emails.add(altEmail.trim());

            List<Integer> parsedMovieIds = parseIdList(movieIds);
            List<Integer> parsedPartyIds = parseIdList(partyIds);
            List<Integer> parsedEventIds = parseIdList(eventIds);

            try {
                List<MovieBookingDetail> movies = movieBookingDAO.findBookingsForUser(names, emails, parsedMovieIds);
                result.put("movieBookings", movies);
            } catch (Exception e) {
                result.put("movieBookings", Collections.emptyList());
            }

            try {
                List<PartyBooking> parties = partyConcertDAO.findBookingsForUser(names, emails, parsedPartyIds);
                result.put("partyBookings", parties);
            } catch (Exception e) {
                result.put("partyBookings", Collections.emptyList());
            }

            try {
                List<EventRegistration> events = eventDAO.findRegistrationsForUser(names, emails, parsedEventIds);
                result.put("eventRegistrations", events);
            } catch (Exception e) {
                result.put("eventRegistrations", Collections.emptyList());
            }
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

    @PostMapping({"/movies/{id}/cancel", "/movies/cancel/{id}"})
    public ResponseEntity<Map<String, Object>> cancelMovieBooking(@PathVariable int id) {
        boolean ok = movieBookingDAO.cancelBooking(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Booking #" + id + " cancelled. Seats released." : "Failed to cancel movie booking.");
        return ResponseEntity.ok(res);
    }

    @PostMapping({"/parties/{id}/cancel", "/parties/cancel/{id}"})
    public ResponseEntity<Map<String, Object>> cancelPartyBooking(@PathVariable int id) {
        boolean ok = partyConcertDAO.cancelBooking(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Party pass #" + id + " cancelled. Capacity updated." : "Failed to cancel party pass.");
        return ResponseEntity.ok(res);
    }

    @PostMapping({"/events/{id}/cancel", "/events/cancel/{id}"})
    public ResponseEntity<Map<String, Object>> cancelEventRegistration(@PathVariable int id) {
        boolean ok = eventDAO.cancelRegistration(id);
        Map<String, Object> res = new HashMap<>();
        res.put("success", ok);
        res.put("message", ok ? "Event registration #" + id + " cancelled. Spots released." : "Failed to cancel registration.");
        return ResponseEntity.ok(res);
    }

    private List<Integer> parseIdList(String raw) {
        if (raw == null || raw.isBlank()) return Collections.emptyList();
        List<Integer> list = new ArrayList<>();
        for (String part : raw.split(",")) {
            try {
                int val = Integer.parseInt(part.trim());
                list.add(val);
            } catch (NumberFormatException ignored) {}
        }
        return list;
    }
}
