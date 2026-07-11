package com.cogent.model;

// ═══════════════════════════════════════════════════════════════════
// FILE  : src/main/java/com/cogent/model/Refund.java
// TABLE : refunds  (auto-created by JPA — ddl-auto=update)
// COLS  : id, refund_reference, booking_id, booking_reference,
//         passenger_id, passenger_name, passenger_email,
//         flight_number, flight_route, departure_date, class_type,
//         original_amount, penalty_percentage, penalty_amount,
//         refund_amount, payment_method, refund_reason, reason_notes,
//         status, requested_at, processed_at, processed_by
// ═══════════════════════════════════════════════════════════════════

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "refunds",
       indexes = {
           @Index(name = "idx_refund_booking_id",  columnList = "booking_id"),
           @Index(name = "idx_refund_status",       columnList = "status"),
           @Index(name = "idx_refund_requested_at", columnList = "requested_at")
       })
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Refund Identity ──────────────────────────────────────────
    @Column(name = "refund_reference", unique = true)
    private String refundReference;                // e.g. RFD-ABCD1234

    // ── Booking Link ─────────────────────────────────────────────
    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(name = "booking_reference")
    private String bookingReference;               // from Booking.bookingReference

    // ── Passenger Snapshot ───────────────────────────────────────
    @Column(name = "passenger_id")
    private Long passengerId;                      // from Booking.passengerId

    @Column(name = "passenger_name")
    private String passengerName;                  // from Booking.passengerName

    @Column(name = "passenger_email")
    private String passengerEmail;                 // from Booking.email

    // ── Flight Snapshot ──────────────────────────────────────────
    @Column(name = "flight_number")
    private String flightNumber;                   // from Booking.flightNumber

    @Column(name = "flight_route")
    private String flightRoute;                    // e.g. "Dhaka → Chittagong"

    @Column(name = "departure_date")
    private LocalDate departureDate;               // from Booking.departureDate

    @Column(name = "class_type")
    private String classType;                      // from Booking.classType

    // ── Financials ───────────────────────────────────────────────
    @Column(name = "original_amount")
    private Double originalAmount;                 // = Booking.totalPrice

    @Column(name = "penalty_percentage")
    private Double penaltyPercentage;              // 0 / 10 / 25 / 50 / 100

    @Column(name = "penalty_amount")
    private Double penaltyAmount;

    @Column(name = "refund_amount")
    private Double refundAmount;

    @Column(name = "payment_method")
    private String paymentMethod;                  // from Booking.paymentMethod

    // ── Reason ───────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "refund_reason")
    private RefundReason refundReason;

    @Column(name = "reason_notes")
    private String reasonNotes;

    // ── Workflow Status ──────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RefundStatus status = RefundStatus.PENDING;

    // ── Audit ────────────────────────────────────────────────────
    @Column(name = "requested_at")
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private String processedBy;

    // ── Enums ────────────────────────────────────────────────────
    public enum RefundReason {
        PASSENGER_CANCEL,   // Passenger voluntary cancellation
        FLIGHT_CANCEL,      // Airline cancelled flight → 0% penalty
        FLIGHT_DELAY,       // Significant delay → 0% penalty
        OVERBOOKING,        // Bumped due to overbooking → 0% penalty
        MEDICAL,            // Medical emergency
        WEATHER,            // Weather disruption → 0% penalty
        DUPLICATE_BOOKING,  // Accidental duplicate
        OTHER               // Other reasons
    }

    public enum RefundStatus {
        PENDING,            // Submitted, awaiting review
        APPROVED,           // Admin approved, payment pending
        PROCESSED,          // Payment sent to passenger
        REJECTED            // Rejected — no refund issued
    }

    public Refund() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }

    public String getRefundReference()               { return refundReference; }
    public void setRefundReference(String v)         { this.refundReference = v; }

    public Long getBookingId()                       { return bookingId; }
    public void setBookingId(Long v)                 { this.bookingId = v; }

    public String getBookingReference()              { return bookingReference; }
    public void setBookingReference(String v)        { this.bookingReference = v; }

    public Long getPassengerId()                     { return passengerId; }
    public void setPassengerId(Long v)               { this.passengerId = v; }

    public String getPassengerName()                 { return passengerName; }
    public void setPassengerName(String v)           { this.passengerName = v; }

    public String getPassengerEmail()                { return passengerEmail; }
    public void setPassengerEmail(String v)          { this.passengerEmail = v; }

    public String getFlightNumber()                  { return flightNumber; }
    public void setFlightNumber(String v)            { this.flightNumber = v; }

    public String getFlightRoute()                   { return flightRoute; }
    public void setFlightRoute(String v)             { this.flightRoute = v; }

    public LocalDate getDepartureDate()              { return departureDate; }
    public void setDepartureDate(LocalDate v)        { this.departureDate = v; }

    public String getClassType()                     { return classType; }
    public void setClassType(String v)               { this.classType = v; }

    public Double getOriginalAmount()                { return originalAmount; }
    public void setOriginalAmount(Double v)          { this.originalAmount = v; }

    public Double getPenaltyPercentage()             { return penaltyPercentage; }
    public void setPenaltyPercentage(Double v)       { this.penaltyPercentage = v; }

    public Double getPenaltyAmount()                 { return penaltyAmount; }
    public void setPenaltyAmount(Double v)           { this.penaltyAmount = v; }

    public Double getRefundAmount()                  { return refundAmount; }
    public void setRefundAmount(Double v)            { this.refundAmount = v; }

    public String getPaymentMethod()                 { return paymentMethod; }
    public void setPaymentMethod(String v)           { this.paymentMethod = v; }

    public RefundReason getRefundReason()            { return refundReason; }
    public void setRefundReason(RefundReason v)      { this.refundReason = v; }

    public String getReasonNotes()                   { return reasonNotes; }
    public void setReasonNotes(String v)             { this.reasonNotes = v; }

    public RefundStatus getStatus()                  { return status; }
    public void setStatus(RefundStatus v)            { this.status = v; }

    public LocalDateTime getRequestedAt()            { return requestedAt; }
    public void setRequestedAt(LocalDateTime v)      { this.requestedAt = v; }

    public LocalDateTime getProcessedAt()            { return processedAt; }
    public void setProcessedAt(LocalDateTime v)      { this.processedAt = v; }

    public String getProcessedBy()                   { return processedBy; }
    public void setProcessedBy(String v)             { this.processedBy = v; }
}