package com.towntrek.controller;

import com.towntrek.dao.DistrictEventDAO;
import com.towntrek.dto.EventRegistrationRequest;
import com.towntrek.model.DistrictEvent;
import com.towntrek.model.EventRegistration;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final DistrictEventDAO eventDAO;

    public EventController(DistrictEventDAO eventDAO) {
        this.eventDAO = eventDAO;
    }

    @GetMapping
    public ResponseEntity<List<DistrictEvent>> getAllEvents(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(eventDAO.findByCategory(category));
        }
        return ResponseEntity.ok(eventDAO.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable int id) {
        DistrictEvent event = eventDAO.findById(id);
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Event not found");
        }
        return ResponseEntity.ok(event);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerForEvent(@Valid @RequestBody EventRegistrationRequest request) {
        try {
            int regId = eventDAO.register(
                    request.getCustomerName(),
                    request.getUserEmail(),
                    request.getEventId(),
                    request.getAttendeeCount()
            );
            List<EventRegistration> userRegs = eventDAO.findRegistrationsByUser(request.getUserEmail());
            EventRegistration created = userRegs.stream()
                    .filter(r -> r.getRegId() == regId)
                    .findFirst()
                    .orElse(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(created != null ? created : Map.of("regId", regId));
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

