package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "baggage_support_cases",
       indexes = {
           @Index(name = "idx_baggage_booking_ref", columnList = "booking_reference"),
           @Index(name = "idx_baggage_status", columnList = "status")
       })
public class BaggageSupportCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "case_reference", unique = true)
    private String caseReference;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_reference")
    private String bookingReference;

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "passenger_email")
    private String passengerEmail;

    @Column(name = "flight_number")
    private String flightNumber;

    @Column(name = "route")
    private String route;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "issue_type")
    private String issueType;

    @Column(name = "checked_bags")
    private Integer checkedBags;

    @Column(name = "checked_weight_kg")
    private Double checkedWeightKg;

    @Column(name = "cabin_weight_kg")
    private Double cabinWeightKg;

    @Column(name = "allowance_kg")
    private Double allowanceKg;

    @Column(name = "excess_kg")
    private Double excessKg;

    @Column(name = "estimated_fee")
    private Double estimatedFee;

    @Column(name = "status")
    private String status = "OPEN";

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCaseReference() { return caseReference; }
    public void setCaseReference(String caseReference) { this.caseReference = caseReference; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getPassengerEmail() { return passengerEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; }
    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
    public String getRoute() { return route; }
    public void setRoute(String route) { this.route = route; }
    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }
    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public Integer getCheckedBags() { return checkedBags; }
    public void setCheckedBags(Integer checkedBags) { this.checkedBags = checkedBags; }
    public Double getCheckedWeightKg() { return checkedWeightKg; }
    public void setCheckedWeightKg(Double checkedWeightKg) { this.checkedWeightKg = checkedWeightKg; }
    public Double getCabinWeightKg() { return cabinWeightKg; }
    public void setCabinWeightKg(Double cabinWeightKg) { this.cabinWeightKg = cabinWeightKg; }
    public Double getAllowanceKg() { return allowanceKg; }
    public void setAllowanceKg(Double allowanceKg) { this.allowanceKg = allowanceKg; }
    public Double getExcessKg() { return excessKg; }
    public void setExcessKg(Double excessKg) { this.excessKg = excessKg; }
    public Double getEstimatedFee() { return estimatedFee; }
    public void setEstimatedFee(Double estimatedFee) { this.estimatedFee = estimatedFee; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
