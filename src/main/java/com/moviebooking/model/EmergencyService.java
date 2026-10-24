package com.moviebooking.model;

public class EmergencyService {
    private final int serviceId;
    private final String serviceName;
    private final String category; // EMERGENCY_HELPLINE, HOSPITAL, POLICE, FIRE_SAFETY, CIVIC_TRANSIT
    private final String phoneNumber;
    private final String alternateNumber;
    private final String address;
    private final boolean is247;
    private final String notes;

    public EmergencyService(int serviceId, String serviceName, String category,
                            String phoneNumber, String alternateNumber, String address,
                            boolean is247, String notes) {
        this.serviceId = serviceId;
        this.serviceName = serviceName;
        this.category = category;
        this.phoneNumber = phoneNumber;
        this.alternateNumber = alternateNumber;
        this.address = address;
        this.is247 = is247;
        this.notes = notes;
    }

    public int getServiceId() { return serviceId; }
    public String getServiceName() { return serviceName; }
    public String getCategory() { return category; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAlternateNumber() { return alternateNumber; }
    public String getAddress() { return address; }
    public boolean is247() { return is247; }
    public String getNotes() { return notes; }
}
