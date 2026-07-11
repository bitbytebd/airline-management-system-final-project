package com.cogent.model;

// ═══════════════════════════════════════════════════════════════════
// FILE  : src/main/java/com/cogent/model/LoyaltyTransaction.java
// TABLE : loyalty_transactions  (JPA auto-creates — ddl-auto=update)
// ═══════════════════════════════════════════════════════════════════

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_transactions",
       indexes = {
           @Index(name = "idx_lt_account_id",   columnList = "account_id"),
           @Index(name = "idx_lt_passenger_id", columnList = "passenger_id"),
           @Index(name = "idx_lt_type",         columnList = "transaction_type"),
           @Index(name = "idx_lt_created_at",   columnList = "created_at")
       })
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ── Account Link ─────────────────────────────────────────────
    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(name = "passenger_id", nullable = false)
    private Long passengerId;

    @Column(name = "passenger_name", length = 150)
    private String passengerName;

    @Column(name = "member_number", length = 20)
    private String memberNumber;

    // ── Transaction Details ───────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 20, nullable = false)
    private TransactionType transactionType;

    @Column(name = "points_amount", nullable = false)
    private Integer pointsAmount;              // positive = earned, negative = redeemed/expired

    @Column(name = "balance_after", nullable = false)
    private Integer balanceAfter = 0;          // available points AFTER this transaction

    // ── Source Details ────────────────────────────────────────────
    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_reference", length = 20)
    private String bookingReference;

    @Column(name = "flight_number", length = 20)
    private String flightNumber;

    @Column(name = "flight_route", length = 120)
    private String flightRoute;                // e.g. "Dhaka → Dubai"

    @Column(name = "class_type", length = 30)
    private String classType;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "tier_multiplier")
    private Double tierMultiplier = 1.0;

    // ── Redemption specific ───────────────────────────────────────
    @Column(name = "redemption_value")
    private Double redemptionValue;            // BDT value of redeemed points

    @Column(name = "redemption_reference", length = 30)
    private String redemptionReference;        // e.g. "RED-XXXXXXXX"

    // ── Notes ────────────────────────────────────────────────────
    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "created_by", length = 60)
    private String createdBy;

    // ── Enums ─────────────────────────────────────────────────────
    public enum TransactionType {
        EARNED,         // Points earned from a flight
        REDEEMED,       // Points used for discount
        BONUS,          // Manual bonus award (admin)
        EXPIRED,        // Points that expired
        ADJUSTED,       // Admin correction
        TIER_BONUS      // Bonus for reaching new tier
    }

    public LoyaltyTransaction() {}

    // ── Getters & Setters ────────────────────────────────────────
    public Long getId()                              { return id; }
    public void setId(Long id)                       { this.id = id; }
    public Long getAccountId()                       { return accountId; }
    public void setAccountId(Long v)                 { this.accountId = v; }
    public Long getPassengerId()                     { return passengerId; }
    public void setPassengerId(Long v)               { this.passengerId = v; }
    public String getPassengerName()                 { return passengerName; }
    public void setPassengerName(String v)           { this.passengerName = v; }
    public String getMemberNumber()                  { return memberNumber; }
    public void setMemberNumber(String v)            { this.memberNumber = v; }
    public TransactionType getTransactionType()      { return transactionType; }
    public void setTransactionType(TransactionType v){ this.transactionType = v; }
    public Integer getPointsAmount()                 { return pointsAmount; }
    public void setPointsAmount(Integer v)           { this.pointsAmount = v; }
    public Integer getBalanceAfter()                 { return balanceAfter; }
    public void setBalanceAfter(Integer v)           { this.balanceAfter = v; }
    public Long getBookingId()                       { return bookingId; }
    public void setBookingId(Long v)                 { this.bookingId = v; }
    public String getBookingReference()              { return bookingReference; }
    public void setBookingReference(String v)        { this.bookingReference = v; }
    public String getFlightNumber()                  { return flightNumber; }
    public void setFlightNumber(String v)            { this.flightNumber = v; }
    public String getFlightRoute()                   { return flightRoute; }
    public void setFlightRoute(String v)             { this.flightRoute = v; }
    public String getClassType()                     { return classType; }
    public void setClassType(String v)               { this.classType = v; }
    public Double getDistanceKm()                    { return distanceKm; }
    public void setDistanceKm(Double v)              { this.distanceKm = v; }
    public Double getTierMultiplier()                { return tierMultiplier; }
    public void setTierMultiplier(Double v)          { this.tierMultiplier = v; }
    public Double getRedemptionValue()               { return redemptionValue; }
    public void setRedemptionValue(Double v)         { this.redemptionValue = v; }
    public String getRedemptionReference()           { return redemptionReference; }
    public void setRedemptionReference(String v)     { this.redemptionReference = v; }
    public String getDescription()                   { return description; }
    public void setDescription(String v)             { this.description = v; }
    public LocalDateTime getCreatedAt()              { return createdAt; }
    public void setCreatedAt(LocalDateTime v)        { this.createdAt = v; }
    public String getCreatedBy()                     { return createdBy; }
    public void setCreatedBy(String v)               { this.createdBy = v; }
}