package com.cogent.model;

import jakarta.persistence.*;

@Entity
@Table(name = "airlines")
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "airline_name")
    private String airlineName;

    @Column(name = "airline_code", unique = true)
    private String airlineCode;

    private String country;
    private String status;

    @Column(name = "headquarters")
    private String headquarters;

    @Column(name = "alliance")
    private String alliance;

    @Column(name = "fleet_size")
    private Integer fleetSize;

    @Column(name = "iata_prefix")
    private String iataPrefix;

    @Column(name = "primary_hub")
    private String primaryHub;

    @Column(name = "support_email")
    private String supportEmail;

    @Column(name = "support_phone")
    private String supportPhone;

    @Column(name = "logo_url", length = 1000)
    private String logoUrl;

    public Airline() {}

    // Getters and Setters
    public Long getId() { return id; }
    
    public void setId(Long id) { this.id = id; }
    
    public String getAirlineName() { return airlineName; }
    
    public void setAirlineName(String airlineName) { this.airlineName = airlineName; }
    
    public String getAirlineCode() { return airlineCode; }
    
    public void setAirlineCode(String airlineCode) { this.airlineCode = airlineCode; }
    
    public String getCountry() { return country; }
    
    public void setCountry(String country) { this.country = country; }
    
    public String getStatus() { return status; }
    
    public void setStatus(String status) { this.status = status; }

    public String getHeadquarters() { return headquarters; }

    public void setHeadquarters(String headquarters) { this.headquarters = headquarters; }

    public String getAlliance() { return alliance; }

    public void setAlliance(String alliance) { this.alliance = alliance; }

    public Integer getFleetSize() { return fleetSize; }

    public void setFleetSize(Integer fleetSize) { this.fleetSize = fleetSize; }

    public String getIataPrefix() { return iataPrefix; }

    public void setIataPrefix(String iataPrefix) { this.iataPrefix = iataPrefix; }

    public String getPrimaryHub() { return primaryHub; }

    public void setPrimaryHub(String primaryHub) { this.primaryHub = primaryHub; }

    public String getSupportEmail() { return supportEmail; }

    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }

    public String getSupportPhone() { return supportPhone; }

    public void setSupportPhone(String supportPhone) { this.supportPhone = supportPhone; }

    public String getLogoUrl() { return logoUrl; }

    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
