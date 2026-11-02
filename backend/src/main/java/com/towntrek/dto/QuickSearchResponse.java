package com.towntrek.dto;

import com.towntrek.model.*;
import java.util.List;

public class QuickSearchResponse {
    private List<TouristAttraction> attractions;
    private List<CitySpot> spots;
    private List<PartyConcert> parties;
    private List<DistrictEvent> events;

    public QuickSearchResponse(List<TouristAttraction> attractions, List<CitySpot> spots, List<PartyConcert> parties, List<DistrictEvent> events) {
        this.attractions = attractions;
        this.spots = spots;
        this.parties = parties;
        this.events = events;
    }

    public List<TouristAttraction> getAttractions() { return attractions; }
    public List<CitySpot> getSpots() { return spots; }
    public List<PartyConcert> getParties() { return parties; }
    public List<DistrictEvent> getEvents() { return events; }
}

