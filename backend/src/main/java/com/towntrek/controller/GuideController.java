package com.towntrek.controller;

import com.towntrek.dao.CitySpotDAO;
import com.towntrek.dao.EmergencyServiceDAO;
import com.towntrek.dao.TouristAttractionDAO;
import com.towntrek.model.CitySpot;
import com.towntrek.model.EmergencyService;
import com.towntrek.model.TouristAttraction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/guide")
public class GuideController {

    private final TouristAttractionDAO attractionDAO;
    private final CitySpotDAO spotDAO;
    private final EmergencyServiceDAO emergencyDAO;

    public GuideController(TouristAttractionDAO attractionDAO, CitySpotDAO spotDAO, EmergencyServiceDAO emergencyDAO) {
        this.attractionDAO = attractionDAO;
        this.spotDAO = spotDAO;
        this.emergencyDAO = emergencyDAO;
    }

    // --- Tourist Attractions ---
    @GetMapping("/attractions")
    public ResponseEntity<List<TouristAttraction>> getAttractions(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(attractionDAO.findByCategory(category));
        }
        return ResponseEntity.ok(attractionDAO.findAll());
    }

    @GetMapping("/attractions/{id}")
    public ResponseEntity<?> getAttractionById(@PathVariable int id) {
        TouristAttraction attraction = attractionDAO.findById(id);
        if (attraction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Attraction not found");
        }
        return ResponseEntity.ok(attraction);
    }

    // --- City Dining & Shopping Spots ---
    @GetMapping("/spots")
    public ResponseEntity<List<CitySpot>> getSpots(@RequestParam(required = false) String type) {
        if (type != null && !type.isBlank()) {
            return ResponseEntity.ok(spotDAO.findByType(type));
        }
        return ResponseEntity.ok(spotDAO.findAll());
    }

    @GetMapping("/spots/{id}")
    public ResponseEntity<?> getSpotById(@PathVariable int id) {
        CitySpot spot = spotDAO.findById(id);
        if (spot == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Spot not found");
        }
        return ResponseEntity.ok(spot);
    }

    // --- Emergency & Civic Services ---
    @GetMapping("/emergency")
    public ResponseEntity<List<EmergencyService>> getEmergencyServices(@RequestParam(required = false) String category) {
        if (category != null && !category.isBlank()) {
            return ResponseEntity.ok(emergencyDAO.findByCategory(category));
        }
        return ResponseEntity.ok(emergencyDAO.findAll());
    }

    @GetMapping("/emergency/rapid")
    public ResponseEntity<List<EmergencyService>> getRapidHelplines() {
        return ResponseEntity.ok(emergencyDAO.findRapidHelplines());
    }
}

