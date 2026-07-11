package com.cogent.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_number", unique = true)
    private String flightNumber;
    
    private String origin;
    private String destination;
    
    // 
    @Column(name = "departure_date")
    private LocalDate departureDate;
    
    @Column(name = "departure_time")
    private LocalTime departureTime;
    
    @Column(name = "arrival_date")
    private LocalDate arrivalDate;
    
    @Column(name = "arrival_time")
    private LocalTime arrivalTime;
    
    private Double distance; // Distance in KM
    
    private String status;

    // Pricing Fields
    @Column(name = "base_price")
    private Double basePrice;
    
    @Column(name = "economy_price")
    private Double economyPrice;
    
    @Column(name = "premium_price")
    private Double premiumPrice;
    
    @Column(name = "business_price")
    private Double businessPrice;
    
    @Column(name = "first_class_price")
    private Double firstClassPrice;
    
    @Column(name = "total_seats")
    private Integer totalSeats = 119;

    @Column(name = "aircraft_icao")
    private String aircraftIcao;

    @Column(name = "aircraft_registration")
    private String aircraftRegistration;

    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "altitude_ft")
    private Integer altitudeFt;

    @Column(name = "speed_kmh")
    private Integer speedKmh;

    @Column(name = "heading_degree")
    private Integer headingDegree;

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Column(name = "estimated_landing_minutes")
    private Integer estimatedLandingMinutes;

    @Column(name = "tracking_mode")
    private String trackingMode = "MANUAL";

    @Column(name = "last_tracked_at")
    private LocalDateTime lastTrackedAt;
    
	// Default Constructor
       public Flight() {}

       public Long getId() { return id; }
       public void setId(Long id) { this.id = id; }

       public String getFlightNumber() { return flightNumber; }
       public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
       
       public String getOrigin() { return origin; }
       public void setOrigin(String origin) { this.origin = origin; }
       
       public String getDestination() { return destination; }
       public void setDestination(String destination) { this.destination = destination; }

       public LocalDate getDepartureDate() { return departureDate; }
       public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }

       public LocalTime getDepartureTime() { return departureTime; }
       public void setDepartureTime(LocalTime departureTime) { this.departureTime = departureTime; }

       public LocalDate getArrivalDate() { return arrivalDate; }
       public void setArrivalDate(LocalDate arrivalDate) { this.arrivalDate = arrivalDate; }

       public LocalTime getArrivalTime() { return arrivalTime; }
       public void setArrivalTime(LocalTime arrivalTime) { this.arrivalTime = arrivalTime; }

       public Double getDistance() { return distance; }
       public void setDistance(Double distance) { this.distance = distance; }

       public String getStatus() { return status; }
       public void setStatus(String status) { this.status = status; }

       public Double getBasePrice() { return basePrice; }
       public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

       public Double getEconomyPrice() { return economyPrice; }
       public void setEconomyPrice(Double economyPrice) { this.economyPrice = economyPrice; }

       public Double getPremiumPrice() { return premiumPrice; }
       public void setPremiumPrice(Double premiumPrice) { this.premiumPrice = premiumPrice; }

       public Double getBusinessPrice() { return businessPrice; }
       public void setBusinessPrice(Double businessPrice) { this.businessPrice = businessPrice; }

       public Double getFirstClassPrice() { return firstClassPrice; }
       public void setFirstClassPrice(Double firstClassPrice) { this.firstClassPrice = firstClassPrice; }

	   public Integer getTotalSeats() {
		return totalSeats;
	   }

	   public void setTotalSeats(Integer totalSeats) {
		this.totalSeats = totalSeats;
	   }

       public String getAircraftIcao() { return aircraftIcao; }
       public void setAircraftIcao(String aircraftIcao) { this.aircraftIcao = aircraftIcao; }

       public String getAircraftRegistration() { return aircraftRegistration; }
       public void setAircraftRegistration(String aircraftRegistration) { this.aircraftRegistration = aircraftRegistration; }

       public Double getOriginLatitude() { return originLatitude; }
       public void setOriginLatitude(Double originLatitude) { this.originLatitude = originLatitude; }

       public Double getOriginLongitude() { return originLongitude; }
       public void setOriginLongitude(Double originLongitude) { this.originLongitude = originLongitude; }

       public Double getDestinationLatitude() { return destinationLatitude; }
       public void setDestinationLatitude(Double destinationLatitude) { this.destinationLatitude = destinationLatitude; }

       public Double getDestinationLongitude() { return destinationLongitude; }
       public void setDestinationLongitude(Double destinationLongitude) { this.destinationLongitude = destinationLongitude; }

       public Double getCurrentLatitude() { return currentLatitude; }
       public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }

       public Double getCurrentLongitude() { return currentLongitude; }
       public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }

       public Integer getAltitudeFt() { return altitudeFt; }
       public void setAltitudeFt(Integer altitudeFt) { this.altitudeFt = altitudeFt; }

       public Integer getSpeedKmh() { return speedKmh; }
       public void setSpeedKmh(Integer speedKmh) { this.speedKmh = speedKmh; }

       public Integer getHeadingDegree() { return headingDegree; }
       public void setHeadingDegree(Integer headingDegree) { this.headingDegree = headingDegree; }

       public Integer getProgressPercent() { return progressPercent; }
       public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

       public Integer getEstimatedLandingMinutes() { return estimatedLandingMinutes; }
       public void setEstimatedLandingMinutes(Integer estimatedLandingMinutes) { this.estimatedLandingMinutes = estimatedLandingMinutes; }

       public String getTrackingMode() { return trackingMode; }
       public void setTrackingMode(String trackingMode) { this.trackingMode = trackingMode; }

       public LocalDateTime getLastTrackedAt() { return lastTrackedAt; }
       public void setLastTrackedAt(LocalDateTime lastTrackedAt) { this.lastTrackedAt = lastTrackedAt; }

	
}
