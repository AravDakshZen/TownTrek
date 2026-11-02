package com.towntrek.controller;

import com.towntrek.dao.PartyConcertDAO;
import com.towntrek.dto.PartyBookingRequest;
import com.towntrek.model.PartyBooking;
import com.towntrek.model.PartyConcert;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parties")
public class PartyController {

    private final PartyConcertDAO partyConcertDAO;

    public PartyController(PartyConcertDAO partyConcertDAO) {
        this.partyConcertDAO = partyConcertDAO;
    }

    @GetMapping
    public ResponseEntity<List<PartyConcert>> getAllEvents(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(partyConcertDAO.findByCategory(category));
        }
        return ResponseEntity.ok(partyConcertDAO.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable int id) {
        PartyConcert event = partyConcertDAO.findById(id);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
        }
        return ResponseEntity.ok(event);
    }

    @PostMapping("/book")
    public ResponseEntity<?> bookTickets(@Valid @RequestBody PartyBookingRequest request) {
        try {
            int bookingId = partyConcertDAO.bookTickets(
                    request.getCustomerName(),
                    request.getUserEmail(),
                    request.getEventId(),
                    request.getTicketsCount()
            );
            List<PartyBooking> userBookings = partyConcertDAO.findBookingsByUser(request.getUserEmail());
            PartyBooking created = userBookings.stream()
                    .filter(b -> b.getBookingId() == bookingId)
                    .findFirst()
                    .orElse(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(created != null ? created : Map.of("bookingId", bookingId));
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
}

