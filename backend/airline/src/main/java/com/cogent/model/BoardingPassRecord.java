package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "boarding_pass_records",
       indexes = {
           @Index(name = "idx_boarding_booking_ref", columnList = "booking_reference"),
           @Index(name = "idx_boarding_flight", columnList = "flight_number")
       })
public class BoardingPassRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pass_reference", unique = true)
    private String passReference;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_reference")
    private String bookingReference;

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "flight_number")
    private String flightNumber;

    @Column(name = "route")
    private String route;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "departure_time")
    private String departureTime;

    @Column(name = "boarding_time")
    private String boardingTime;

    @Column(name = "gate")
    private String gate;

    @Column(name = "seat_number")
    private String seatNumber;

    @Column(name = "zone")
    private String zone;

    @Column(name = "class_type")
    private String classType;

    @Column(name = "status")
    private String status = "ISSUED";

    @Column(name = "issued_at")
    private LocalDateTime issuedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getPassReference() { return passReference; }
    public void setPassReference(String passReference) { this.passReference = passReference; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getBoardingTime() { return boardingTime; }
    public void setBoardingTime(String boardingTime) { this.boardingTime = boardingTime; }
    public String getGate() { return gate; }
    public void setGate(String gate) { this.gate = gate; }
    public String getSeatNumber() { return seatNumber; }
    public void setSeatNumber(String seatNumber) { this.seatNumber = seatNumber; }
    public String getZone() { return zone; }
    public void setZone(String zone) { this.zone = zone; }
    public String getClassType() { return classType; }
    public void setClassType(String classType) { this.classType = classType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
}
