package com.towntrek.controller;

import com.towntrek.dao.CitySpotDAO;
import com.towntrek.dao.DistrictEventDAO;
import com.towntrek.dao.PartyConcertDAO;
import com.towntrek.dao.TouristAttractionDAO;
import com.towntrek.dto.QuickSearchResponse;
import com.towntrek.model.CitySpot;
import com.towntrek.model.DistrictEvent;
import com.towntrek.model.PartyConcert;
import com.towntrek.model.TouristAttraction;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final TouristAttractionDAO attractionDAO;
    private final CitySpotDAO spotDAO;
    private final PartyConcertDAO partyDAO;
    private final DistrictEventDAO eventDAO;

    public SearchController(TouristAttractionDAO attractionDAO, CitySpotDAO spotDAO, PartyConcertDAO partyDAO, DistrictEventDAO eventDAO) {
        this.attractionDAO = attractionDAO;
        this.spotDAO = spotDAO;
        this.partyDAO = partyDAO;
        this.eventDAO = eventDAO;
    }

    @GetMapping
    public ResponseEntity<QuickSearchResponse> quickSearch(@RequestParam(defaultValue = "") String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.ok(new QuickSearchResponse(List.of(), List.of(), List.of(), List.of()));
        }

        String keyword = q.trim();
        List<TouristAttraction> attractions = attractionDAO.search(keyword);
        List<CitySpot> spots = spotDAO.search(keyword);

        List<PartyConcert> parties = partyDAO.findAll().stream()
                .filter(p -> p.getTitle().toLowerCase().contains(keyword.toLowerCase())
                        || p.getArtistPerformer().toLowerCase().contains(keyword.toLowerCase())
                        || (p.getDescription() != null && p.getDescription().toLowerCase().contains(keyword.toLowerCase())))
                .toList();

        List<DistrictEvent> events = eventDAO.findAll().stream()
                .filter(e -> e.getTitle().toLowerCase().contains(keyword.toLowerCase())
                        || e.getVenue().toLowerCase().contains(keyword.toLowerCase())
                        || (e.getDescription() != null && e.getDescription().toLowerCase().contains(keyword.toLowerCase())))
                .toList();

        return ResponseEntity.ok(new QuickSearchResponse(attractions, spots, parties, events));
    }
}

