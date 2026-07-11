package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist_entries")
public class WaitlistEntry {

    public enum WaitlistStatus { WAITING, PRIORITY, NOTIFIED, CONFIRMED, CANCELLED, EXPIRED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "waitlist_reference", unique = true, nullable = false, length = 40)
    private String waitlistReference;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_reference")
    private String bookingReference;

    @Column(name = "passenger_id")
    private Long passengerId;

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "passenger_email")
    private String passengerEmail;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "flight_id")
    private Long flightId;

    @Column(name = "flight_number")
    private String flightNumber;

    private String origin;
    private String destination;

    @Column(name = "departure_date")
    private LocalDate departureDate;

    @Column(name = "class_type")
    private String classType;

    @Column(name = "requested_seats")
    private Integer requestedSeats;

    @Column(name = "priority_score")
    private Integer priorityScore;

    @Column(name = "loyalty_tier")
    private String loyaltyTier;

    @Column(name = "fare_offer")
    private Double fareOffer;

    @Column(length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    private WaitlistStatus status;

    @Column(name = "notification_channel")
    private String notificationChannel;

    @Column(name = "last_notified_at")
    private LocalDateTime lastNotifiedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(length = 600)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        if (status == null) status = WaitlistStatus.WAITING;
        if (currency == null || currency.isBlank()) currency = "USD";
        if (requestedSeats == null || requestedSeats < 1) requestedSeats = 1;
        if (priorityScore == null) priorityScore = 50;
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getWaitlistReference() { return waitlistReference; }
    public void setWaitlistReference(String waitlistReference) { this.waitlistReference = waitlistReference; }
    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    public Long getPassengerId() { return passengerId; }
    public void setPassengerId(Long passengerId) { this.passengerId = passengerId; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getPassengerEmail() { return passengerEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Long getFlightId() { return flightId; }
    public void setFlightId(Long flightId) { this.flightId = flightId; }
    public String getFlightNumber() { return flightNumber; }
    public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDate getDepartureDate() { return departureDate; }
    public void setDepartureDate(LocalDate departureDate) { this.departureDate = departureDate; }
    public String getClassType() { return classType; }
    public void setClassType(String classType) { this.classType = classType; }
    public Integer getRequestedSeats() { return requestedSeats; }
    public void setRequestedSeats(Integer requestedSeats) { this.requestedSeats = requestedSeats; }
    public Integer getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Integer priorityScore) { this.priorityScore = priorityScore; }
    public String getLoyaltyTier() { return loyaltyTier; }
    public void setLoyaltyTier(String loyaltyTier) { this.loyaltyTier = loyaltyTier; }
    public Double getFareOffer() { return fareOffer; }
    public void setFareOffer(Double fareOffer) { this.fareOffer = fareOffer; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public WaitlistStatus getStatus() { return status; }
    public void setStatus(WaitlistStatus status) { this.status = status; }
    public String getNotificationChannel() { return notificationChannel; }
    public void setNotificationChannel(String notificationChannel) { this.notificationChannel = notificationChannel; }
    public LocalDateTime getLastNotifiedAt() { return lastNotifiedAt; }
    public void setLastNotifiedAt(LocalDateTime lastNotifiedAt) { this.lastNotifiedAt = lastNotifiedAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
