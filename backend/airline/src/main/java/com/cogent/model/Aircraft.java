package com.cogent.model;

import jakarta.persistence.*;

@Entity
@Table(name = "aircrafts")
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "aircraft_code", unique = true)
    private String aircraftCode;

    @Column(name = "aircraft_name")
    private String aircraftName;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    private Integer capacity;
    private String status;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "aircraft_type")
    private String aircraftType;

    @Column(name = "cabin_classes")
    private String cabinClasses;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "cruise_speed_kmh")
    private Integer cruiseSpeedKmh;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    public Aircraft() {}

    // Getters and Setters
    public Long getId(){
    	     return id; }
    public void setId(Long id) { 
    	         this.id = id; }
    
    public String getModelName() {
    	           return modelName; }
    public void setModelName(String modelName) {
    	                   this.modelName = modelName; }

    public String getAircraftCode() {
        return aircraftCode;
    }

    public void setAircraftCode(String aircraftCode) {
        this.aircraftCode = aircraftCode;
    }

    public String getAircraftName() {
        return aircraftName;
    }

    public void setAircraftName(String aircraftName) {
        this.aircraftName = aircraftName;
    }
    
    public String getRegistrationNumber() { 
    	                      return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { 
    	                              this.registrationNumber = registrationNumber; }
    
    public Integer getCapacity() { 
    	                      return capacity; }
    public void setCapacity(Integer capacity) {
    	                         this.capacity = capacity; }
    
    public String getStatus() { 
    	                      return status; }
    public void setStatus(String status) {
    	                         this.status = status; }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getAircraftType() {
        return aircraftType;
    }

    public void setAircraftType(String aircraftType) {
        this.aircraftType = aircraftType;
    }

    public String getCabinClasses() {
        return cabinClasses;
    }

    public void setCabinClasses(String cabinClasses) {
        this.cabinClasses = cabinClasses;
    }

    public Integer getRangeKm() {
        return rangeKm;
    }

    public void setRangeKm(Integer rangeKm) {
        this.rangeKm = rangeKm;
    }

    public Integer getCruiseSpeedKmh() {
        return cruiseSpeedKmh;
    }

    public void setCruiseSpeedKmh(Integer cruiseSpeedKmh) {
        this.cruiseSpeedKmh = cruiseSpeedKmh;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
