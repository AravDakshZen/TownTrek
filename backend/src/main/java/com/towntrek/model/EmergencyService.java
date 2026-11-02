package com.towntrek.model;

public class EmergencyService {
    private int serviceId;
    private String serviceName;
    private String category;
    private String phoneNumber;
    private String alternateNumber;
    private String address;
    private boolean is247;
    private String notes;

    public EmergencyService() {}

    public EmergencyService(int serviceId, String serviceName, String category, String phoneNumber, String alternateNumber, String address, boolean is247, String notes) {
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
    public void setServiceId(int serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAlternateNumber() { return alternateNumber; }
    public void setAlternateNumber(String alternateNumber) { this.alternateNumber = alternateNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public boolean isIs247() { return is247; }
    public void setIs247(boolean is247) { this.is247 = is247; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

