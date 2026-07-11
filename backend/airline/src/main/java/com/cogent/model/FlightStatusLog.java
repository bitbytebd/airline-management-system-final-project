package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA auto-creates table: flight_status_log
 * Requires application.properties: spring.jpa.hibernate.ddl-auto=update
 */
@Entity
@Table(name = "flight_status_log",
       indexes = {
           @Index(name = "idx_fsl_flight_id", columnList = "flight_id"),
           @Index(name = "idx_fsl_status",    columnList = "flight_status"),
           @Index(name = "idx_fsl_logged_at", columnList = "logged_at")
       })
public class FlightStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "flight_id", nullable = false)
    private Long flightId;

    @Column(name = "flight_number", nullable = false)
    private String flightNumber;

    @Column(name = "origin")
    private String origin;

    @Column(name = "destination")
    private String destination;

    @Column(name = "scheduled_departure")
    private LocalDateTime scheduledDeparture;

    @Column(name = "scheduled_arrival")
    private LocalDateTime scheduledArrival;

    @Column(name = "actual_departure")
    private LocalDateTime actualDeparture;

    @Column(name = "actual_arrival")
    private LocalDateTime actualArrival;

    @Column(name = "estimated_arrival")
    private LocalDateTime estimatedArrival;

    @Enumerated(EnumType.STRING)
    @Column(name = "flight_status", nullable = false)
    private FlightStatus flightStatus = FlightStatus.SCHEDULED;

    @Column(name = "delay_minutes")
    private Integer delayMinutes = 0;

    @Column(name = "delay_reason")
    private String delayReason;

    @Column(name = "departure_gate")
    private String departureGate;

    @Column(name = "arrival_gate")
    private String arrivalGate;

    @Column(name = "terminal")
    private String terminal;

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

    @Column(name = "distance_remaining_km")
    private Double distanceRemainingKm;

    @Column(name = "estimated_landing_minutes")
    private Integer estimatedLandingMinutes;

    @Column(name = "last_gps_updated_at")
    private LocalDateTime lastGpsUpdatedAt;

    @Column(name = "aircraft_icao")
    private String aircraftIcao;

    @Column(name = "aircraft_registration")
    private String aircraftRegistration;

    @Column(name = "tracking_source")
    private String trackingSource;

    @Column(name = "tracking_mode")
    private String trackingMode;

    @Column(name = "origin_latitude")
    private Double originLatitude;

    @Column(name = "origin_longitude")
    private Double originLongitude;

    @Column(name = "destination_latitude")
    private Double destinationLatitude;

    @Column(name = "destination_longitude")
    private Double destinationLongitude;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "remaining_distance_km")
    private Double remainingDistanceKm;

    @Column(name = "last_tracked_at")
    private LocalDateTime lastTrackedAt;

    @Column(name = "progress_percent")
    private Integer progressPercent = 0;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();

    @Column(name = "logged_by")
    private String loggedBy;

    public enum FlightStatus {
        SCHEDULED, BOARDING, DEPARTED, EN_ROUTE,
        APPROACHING, LANDED, ARRIVED,
        DELAYED, CANCELLED, DIVERTED, GATE_HOLD
    }

    public FlightStatusLog() {}

    public Long getId()                            { return id; }
    
    public void setId(Long id)                     { this.id = id; }
    
    public Long getFlightId()                      { return flightId; }
    
    public void setFlightId(Long v)                { this.flightId = v; }
    
    public String getFlightNumber()                { return flightNumber; }
    
    public void setFlightNumber(String v)          { this.flightNumber = v; }
    
    public String getOrigin()                      { return origin; }
    
    public void setOrigin(String v)                { this.origin = v; }
    
    public String getDestination()                 { return destination; }
    
    public void setDestination(String v)           { this.destination = v; }
    
    public LocalDateTime getScheduledDeparture()   { return scheduledDeparture; }
    
    public void setScheduledDeparture(LocalDateTime v) { this.scheduledDeparture = v; }
    
    public LocalDateTime getScheduledArrival()     { return scheduledArrival; }
    
    public void setScheduledArrival(LocalDateTime v)   { this.scheduledArrival = v; }
    
    public LocalDateTime getActualDeparture()      { return actualDeparture; }
    
    public void setActualDeparture(LocalDateTime v){ this.actualDeparture = v; }
    
    public LocalDateTime getActualArrival()        { return actualArrival; }
    
    public void setActualArrival(LocalDateTime v)  { this.actualArrival = v; }
    
    public LocalDateTime getEstimatedArrival()     { return estimatedArrival; }
    
    public void setEstimatedArrival(LocalDateTime v){ this.estimatedArrival = v; }
    
    public FlightStatus getFlightStatus()          { return flightStatus; }
    
    public void setFlightStatus(FlightStatus v)    { this.flightStatus = v; }
    
    public Integer getDelayMinutes()               { return delayMinutes; }
    
    public void setDelayMinutes(Integer v)         { this.delayMinutes = v; }
    
    public String getDelayReason()                 { return delayReason; }
    
    public void setDelayReason(String v)           { this.delayReason = v; }
    
    public String getDepartureGate()               { return departureGate; }
    
    public void setDepartureGate(String v)         { this.departureGate = v; }
    
    public String getArrivalGate()                 { return arrivalGate; }
    
    public void setArrivalGate(String v)           { this.arrivalGate = v; }
    
    public String getTerminal()                    { return terminal; }

    public Double getCurrentLatitude()             { return currentLatitude; }
    
    public void setCurrentLatitude(Double v)       { this.currentLatitude = v; }
    
    public Double getCurrentLongitude()            { return currentLongitude; }
    
    public void setCurrentLongitude(Double v)      { this.currentLongitude = v; }
    
    public Integer getAltitudeFt()                 { return altitudeFt; }
    
    public void setAltitudeFt(Integer v)           { this.altitudeFt = v; }

    public void setSpeedKmh(Integer v)             { this.speedKmh = v; }

    public Integer getHeadingDegree()              { return headingDegree; }

    public void setHeadingDegree(Integer v)        { this.headingDegree = v; }

    public Double getDistanceRemainingKm()         { return distanceRemainingKm; }

    public void setDistanceRemainingKm(Double v)   { this.distanceRemainingKm = v; }

    public Integer getEstimatedLandingMinutes()    { return estimatedLandingMinutes; }

    public void setEstimatedLandingMinutes(Integer v) { this.estimatedLandingMinutes = v; }

    public LocalDateTime getLastGpsUpdatedAt()     { return lastGpsUpdatedAt; }

    public void setLastGpsUpdatedAt(LocalDateTime v) { this.lastGpsUpdatedAt = v; }

    public String getAircraftIcao()                { return aircraftIcao; }

    public void setAircraftIcao(String v)          { this.aircraftIcao = v; }

    public String getAircraftRegistration()        { return aircraftRegistration; }

    public void setAircraftRegistration(String v)  { this.aircraftRegistration = v; }

    public String getTrackingSource()              { return trackingSource; }

    public void setTrackingSource(String v)        { this.trackingSource = v; }

    public String getTrackingMode()                { return trackingMode; }

    public void setTrackingMode(String v)          { this.trackingMode = v; }

    public Double getOriginLatitude()              { return originLatitude; }

    public void setOriginLatitude(Double v)        { this.originLatitude = v; }

    public Double getOriginLongitude()             { return originLongitude; }

    public void setOriginLongitude(Double v)       { this.originLongitude = v; }

    public Double getDestinationLatitude()         { return destinationLatitude; }

    public void setDestinationLatitude(Double v)   { this.destinationLatitude = v; }

    public Double getDestinationLongitude()        { return destinationLongitude; }

    public void setDestinationLongitude(Double v)  { this.destinationLongitude = v; }

    public Double getDistanceKm()                  { return distanceKm; }

    public void setDistanceKm(Double v)            { this.distanceKm = v; }

    public Double getRemainingDistanceKm()         { return remainingDistanceKm; }

    public void setRemainingDistanceKm(Double v)   { this.remainingDistanceKm = v; }

    public LocalDateTime getLastTrackedAt()        { return lastTrackedAt; }

    public void setLastTrackedAt(LocalDateTime v)  { this.lastTrackedAt = v; }
    
    public Integer getProgressPercent()            { return progressPercent; }
    
    public void setProgressPercent(Integer v)      { this.progressPercent = v; }
    
    public LocalDateTime getLoggedAt()             { return loggedAt; }
    
    public void setLoggedAt(LocalDateTime v)       { this.loggedAt = v; }
    
    public String getLoggedBy()                    { return loggedBy; }
    
    public void setLoggedBy(String v)              { this.loggedBy = v; }

	public Integer getSpeedKmh() {
		return speedKmh;
	}

	public void setTerminal(String terminal) {
		this.terminal = terminal;
	}


}
