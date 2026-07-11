package com.cogent.dto;
 
import com.cogent.model.FlightStatusLog.FlightStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
 
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TrackingDTO {
 
    public static class UpdateRequest {
        private FlightStatus flightStatus;
        private Integer   delayMinutes;
        private String    delayReason;
        private String    departureGate;
        private String    arrivalGate;
        private String    terminal;
        private Double    currentLatitude;
        private Double    currentLongitude;
        private Integer   altitudeFt;
        private Integer   speedKmh;
        private Integer   headingDegree;
        private Double    distanceRemainingKm;
        private Integer   estimatedLandingMinutes;
        private String    lastGpsUpdatedAt;
        private String    aircraftIcao;
        private String    aircraftRegistration;
        private String    trackingMode;
        private String    trackingSource;
        private Double    originLatitude;
        private Double    originLongitude;
        private Double    destinationLatitude;
        private Double    destinationLongitude;
        private Double    distanceKm;
        private Double    remainingDistanceKm;
        private Integer   progressPercent;
        private String    actualDeparture;
        private String    actualArrival;
        private String    estimatedArrival;
 
        public FlightStatus getFlightStatus()         { return flightStatus; }
        public void setFlightStatus(FlightStatus v)   { this.flightStatus = v; }
        public Integer getDelayMinutes()              { return delayMinutes; }
        public void setDelayMinutes(Integer v)        { this.delayMinutes = v; }
        public String getDelayReason()                { return delayReason; }
        public void setDelayReason(String v)          { this.delayReason = v; }
        public String getDepartureGate()              { return departureGate; }
        public void setDepartureGate(String v)        { this.departureGate = v; }
        public String getArrivalGate()                { return arrivalGate; }
        public void setArrivalGate(String v)          { this.arrivalGate = v; }
        public String getTerminal()                   { return terminal; }
        public void setTerminal(String v)             { this.terminal = v; }
        public Double getCurrentLatitude()            { return currentLatitude; }
        public void setCurrentLatitude(Double v)      { this.currentLatitude = v; }
        public Double getCurrentLongitude()           { return currentLongitude; }
        public void setCurrentLongitude(Double v)     { this.currentLongitude = v; }
        public Integer getAltitudeFt()                { return altitudeFt; }
        public void setAltitudeFt(Integer v)          { this.altitudeFt = v; }
        public Integer getSpeedKmh()                  { return speedKmh; }
        public void setSpeedKmh(Integer v)            { this.speedKmh = v; }
        public Integer getHeadingDegree()             { return headingDegree; }
        public void setHeadingDegree(Integer v)       { this.headingDegree = v; }
        public Double getDistanceRemainingKm()        { return distanceRemainingKm; }
        public void setDistanceRemainingKm(Double v)  { this.distanceRemainingKm = v; }
        public Integer getEstimatedLandingMinutes()   { return estimatedLandingMinutes; }
        public void setEstimatedLandingMinutes(Integer v) { this.estimatedLandingMinutes = v; }
        public String getLastGpsUpdatedAt()           { return lastGpsUpdatedAt; }
        public void setLastGpsUpdatedAt(String v)     { this.lastGpsUpdatedAt = v; }
        public String getAircraftIcao()               { return aircraftIcao; }
        public void setAircraftIcao(String v)         { this.aircraftIcao = v; }
        public String getAircraftRegistration()       { return aircraftRegistration; }
        public void setAircraftRegistration(String v) { this.aircraftRegistration = v; }
        public String getTrackingMode()               { return trackingMode; }
        public void setTrackingMode(String v)         { this.trackingMode = v; }
        public String getTrackingSource()             { return trackingSource; }
        public void setTrackingSource(String v)       { this.trackingSource = v; }
        public Double getOriginLatitude()             { return originLatitude; }
        public void setOriginLatitude(Double v)       { this.originLatitude = v; }
        public Double getOriginLongitude()            { return originLongitude; }
        public void setOriginLongitude(Double v)      { this.originLongitude = v; }
        public Double getDestinationLatitude()        { return destinationLatitude; }
        public void setDestinationLatitude(Double v)  { this.destinationLatitude = v; }
        public Double getDestinationLongitude()       { return destinationLongitude; }
        public void setDestinationLongitude(Double v) { this.destinationLongitude = v; }
        public Double getDistanceKm()                 { return distanceKm; }
        public void setDistanceKm(Double v)           { this.distanceKm = v; }
        public Double getRemainingDistanceKm()        { return remainingDistanceKm; }
        public void setRemainingDistanceKm(Double v)  { this.remainingDistanceKm = v; }
        public Integer getProgressPercent()           { return progressPercent; }
        public void setProgressPercent(Integer v)     { this.progressPercent = v; }
        public String getActualDeparture()            { return actualDeparture; }
        public void setActualDeparture(String v)      { this.actualDeparture = v; }
        public String getActualArrival()              { return actualArrival; }
        public void setActualArrival(String v)        { this.actualArrival = v; }
        public String getEstimatedArrival()           { return estimatedArrival; }
        public void setEstimatedArrival(String v)     { this.estimatedArrival = v; }
    }
 
    public static class QuickRequest {
        private String status;
        private String reason;
        public String getStatus()        { return status; }
        public void setStatus(String v)  { this.status = v; }
        public String getReason()        { return reason; }
        public void setReason(String v)  { this.reason = v; }
    }

    public static class AutoCalculateRequest {
        private Long flightId;
        private String flightNumber;
        private String origin;
        private String destination;
        private String departureDate;
        private String departureTime;

        public Long getFlightId()              { return flightId; }
        public void setFlightId(Long v)        { this.flightId = v; }
        public String getFlightNumber()        { return flightNumber; }
        public void setFlightNumber(String v)  { this.flightNumber = v; }
        public String getOrigin()              { return origin; }
        public void setOrigin(String v)        { this.origin = v; }
        public String getDestination()         { return destination; }
        public void setDestination(String v)   { this.destination = v; }
        public String getDepartureDate()       { return departureDate; }
        public void setDepartureDate(String v) { this.departureDate = v; }
        public String getDepartureTime()       { return departureTime; }
        public void setDepartureTime(String v) { this.departureTime = v; }
    }
}
