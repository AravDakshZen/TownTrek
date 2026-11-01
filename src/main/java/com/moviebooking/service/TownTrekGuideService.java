package com.moviebooking.service;

import com.moviebooking.dao.CitySpotDAO;
import com.moviebooking.dao.EmergencyServiceDAO;
import com.moviebooking.dao.TouristAttractionDAO;
import com.moviebooking.model.CitySpot;
import com.moviebooking.model.EmergencyService;
import com.moviebooking.model.TouristAttraction;

import java.sql.SQLException;
import java.util.List;

public class DistrictGuideService {
    private final TouristAttractionDAO attractionDAO = new TouristAttractionDAO();
    private final CitySpotDAO spotDAO = new CitySpotDAO();
    private final EmergencyServiceDAO emergencyDAO = new EmergencyServiceDAO();

    // Tourist Attractions
    public List<TouristAttraction> getAllAttractions() throws SQLException {
        return attractionDAO.findAll();
    }

    public List<TouristAttraction> getAttractionsByCategory(String category) throws SQLException {
        return attractionDAO.findByCategory(category);
    }

    public List<TouristAttraction> searchAttractions(String keyword) throws SQLException {
        return attractionDAO.search(keyword);
    }

    // City Dining and Shopping Spots
    public List<CitySpot> getAllSpots() throws SQLException {
        return spotDAO.findAll();
    }

    public List<CitySpot> getSpotsByType(String type) throws SQLException {
        return spotDAO.findByType(type);
    }

    public List<CitySpot> searchSpots(String keyword) throws SQLException {
        return spotDAO.search(keyword);
    }

    // Emergency & Essential Public Services
    public List<EmergencyService> getAllEmergencyServices() throws SQLException {
        return emergencyDAO.findAll();
    }

    public List<EmergencyService> getEmergencyServicesByCategory(String category) throws SQLException {
        return emergencyDAO.findByCategory(category);
    }

    public List<EmergencyService> getRapidHelplines() throws SQLException {
        return emergencyDAO.findRapidHelplines();
    }
}
